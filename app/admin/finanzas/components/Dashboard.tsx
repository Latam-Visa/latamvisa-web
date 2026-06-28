'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { FinanzasPerfil, FinanzasReporte, FinanzasTransaccion } from '@/lib/finanzas/types';
import { format } from 'date-fns';

const COLORS = ['#C8FF00', '#2F4A00', '#0A0A0A', '#525252', '#A3A3A3', '#E5E5E5', '#FAFAF7', '#1A1A1A'];

export default function Dashboard({ 
  perfil, 
  reportes, 
  initialTransactions, 
  initialMes 
}: { 
  perfil: FinanzasPerfil, 
  reportes: FinanzasReporte[], 
  initialTransactions: FinanzasTransaccion[],
  initialMes: string
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mes, setMes] = useState(initialMes);
  const [txs, setTxs] = useState(initialTransactions);

  // Fetch transactions when mes changes
  useEffect(() => {
    if (mes !== initialMes) {
      fetch(`/api/finanzas/transacciones?mes=${mes}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTxs(data.transacciones);
          }
        })
        .catch(console.error);
    } else {
      setTxs(initialTransactions);
    }
  }, [mes, initialMes, initialTransactions]);

  const curReport = reportes.find(r => r.mes === mes);

  // Compute stats for charts
  const barData = curReport ? [
    { name: 'Personal', Gasto: curReport.total_gasto_personal },
    { name: 'Negocio', Gasto: curReport.total_gasto_negocio }
  ] : [];

  const pieDataMap: Record<string, number> = {};
  txs.filter(t => t.tipo === 'gasto' && t.grupo === 'personal').forEach(t => {
    pieDataMap[t.categoria] = (pieDataMap[t.categoria] || 0) + Math.abs(t.monto);
  });
  const pieData = Object.entries(pieDataMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8
  
  if (Object.keys(pieDataMap).length > 8) {
    const otros = Object.entries(pieDataMap).sort((a, b) => b[1] - a[1]).slice(8).reduce((acc, curr) => acc + curr[1], 0);
    pieData.push({ name: 'Otros', value: otros });
  }

  const lineData = reportes.map(r => ({
    mes: r.mes,
    Ahorro: r.ahorro_real
  }));

  const recurrentesMap: Record<string, number> = {};
  txs.filter(t => t.es_recurrente && t.tipo === 'gasto').forEach(t => {
    const key = `${t.categoria} | ${t.descripcion}`;
    recurrentesMap[key] = (recurrentesMap[key] || 0) + Math.abs(t.monto);
  });
  const recurrentesList = Object.entries(recurrentesMap).map(([key, amount]) => {
    const [categoria, desc] = key.split(' | ');
    return { categoria, desc, amount };
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const res = await fetch('/api/finanzas/import', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert(`Importadas: ${data.summary.insertadas}\nSaltadas: ${data.summary.duplicadas_saltadas}\nPor IA: ${data.summary.clasificadas_por_ia}`);
      
      // We assume the import was for the current month roughly, so we re-generate the report for current month if possible
      // Actually we should trigger a report compute for whatever months were imported. For now we assume recent month.
      const dateStr = new Date().toISOString().slice(0,7);
      await fetch(`/api/finanzas/reporte?mes=${dateStr}`, { method: 'POST' });
      
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTx = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/finanzas/transaccion/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Error al actualizar');
      setTxs(prev => prev.map(t => t.id === id ? { ...t, ...updates, clasificado_por: 'manual' } : t));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateRule = async (tx: FinanzasTransaccion) => {
    const patron = prompt('Ingresa un patrón único (substring de la descripción) para esta regla:', tx.descripcion);
    if (!patron) return;

    try {
      const res = await fetch('/api/finanzas/regla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patron,
          categoria: tx.categoria,
          tipo: tx.tipo,
          grupo: tx.grupo,
          es_recurrente: tx.es_recurrente
        })
      });
      if (!res.ok) throw new Error('Error al crear regla');
      alert('Regla creada exitosamente. Se aplicará a futuros imports.');
    } catch(err: any) {
      alert(err.message);
    }
  }

  // Calculate meta progress
  const diffTime = Math.abs(new Date(perfil.meta_fecha).getTime() - new Date().getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const totalAhorrado = reportes.reduce((acc, r) => acc + r.ahorro_real, 0);
  const pctMeta = Math.min(100, Math.max(0, (totalAhorrado / perfil.meta_monto_objetivo) * 100));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-[PPMonumentExtended]">Finanzas LATAM VISA</h1>
          <p className="text-[#525252]">Dashboard Privado</p>
        </div>
        <div className="flex gap-4">
          <label className="bg-[#C8FF00] hover:bg-[#b3e600] text-[#0A0A0A] px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors text-sm flex items-center">
            {loading ? 'Procesando...' : 'Importar Transacciones (CSV)'}
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={loading} />
          </label>
        </div>
      </div>

      {/* Narrativa */}
      {curReport?.narrativa && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E5E5]">
          <p className="text-lg text-[#0A0A0A] font-medium italic">" {curReport.narrativa} "</p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Ingreso Real" amount={curReport?.ingreso_total_real || 0} />
        <KPICard title="Gasto Total" amount={curReport?.gasto_total || 0} />
        <KPICard title="Ahorro Real" amount={curReport?.ahorro_real || 0} />
        <KPICard title="Ahorro Sugerido" amount={curReport?.ahorro_sugerido || 0} />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E5E5]">
        <h3 className="text-sm font-medium text-[#525252] mb-2">Progreso hacia la meta ({perfil.meta_nombre})</h3>
        <div className="flex justify-between items-end mb-2">
          <span className="text-2xl font-bold">${totalAhorrado.toFixed(2)} <span className="text-sm text-[#A3A3A3] font-normal">/ ${perfil.meta_monto_objetivo}</span></span>
          <span className="text-sm text-[#525252]">Faltan {diffDays} días</span>
        </div>
        <div className="h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
          <div className="h-full bg-[#C8FF00] transition-all" style={{ width: `${pctMeta}%` }} />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E5E5] lg:col-span-1 h-[300px]">
          <h3 className="text-sm font-medium text-[#525252] mb-4">Gasto Personal vs Negocio</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
              <YAxis fontSize={12} axisLine={false} tickLine={false} />
              <RechartsTooltip cursor={{fill: '#F5F5F5'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="Gasto" fill="#2F4A00" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E5E5] lg:col-span-1 h-[300px]">
          <h3 className="text-sm font-medium text-[#525252] mb-4">Gastos Personales (Top)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E5E5] lg:col-span-1 h-[300px]">
          <h3 className="text-sm font-medium text-[#525252] mb-4">Tendencia Ahorro Real</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <XAxis dataKey="mes" fontSize={12} axisLine={false} tickLine={false} />
              <YAxis fontSize={12} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="Ahorro" stroke="#C8FF00" strokeWidth={3} dot={{r:4, fill:'#C8FF00', strokeWidth:0}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recurrentes Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E5E5] lg:col-span-1">
          <h3 className="text-sm font-medium text-[#525252] mb-4">Suscripciones Recurrentes</h3>
          <div className="space-y-4">
            {recurrentesList.map((r, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium truncate max-w-[150px]">{r.desc}</p>
                  <p className="text-xs text-[#A3A3A3]">{r.categoria}</p>
                </div>
                <span className="font-medium text-[#2F4A00]">${r.amount.toFixed(2)}</span>
              </div>
            ))}
            {recurrentesList.length === 0 && <p className="text-sm text-[#A3A3A3]">No hay suscripciones.</p>}
          </div>
        </div>

        {/* Transacciones Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E5E5] lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-[#525252]">Transacciones ({mes})</h3>
            <select className="text-sm border border-[#E5E5E5] rounded-md p-1" value={mes} onChange={(e) => {
              setMes(e.target.value);
              router.refresh();
            }}>
              {reportes.map(r => <option key={r.mes} value={r.mes}>{r.mes}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[#A3A3A3] border-b border-[#E5E5E5]">
                <tr>
                  <th className="pb-2 font-medium">Fecha</th>
                  <th className="pb-2 font-medium">Descripción</th>
                  <th className="pb-2 font-medium">Monto</th>
                  <th className="pb-2 font-medium">Categoría</th>
                  <th className="pb-2 font-medium">Tipo/Grupo</th>
                  <th className="pb-2 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {txs.map(t => (
                  <tr key={t.id} className="border-b border-[#F5F5F5] hover:bg-[#FAFAF7] transition-colors">
                    <td className="py-3 whitespace-nowrap">{t.fecha}</td>
                    <td className="py-3 max-w-[200px] truncate" title={t.descripcion}>{t.descripcion}</td>
                    <td className={`py-3 font-medium ${t.monto > 0 ? 'text-[#2F4A00]' : 'text-[#0A0A0A]'}`}>{t.monto.toFixed(2)}</td>
                    <td className="py-3">
                      <input 
                        className="border border-[#E5E5E5] rounded p-1 w-full max-w-[120px] text-xs focus:border-[#C8FF00] outline-none" 
                        value={t.categoria} 
                        onChange={e => handleUpdateTx(t.id, { categoria: e.target.value })} 
                      />
                    </td>
                    <td className="py-3">
                      <select className="border border-[#E5E5E5] rounded p-1 text-xs outline-none" value={`${t.tipo}|${t.grupo}`} onChange={e => {
                        const [tipo, grupo] = e.target.value.split('|');
                        handleUpdateTx(t.id, { tipo, grupo });
                      }}>
                        <option value="ingreso|negocio">Ingreso Negocio</option>
                        <option value="ingreso|personal">Ingreso Personal</option>
                        <option value="ingreso|na">Ingreso N/A</option>
                        <option value="gasto|negocio">Gasto Negocio</option>
                        <option value="gasto|personal">Gasto Personal</option>
                        <option value="gasto|na">Gasto N/A</option>
                        <option value="transferencia_interna|na">Transferencia Interna</option>
                        <option value="reembolso|na">Reembolso</option>
                      </select>
                    </td>
                    <td className="py-3">
                      <button onClick={() => handleCreateRule(t)} className="text-xs text-[#2F4A00] hover:underline">
                        Regla
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, amount }: { title: string, amount: number }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E5E5]">
      <h3 className="text-[#A3A3A3] text-sm font-medium mb-2">{title}</h3>
      <p className="text-3xl font-bold">${amount.toFixed(2)}</p>
    </div>
  );
}
