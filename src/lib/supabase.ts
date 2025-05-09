import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'student' | 'senior' | 'alumni';
  skills: string[];
  bio?: string;
  created_at: string;
};

export type TeamRequest = {
  id: string;
  title: string;
  description: string;
  event: string;
  skills_needed: string[];
  spots_available: number;
  user_id: string;
  created_at: string;
};

export type Resource = {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  url: string;
  user_id: string;
  likes: number;
  downloads: number;
  tags: string[];
  created_at: string;
};