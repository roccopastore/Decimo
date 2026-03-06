import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://ahuwhkmrekcorhrgyfsv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodXdoa21yZWtjb3Jocmd5ZnN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1OTcyNTEsImV4cCI6MjA4NzE3MzI1MX0.Vk1K0i0Umu8k-uuWKd6WzDnP-G_pKsJxg6A-6SMZ5JY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});