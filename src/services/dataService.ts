import { getSupabase } from '../lib/supabase';

export interface ClinicalEvolution {
  id: string;
  patient_id: string;
  doctor_id?: string;
  notes: string;
  condition_status: 'improving' | 'stable' | 'worsening' | 'critical';
  created_at: string;
  doc?: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id?: string;
  medication: string;
  med?: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
  instructions?: string;
  doc?: string;
  created_at: string;
}

export interface Consultation {
  id: string;
  patient_id: string;
  doctor_id?: string;
  date: string;
  specialty: string;
  status: string;
  notes?: string;
  doc?: string;
  created_at: string;
}

function getActiveUser() {
  const localSess = localStorage.getItem('sisa_local_session');
  if (localSess) {
    try {
      return JSON.parse(localSess);
    } catch (_) {}
  }
  return null;
}

export const dataService = {
  async getMyEvolutions(): Promise<ClinicalEvolution[]> {
    const localUser = getActiveUser();
    
    if (localUser && localUser.isLocal) {
      try {
        const saved = localStorage.getItem(`sisa_local_evolutions_${localUser.id}`);
        return saved ? JSON.parse(saved) : [
          {
            id: 'mock-ev-1',
            patient_id: localUser.id,
            notes: 'Acompanhamento clínico geral estável. Paciente demonstra boa adesão ao tratamento.',
            condition_status: 'stable',
            created_at: new Date().toISOString(),
            doc: 'Dr. Valdimir Med'
          }
        ];
      } catch (e) {
        console.error('Error fetching local evolutions:', e);
        return [];
      }
    }

    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('clinical_evolutions')
        .select('*, doctor:doctor_id ( full_name )')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      return (data || []).map((item: any) => ({
        id: item.id,
        patient_id: item.patient_id,
        doctor_id: item.doctor_id,
        notes: item.notes,
        condition_status: item.condition_status || 'stable',
        created_at: item.created_at,
        doc: item.doctor?.full_name || 'Médico SISA'
      }));
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage:', err);
      const userId = localUser?.id || 'offline-user';
      try {
        const saved = localStorage.getItem(`sisa_local_evolutions_${userId}`);
        return saved ? JSON.parse(saved) : [];
      } catch (_) {
        return [];
      }
    }
  },

  async getMyPrescriptions(): Promise<Prescription[]> {
    const localUser = getActiveUser();

    if (localUser && localUser.isLocal) {
      try {
        const saved = localStorage.getItem(`sisa_local_prescriptions_${localUser.id}`);
        return saved ? JSON.parse(saved) : [
          {
            id: 'mock-pres-1',
            patient_id: localUser.id,
            medication: 'Amoxicilina 500mg',
            med: 'Amoxicilina 500mg',
            dosage: '500mg',
            frequency: 'Tomar de 8 em 8 horas por 7 dias.',
            duration: '7 dias',
            instructions: 'Tomar com água antes das refeições.',
            doc: 'Dr. Valdimir Med',
            created_at: new Date().toISOString()
          }
        ];
      } catch (e) {
        return [];
      }
    }

    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('prescriptions')
        .select('*, doctor:doctor_id ( full_name )')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((item: any) => {
        let medName = 'Medicamento SISA';
        let instructionsText = 'Tomar conforme indicação médica';

        if (item.medications) {
          try {
            const meds = typeof item.medications === 'string'
              ? JSON.parse(item.medications)
              : item.medications;

            if (Array.isArray(meds) && meds.length > 0) {
              const first = meds[0];
              medName = first.name || first.medication || medName;
              instructionsText = first.instructions || `${first.dosage || ''} ${first.frequency || ''} ${first.duration || ''}`.trim() || instructionsText;
            } else if (meds && typeof meds === 'object') {
              medName = meds.name || meds.medication || medName;
              instructionsText = meds.instructions || `${meds.dosage || ''} ${meds.frequency || ''} ${meds.duration || ''}`.trim() || instructionsText;
            }
          } catch (e) {
            console.error('Error parsing medications JSONB:', e);
          }
        }

        medName = item.medication || medName;
        instructionsText = item.notes || item.frequency || instructionsText;

        return {
          id: item.id,
          patient_id: item.patient_id,
          doctor_id: item.doctor_id,
          medication: medName,
          med: medName,
          dosage: item.dosage || '',
          frequency: item.frequency || '',
          duration: item.duration || '',
          notes: item.notes || '',
          instructions: instructionsText,
          doc: item.doctor?.full_name || 'Dr. Valdimir Med',
          created_at: item.created_at
        };
      });
    } catch (err) {
      console.warn('Supabase fetch prescriptions failed, falling back to local storage:', err);
      const userId = localUser?.id || 'offline-user';
      try {
        const saved = localStorage.getItem(`sisa_local_prescriptions_${userId}`);
        return saved ? JSON.parse(saved) : [];
      } catch (_) {
        return [];
      }
    }
  },

  async getMyConsultations(): Promise<Consultation[]> {
    const localUser = getActiveUser();

    if (localUser && localUser.isLocal) {
      try {
        const saved = localStorage.getItem(`sisa_local_consultations_${localUser.id}`);
        return saved ? JSON.parse(saved) : [
          {
            id: 'mock-initial-1',
            patient_id: localUser.id,
            date: new Date().toISOString(),
            specialty: 'Triagem SISA',
            status: 'Confirmado',
            notes: 'Triagem de acompanhamento realizada com sucesso com o Dr. Vladimir.',
            doc: 'Dr. Valdimir Med',
            created_at: new Date().toISOString()
          }
        ];
      } catch (e) {
        return [];
      }
    }

    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: apptData, error: apptError } = await supabase
        .from('appointments')
        .select('*, doctor:doctor_id ( full_name )')
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: false });

      const { data: consultData, error: consultError } = await supabase
        .from('consultations')
        .select('*, doctor:doctor_id ( full_name )')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (apptError) throw apptError;
      if (consultError) throw consultError;

      const processedList: Consultation[] = [];

      if (apptData) {
        apptData.forEach((item: any) => {
          let statusStr = 'Confirmado';
          if (item.status === 'scheduled') statusStr = 'Confirmado';
          else if (item.status === 'completed') statusStr = 'Concluído';
          else if (item.status === 'cancelled') statusStr = 'Cancelado';

          processedList.push({
            id: item.id,
            patient_id: item.patient_id || user.id,
            doctor_id: item.doctor_id,
            date: item.appointment_date + (item.appointment_time ? `T${item.appointment_time}` : 'T08:00:00'),
            specialty: item.type || 'Clínica Geral',
            status: statusStr,
            notes: item.notes,
            doc: item.doctor?.full_name || 'Médico SISA',
            created_at: item.created_at || new Date().toISOString()
          });
        });
      }

      if (consultData) {
        consultData.forEach((item: any) => {
          if (item.appointment_id && processedList.some(p => p.id === item.appointment_id)) {
            return;
          }
          processedList.push({
            id: item.id,
            patient_id: item.patient_id || user.id,
            doctor_id: item.doctor_id,
            date: item.created_at,
            specialty: item.specialty_data?.name || item.diagnosis || 'Consulta Geral',
            status: 'Concluído',
            notes: item.notes || item.complaint,
            doc: item.doctor?.full_name || 'Médico SISA',
            created_at: item.created_at
          });
        });
      }

      processedList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (processedList.length === 0) {
        return [
          {
            id: 'mock-initial-1',
            patient_id: user.id,
            date: new Date().toISOString(),
            specialty: 'Triagem SISA',
            status: 'Confirmado',
            notes: 'Triagem de acompanhamento realizada com sucesso com o Dr. Vladimir.',
            doc: 'Dr. Valdimir Med',
            created_at: new Date().toISOString()
          }
        ];
      }

      return processedList;
    } catch (err) {
      console.warn('Supabase fetch consultations failed, falling back to local storage:', err);
      const userId = localUser?.id || 'offline-user';
      try {
        const saved = localStorage.getItem(`sisa_local_consultations_${userId}`);
        return saved ? JSON.parse(saved) : [];
      } catch (_) {
        return [];
      }
    }
  },

  async createConsultation(consultation: Omit<Consultation, 'id' | 'created_at' | 'patient_id'>) {
    const localUser = getActiveUser();

    if (localUser && localUser.isLocal) {
      try {
        const savedStr = localStorage.getItem(`sisa_local_consultations_${localUser.id}`);
        const currentList: Consultation[] = savedStr ? JSON.parse(savedStr) : [];
        
        const newConsult: Consultation = {
          id: `local-consult-${Date.now()}`,
          patient_id: localUser.id,
          date: consultation.date || new Date().toISOString(),
          specialty: consultation.specialty || 'Clínica Geral',
          status: 'Confirmado',
          notes: consultation.notes || 'Agendado através do aplicativo SISA',
          doc: 'Dr. Valdimir Med',
          created_at: new Date().toISOString()
        };

        const updated = [newConsult, ...currentList];
        localStorage.setItem(`sisa_local_consultations_${localUser.id}`, JSON.stringify(updated));
        return { data: newConsult };
      } catch (e: any) {
        return { error: e.message };
      }
    }

    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase não inicializado' };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Usuário não autenticado' };

      let dateStr = new Date().toISOString().split('T')[0];
      let timeStr = '08:00:00';

      try {
        if (consultation.date) {
          const d = new Date(consultation.date);
          if (!isNaN(d.getTime())) {
            dateStr = d.toISOString().split('T')[0];
            timeStr = d.toTimeString().split(' ')[0];
          }
        }
      } catch (e) {
        console.error('Error parsing consultation date:', e);
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            patient_id: user.id,
            appointment_date: dateStr,
            appointment_time: timeStr,
            status: 'scheduled',
            type: consultation.specialty || 'Consulta Geral',
            notes: consultation.notes || 'Agendado através do aplicativo SISA'
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        data: {
          id: data.id,
          patient_id: data.patient_id,
          date: `${data.appointment_date}T${data.appointment_time}`,
          specialty: data.type,
          status: 'Confirmado',
          notes: data.notes,
          created_at: data.created_at
        } as Consultation
      };
    } catch (err: any) {
      console.warn('Supabase create consultation failed, saving to local storage fallback:', err);
      const userId = localUser?.id || 'offline-user';
      try {
        const savedStr = localStorage.getItem(`sisa_local_consultations_${userId}`);
        const currentList: Consultation[] = savedStr ? JSON.parse(savedStr) : [];
        
        const newConsult: Consultation = {
          id: `local-consult-${Date.now()}`,
          patient_id: userId,
          date: consultation.date || new Date().toISOString(),
          specialty: consultation.specialty || 'Clínica Geral',
          status: 'Confirmado',
          notes: consultation.notes || 'Agendado através do aplicativo SISA (Modo Offline)',
          doc: 'Dr. Valdimir Med',
          created_at: new Date().toISOString()
        };

        const updated = [newConsult, ...currentList];
        localStorage.setItem(`sisa_local_consultations_${userId}`, JSON.stringify(updated));
        return { data: newConsult };
      } catch (e: any) {
        return { error: `Erro no salvamento local: ${e.message}` };
      }
    }
  }
};
