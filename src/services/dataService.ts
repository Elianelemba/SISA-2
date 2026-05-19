import { getSupabase } from '../lib/supabase';

export interface ClinicalEvolution {
  id: string;
  patient_id: string;
  doctor_id?: string;
  notes: string;
  condition_status: 'improving' | 'stable' | 'worsening' | 'critical';
  created_at: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id?: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
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
  created_at: string;
}

export const dataService = {
  async getMyEvolutions() {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('clinical_evolutions')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching evolutions:', error);
      return [];
    }
    return data as ClinicalEvolution[];
  },

  async getMyPrescriptions() {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prescriptions:', error);
      return [];
    }
    return data as Prescription[];
  },

  async getMyConsultations() {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('patient_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching consultations:', error);
      return [];
    }
    return data as Consultation[];
  },

  async createConsultation(consultation: Omit<Consultation, 'id' | 'created_at' | 'patient_id'>) {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase not initialized' };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'User not authenticated' };

    const { data, error } = await supabase
      .from('consultations')
      .insert([
        {
          ...consultation,
          patient_id: user.id
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating consultation:', error);
      return { error: error.message };
    }
    return { data: data as Consultation };
  }
};
