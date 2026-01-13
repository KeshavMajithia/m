import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Export database types for TypeScript
export type Tables = {
  bookings: {
    Row: {
      id: string;
      booking_id: string;
      created_at: string;
      customer_name: string;
      customer_phone: string;
      customer_aadhar?: string;
      customer_pan?: string;
      destination_country: string;
      parcel_weight: number;
      selected_courier: string;
      selected_service: string;
      base_price: number;
      price_to_customer: number;
      our_cost: number;
      status: 'Booked' | 'In Transit' | 'Delivered' | 'Cancelled';
      tracking_number?: string;
      notes?: string;
    };
    Insert: {
      id?: string;
      booking_id: string;
      created_at?: string;
      customer_name: string;
      customer_phone: string;
      customer_aadhar?: string;
      customer_pan?: string;
      destination_country: string;
      parcel_weight: number;
      selected_courier: string;
      selected_service: string;
      base_price: number;
      price_to_customer: number;
      our_cost: number;
      status: 'Booked' | 'In Transit' | 'Delivered' | 'Cancelled';
      tracking_number?: string;
      notes?: string;
    };
    Update: {
      id?: string;
      created_at?: string;
      customer_name?: string;
      customer_phone?: string;
      customer_aadhar?: string;
      customer_pan?: string;
      destination_country?: string;
      parcel_weight?: number;
      selected_courier?: string;
      selected_service?: string;
      base_price?: number;
      price_to_customer?: number;
      our_cost?: number;
      status?: 'Booked' | 'In Transit' | 'Delivered' | 'Cancelled';
      tracking_number?: string;
      notes?: string;
    };
  };
  courier_rates: {
    Row: {
      id: string;
      carrier: string;
      service_type: string;
      location_key: string;
      weight_start: number;
      weight_end: number;
      rate: number;
      is_per_kg: boolean;
      created_at: string;
    };
  };
  zone_mappings: {
    Row: {
      id: string;
      carrier: string;
      country: string;
      zone: string;
      created_at: string;
    };
  };
};
