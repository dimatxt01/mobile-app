// Placeholder — generate the full types file from your live Supabase project:
//   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = 'agency' | 'client';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          logo_url: string | null;
          agency_id: string | null;
          client_id: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          logo_url?: string | null;
          agency_id?: string | null;
          client_id?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          logo_url?: string | null;
          agency_id?: string | null;
          client_id?: string | null;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: AppRole;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: AppRole;
        };
        Update: {
          role?: AppRole;
        };
      };
    };
    Functions: {
      ensure_user_dashboard_setup: {
        Args: Record<string, never>;
        Returns: string;
      };
      has_role: {
        Args: { _user_id: string; _role: AppRole };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
    };
  };
}
