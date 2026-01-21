# M5 Sales Forecasting

Este proyecto es una solución integral para el pronóstico de ventas basada en el conjunto de datos de la competencia **M5 de Kaggle (Walmart)**. El repositorio incluye desde el análisis exploratorio de datos (EDA) y el entrenamiento de modelos de Machine Learning hasta una interfaz web para visualizar los resultados.

## 🚀 Características del Proyecto

* **Análisis de Datos (EDA):** Notebooks detallados con el preprocesamiento de series temporales y pruebas de algoritmos.
* **Modelo Predictivo:** Implementación de un modelo basado en **LightGBM** para predecir la demanda.
* **Backend API:** Servidor en Python (`app.py`) diseñado para cargar el modelo entrenado y servir predicciones.
* **Frontend Web:** Aplicación moderna ubicada en el directorio `FrontEnd/` para interactuar con los datos.

## 📁 Estructura del Repositorio

* `EDA y pruebas de modelo m5-forecasting.ipynb`: Notebook principal con el flujo de ciencia de datos.
* `app.py`: Punto de entrada para el servicio backend.
* `modelo_lgbm.txt`: El modelo LightGBM guardado y listo para producción.
* `FrontEnd/m5-front/`: Directorio que contiene la aplicación frontend (desarrollada en React).
* `requirements.txt`: Lista de librerías de Python necesarias para ejecutar el proyecto.
* `pruebas.ipynb`: Notebook auxiliar para pruebas rápidas y debugging.

## 🛠️ Tecnologías Utilizadas

* **Lenguajes:** Python (93.8%), JavaScript (Frontend).
* **Machine Learning:** LightGBM, Pandas, Scikit-learn, NumPy.
* **Backend:** Python (FastAPI/Flask).
* **Frontend:** React (identificado por `package.json`).

## 🔧 Instalación y Configuración

### 1. Preparación del Backend

Se recomienda el uso de un entorno virtual:

```bash
# Clonar el repositorio
git clone https://github.com/elmamuelo/m5-forecasting.git
cd m5-forecasting

# Configurar entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows usa: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar el servidor
python app.py

```

### 2. Preparación del Frontend

```bash
cd FrontEnd/m5-front
npm install
npm start

```

## 📊 Datos Utilizados

El proyecto utiliza los datos de la competencia **M5 Forecasting - Accuracy**, los cuales incluyen el historial de ventas por unidad de diversos productos de Walmart, así como variables exógenas (precios, eventos especiales, días festivos).

