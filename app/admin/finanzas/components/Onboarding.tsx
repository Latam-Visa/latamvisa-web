'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Onboarding({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    meta_nombre: initialData?.meta_nombre || '',
    meta_monto_objetivo: initialData?.meta_monto_objetivo || '',
    meta_fecha: initialData?.meta_fecha || '2026-09-16',
    ingreso_mensual_aprox: initialData?.ingreso_mensual_aprox || '',
    gastos_fijos_aprox: initialData?.gastos_fijos_aprox || '',
    numero_supervivencia: initialData?.numero_supervivencia || '',
    porcentaje_ahorro: initialData?.porcentaje_ahorro || 30
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const onSubmit = async () => {
    setLoading(true);
    try {
      const parsedData = {
        ...formData,
        meta_monto_objetivo: Number(formData.meta_monto_objetivo),
        ingreso_mensual_aprox: Number(formData.ingreso_mensual_aprox),
        gastos_fijos_aprox: Number(formData.gastos_fijos_aprox),
        numero_supervivencia: Number(formData.numero_supervivencia),
        porcentaje_ahorro: Number(formData.porcentaje_ahorro),
      };

      const res = await fetch('/api/finanzas/perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
      });
      if (!res.ok) throw new Error('Error saving profile');
      
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Error guardando perfil');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white p-8 rounded-2xl shadow-sm border border-[#E5E5E5]">
      <div className="mb-8">
        <h1 className="text-2xl font-[PPMonumentExtended] mb-2">Configura tus Finanzas</h1>
        <p className="text-[#525252]">
          Paso {step} de 3
        </p>
        <div className="h-1 bg-[#F5F5F5] mt-4 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#C8FF00] transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Meta Principal</h2>
              <div>
                <label className="block text-sm text-[#525252] mb-1">Nombre de la meta</label>
                <input required type="text" name="meta_nombre" value={formData.meta_nombre} onChange={handleChange} className="w-full border border-[#E5E5E5] rounded-lg p-3 outline-none focus:border-[#C8FF00]" placeholder="Ej. Ahorro para visa" />
              </div>
              <div>
                <label className="block text-sm text-[#525252] mb-1">Monto Objetivo (AUD)</label>
                <input required type="number" name="meta_monto_objetivo" value={formData.meta_monto_objetivo} onChange={handleChange} className="w-full border border-[#E5E5E5] rounded-lg p-3 outline-none focus:border-[#C8FF00]" placeholder="10000" />
              </div>
              <div>
                <label className="block text-sm text-[#525252] mb-1">Fecha Límite</label>
                <input required type="date" name="meta_fecha" value={formData.meta_fecha} onChange={handleChange} className="w-full border border-[#E5E5E5] rounded-lg p-3 outline-none focus:border-[#C8FF00]" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Realidad Actual (Mensual)</h2>
              <div>
                <label className="block text-sm text-[#525252] mb-1">Ingreso Mensual Aprox. (AUD)</label>
                <input required type="number" name="ingreso_mensual_aprox" value={formData.ingreso_mensual_aprox} onChange={handleChange} className="w-full border border-[#E5E5E5] rounded-lg p-3 outline-none focus:border-[#C8FF00]" placeholder="5000" />
              </div>
              <div>
                <label className="block text-sm text-[#525252] mb-1">Gastos Fijos Aprox. (AUD)</label>
                <input required type="number" name="gastos_fijos_aprox" value={formData.gastos_fijos_aprox} onChange={handleChange} className="w-full border border-[#E5E5E5] rounded-lg p-3 outline-none focus:border-[#C8FF00]" placeholder="2000" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Reglas de Juego</h2>
              <div>
                <label className="block text-sm text-[#525252] mb-1">Número de Supervivencia (AUD)</label>
                <p className="text-xs text-[#A3A3A3] mb-2">Lo mínimo indispensable para vivir al mes sin lujos.</p>
                <input required type="number" name="numero_supervivencia" value={formData.numero_supervivencia} onChange={handleChange} className="w-full border border-[#E5E5E5] rounded-lg p-3 outline-none focus:border-[#C8FF00]" placeholder="2500" />
              </div>
              <div>
                <label className="block text-sm text-[#525252] mb-1">Porcentaje de Ahorro (%)</label>
                <p className="text-xs text-[#A3A3A3] mb-2">% de todo ingreso por encima del número de supervivencia que va directo a ahorro.</p>
                <input required type="number" name="porcentaje_ahorro" value={formData.porcentaje_ahorro} onChange={handleChange} className="w-full border border-[#E5E5E5] rounded-lg p-3 outline-none focus:border-[#C8FF00]" />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8 pt-6 border-t border-[#E5E5E5]">
        <button 
          onClick={prevStep}
          disabled={step === 1 || loading}
          className="px-6 py-2 rounded-full font-medium text-[#525252] disabled:opacity-30"
        >
          Atrás
        </button>
        
        {step < 3 ? (
          <button 
            onClick={nextStep}
            className="px-6 py-2 rounded-full font-medium bg-[#C8FF00] text-[#0A0A0A] hover:bg-[#b3e600] transition-colors"
          >
            Siguiente
          </button>
        ) : (
          <button 
            onClick={onSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-full font-medium bg-[#C8FF00] text-[#0A0A0A] hover:bg-[#b3e600] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Guardando...' : 'Comenzar'}
          </button>
        )}
      </div>
    </div>
  );
}
