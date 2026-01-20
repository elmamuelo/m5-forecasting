import uvicorn
import lightgbm as lgb
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from fastapi.middleware.cors import CORSMiddleware

class PredictRequest(BaseModel):
    date: str  
    store_id: str
    item_id: str

app = FastAPI(title="M5 Forecasting API")

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Cargar el modelo
model = lgb.Booster(model_file='modelo_lgbm.txt')

# Obtener los nombres de los features que el modelo espera (por si el orden manual falla)
# Esto garantiza que X tenga exactamente el orden del entrenamiento
model_features = model.feature_name()

# Configuración de la base de datos
engine = create_engine('mysql+mysqlconnector://root:@localhost/m5-forecast')

# Listas de variables
categorical_features = [
    'dept_id', 'cat_id', 'store_id', 'state_id', 
    'event_name_1', 'event_type_1', 'event_name_2', 'event_type_2'
]
numeric_features = [
    'wm_yr_wk', 'snap_CA', 'snap_TX', 'snap_WI', 
    'sell_price', 'dias_desde_ultima_compra', 'promedio_dias_entre_compras', 'promedio_cantidad'
]

@app.get("/")
def health_check():
    return {"status": "online", "project": "M5-Forecasting"}

@app.post("/predict")
def predict(request: PredictRequest):
    query = text("""
        WITH compras_extendidas AS (
            SELECT 
                s.item_id, s.dept_id, s.cat_id, s.store_id, s.state_id, s.d, 
                c.date, c.wm_yr_wk, c.event_name_1, c.event_type_1, 
                c.event_name_2, c.event_type_2, c.snap_CA, c.snap_TX, c.snap_WI, 
                sp.sell_price, s.sales
            FROM sales s 
            INNER JOIN calendar c ON s.d = c.d
            INNER JOIN sell_prices sp ON s.item_id = sp.item_id 
                AND sp.store_id = s.store_id 
                AND sp.wm_yr_wk = c.wm_yr_wk
            WHERE s.store_id = :store_id AND s.item_id = :item_id
        ),
        calculos_temporales AS (
            SELECT 
                *,
                LAG(date) OVER (PARTITION BY item_id, store_id ORDER BY date) as fecha_venta_anterior
            FROM compras_extendidas
            WHERE sales > 0 
        ),
        features_completos AS (
            SELECT 
                *,
                DATEDIFF(date, fecha_venta_anterior) AS dias_desde_ultima_compra,
                AVG(DATEDIFF(date, fecha_venta_anterior)) OVER (PARTITION BY item_id, store_id) AS promedio_dias_entre_compras,
                AVG(sales) OVER (PARTITION BY item_id, store_id) AS promedio_cantidad
            FROM calculos_temporales
        )
        SELECT * FROM features_completos WHERE date = :date
    """)

    try:
        with engine.connect() as conn:
            df = pd.read_sql(query, conn, params={
                "date": request.date, 
                "store_id": request.store_id,
                "item_id": request.item_id
            })
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No hay datos históricos suficientes para generar features.")

        # --- PREPROCESAMIENTO ---
        
        # 1. Limpieza inicial
        df['dias_desde_ultima_compra'] = df['dias_desde_ultima_compra'].fillna(0)
        
        # 2. Asegurar que todas las columnas categóricas existan (evita errores de columnas faltantes)
        for col in categorical_features:
            if col not in df.columns:
                df[col] = "None"
            # IMPORTANTE: Convertir a tipo 'category' para LightGBM
            df[col] = df[col].astype('category')

        # 3. Asegurar que las numéricas sean correctas
        for col in numeric_features:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

        # 4. ALINEACIÓN CRUCIAL: Reordenar las columnas según el modelo
        # Usamos model_features para garantizar que el orden sea IDÉNTICO al entrenamiento
        try:
            X = df[model_features]
        except KeyError as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Faltan columnas requeridas por el modelo: {str(e)}"
            )

        # 5. Inferencia
        prediction = model.predict(X)
        
        return {
            "item_id": request.item_id,
            "date": request.date,
            "prediction": float(prediction[0]),
            "status": "success"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)