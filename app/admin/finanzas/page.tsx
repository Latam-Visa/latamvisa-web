import { redirect } from 'next/navigation';
import { getServiceSupabase } from '@/lib/supabase';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';

export const dynamic = 'force-dynamic';

export default async function FinanzasPage() {
  const supabase = getServiceSupabase();
  const { data: perfil, error } = await supabase.from('finanzas_perfil').select('*').eq('id', 1).single();

  if (error && error.code !== 'PGRST116') {
    // If not found (PGRST116), we can create it in Onboarding or handle it.
    // If other error, log it.
    console.error('Finanzas Perfil Fetch Error:', error);
  }

  const needsOnboarding = !perfil || !perfil.onboarding_completo;

  if (needsOnboarding) {
    return <Onboarding initialData={perfil} />;
  }

  // Fetch reportes
  const { data: reportesData } = await supabase.from('finanzas_reportes').select('*').order('mes', { ascending: true });
  
  // Fetch transactions for the most recent month if there's any report
  let transacciones = [];
  let currentMes = '';
  if (reportesData && reportesData.length > 0) {
    currentMes = reportesData[reportesData.length - 1].mes;
    const { data: txData } = await supabase.from('finanzas_transacciones').select('*').eq('mes_origen', currentMes).order('fecha', { ascending: false });
    transacciones = txData || [];
  }

  return (
    <Dashboard 
      perfil={perfil} 
      reportes={reportesData || []} 
      initialTransactions={transacciones} 
      initialMes={currentMes}
    />
  );
}
