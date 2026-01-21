import React, { useState, useEffect } from 'react';
import { LineChart, Calendar, Store, Tag, Play, AlertCircle, CheckCircle2 } from 'lucide-react';

const ForecastUI = () => {
  const [formData, setFormData] = useState({ item_id: '', store_id: '', date: '' });
  const [items, setItems] = useState([]); 
  const [stores, setStores] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [itemsRes, storesRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/items'),
          fetch('http://127.0.0.1:8000/stores')
        ]);
        const itemsData = await itemsRes.json();
        const storesData = await storesRes.json();
        
        setItems(itemsData);
        setStores(storesData);
        
        // Establecer valores por defecto para que no estén vacíos
        if (itemsData.length > 0) setFormData(prev => ({ ...prev, item_id: itemsData[0] }));
        if (storesData.length > 0) setFormData(prev => ({ ...prev, store_id: storesData[0] }));
      } catch (err) {
        console.error("Error cargando opciones:", err);
      }
    };
    fetchOptions();
  }, []);
  
  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Error al conectar con el modelo');
      const data = await response.json();
      setPrediction(data.prediction);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <LineChart size={28} />
            <h1 className="text-xl font-bold tracking-tight">M5 Sales Predictor</h1>
          </div>
          <p className="text-blue-100 text-sm">Pronóstico de demanda basado en LightGBM</p>
        </div>

        <form onSubmit={handlePredict} className="p-6 space-y-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Tag size={16} className="text-blue-600" />
                Seleccionar Artículo
              </label>
              <select 
                value={formData.item_id}
                onChange={(e) => setFormData({...formData, item_id: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {items.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Store size={16} className="text-blue-600" />
                Seleccionar Tienda
              </label>
              <select 
                value={formData.store_id}
                onChange={(e) => setFormData({...formData, store_id: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {stores.map(store => (
                  <option key={store} value={store}>{store}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
                <Calendar size={16} /> Fecha de Predicción
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <> <Play size={18} fill="currentColor" /> Obtener Predicción </>
            )}
          </button>
        </form>

        {/* Resultados / Errores */}
        <div className="px-6 pb-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {prediction !== null && (
            <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
              <div className="flex justify-center mb-2 text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-emerald-800 text-sm font-medium uppercase tracking-wider">Demanda Estimada</p>
              <h2 className="text-4xl font-black text-emerald-600 mt-1">
                {(prediction*100).toFixed(2)}% <span className="text-lg font-normal">probabilidad de compra</span>
              </h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForecastUI;