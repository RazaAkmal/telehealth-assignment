export type Database = {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          date_of_birth: string
          phone_number: string | null
          email: string | null
          address: string | null
          medical_history: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          date_of_birth: string
          phone_number?: string | null
          email?: string | null
          address?: string | null
          medical_history?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          phone_number?: string | null
          email?: string | null
          address?: string | null
          medical_history?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          patient_id: string
          doctor_name: string
          booking_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_name: string
          booking_date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_name?: string
          booking_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      telehealth_queue: {
        Row: {
          booking_id: string
          patient_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          phone_number: string | null
          doctor_name: string
          booking_date: string
          queue_status: string
          check_in_time: string | null
          consultation_start_time: string | null
          consultation_end_time: string | null
          notes: string | null
          provider_notes: string | null
          medical_history: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          patient_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          phone_number?: string | null
          doctor_name: string
          booking_date: string
          queue_status: string
          check_in_time?: string | null
          consultation_start_time?: string | null
          consultation_end_time?: string | null
          notes?: string | null
          provider_notes?: string | null
          medical_history?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          patient_id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          phone_number?: string | null
          doctor_name?: string
          booking_date?: string
          queue_status?: string
          check_in_time?: string | null
          consultation_start_time?: string | null
          consultation_end_time?: string | null
          notes?: string | null
          provider_notes?: string | null
          medical_history?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_booking_status: {
        Args: {
          booking_id: string
          new_status: string
          notes?: string | null
        }
        Returns: {
          booking_id: string
          patient_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          phone_number: string | null
          doctor_name: string
          booking_date: string
          queue_status: string
          check_in_time: string | null
          consultation_start_time: string | null
          consultation_end_time: string | null
          notes: string | null
          provider_notes: string | null
          medical_history: string | null
          created_at: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
