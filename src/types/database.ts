export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type HabitType = 'identity' | 'execution';

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
          identity_sentence: string | null;
          vision: string | null;
          reminder_time: string;
          streak: number;
          last_checkin_date: string | null;
          day_count: number;
          lifetime_avg: number;
          whoop_connected: boolean;
          whoop_access_token: string | null;
          whoop_refresh_token: string | null;
          subscription_status: string;
          trial_ends_at: string | null;
          date_of_birth: string | null;
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
          identity_sentence?: string | null;
          vision?: string | null;
          reminder_time?: string;
          streak?: number;
          last_checkin_date?: string | null;
          day_count?: number;
          lifetime_avg?: number;
          whoop_connected?: boolean;
          whoop_access_token?: string | null;
          whoop_refresh_token?: string | null;
          subscription_status?: string;
          date_of_birth?: string | null;
          trial_ends_at?: string | null;
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
          identity_sentence?: string | null;
          vision?: string | null;
          reminder_time?: string;
          streak?: number;
          last_checkin_date?: string | null;
          day_count?: number;
          lifetime_avg?: number;
          whoop_connected?: boolean;
          whoop_access_token?: string | null;
          whoop_refresh_token?: string | null;
          subscription_status?: string;
          date_of_birth?: string | null;
          trial_ends_at?: string | null;
          updated_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          type: HabitType;
          label: string;
          points: number;
          enabled: boolean;
          sort_order: number;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: HabitType;
          label: string;
          points?: number;
          enabled?: boolean;
          sort_order?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: HabitType;
          label?: string;
          points?: number;
          enabled?: boolean;
          sort_order?: number;
          is_default?: boolean;
          updated_at?: string;
        };
      };
      outcome_metrics: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          sort_order: number;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label: string;
          sort_order?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          sort_order?: number;
          is_default?: boolean;
          updated_at?: string;
        };
      };
      penalty_items: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          sort_order: number;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label: string;
          sort_order?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          sort_order?: number;
          is_default?: boolean;
          updated_at?: string;
        };
      };
      daily_checkins: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          identity_checks: Json;
          execution_checks: Json;
          perf_9to5: number;
          outcome_scores: Json;
          penalty_scores: Json;
          identity_score: number;
          execution_score: number;
          outcome_score: number;
          penalty_score: number;
          total_score: number;
          whoop_strain: number | null;
          whoop_recovery_pct: number | null;
          whoop_sleep_pct: number | null;
          whoop_score_adj: number;
          reflection_win: string | null;
          reflection_broke: string | null;
          reflection_tomorrow: string | null;
          is_locked: boolean;
          locked_at: string | null;
          is_late_checkin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          identity_checks?: Json;
          execution_checks?: Json;
          perf_9to5?: number;
          outcome_scores?: Json;
          penalty_scores?: Json;
          identity_score?: number;
          execution_score?: number;
          outcome_score?: number;
          penalty_score?: number;
          total_score?: number;
          whoop_strain?: number | null;
          whoop_recovery_pct?: number | null;
          whoop_sleep_pct?: number | null;
          whoop_score_adj?: number;
          reflection_win?: string | null;
          reflection_broke?: string | null;
          reflection_tomorrow?: string | null;
          is_locked?: boolean;
          locked_at?: string | null;
          is_late_checkin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          identity_checks?: Json;
          execution_checks?: Json;
          perf_9to5?: number;
          outcome_scores?: Json;
          penalty_scores?: Json;
          identity_score?: number;
          execution_score?: number;
          outcome_score?: number;
          penalty_score?: number;
          total_score?: number;
          whoop_strain?: number | null;
          whoop_recovery_pct?: number | null;
          whoop_sleep_pct?: number | null;
          whoop_score_adj?: number;
          reflection_win?: string | null;
          reflection_broke?: string | null;
          reflection_tomorrow?: string | null;
          is_locked?: boolean;
          locked_at?: string | null;
          is_late_checkin?: boolean;
          updated_at?: string;
        };
      };
      mirror_photos: {
        Row: {
          id: string;
          user_id: string;
          checkin_id: string | null;
          date: string;
          day_number: number;
          photo_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          checkin_id?: string | null;
          date: string;
          day_number: number;
          photo_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          checkin_id?: string | null;
          date?: string;
          day_number?: number;
          photo_url?: string;
        };
      };
      weekly_reviews: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          week_end: string;
          reflection: string | null;
          win: string | null;
          challenge: string | null;
          next_week: string | null;
          weekly_avg: number | null;
          photo_urls: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start: string;
          week_end: string;
          reflection?: string | null;
          win?: string | null;
          challenge?: string | null;
          next_week?: string | null;
          weekly_avg?: number | null;
          photo_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start?: string;
          week_end?: string;
          reflection?: string | null;
          win?: string | null;
          challenge?: string | null;
          next_week?: string | null;
          weekly_avg?: number | null;
          photo_urls?: string[];
          updated_at?: string;
        };
      };
      monthly_reviews: {
        Row: {
          id: string;
          user_id: string;
          year: number;
          month: number;
          reflection: string | null;
          verdict: string | null;
          cover_photo_url: string | null;
          monthly_avg: number | null;
          best_day_date: string | null;
          best_day_score: number | null;
          streak_during: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          year: number;
          month: number;
          reflection?: string | null;
          verdict?: string | null;
          cover_photo_url?: string | null;
          monthly_avg?: number | null;
          best_day_date?: string | null;
          best_day_score?: number | null;
          streak_during?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          year?: number;
          month?: number;
          reflection?: string | null;
          verdict?: string | null;
          cover_photo_url?: string | null;
          monthly_avg?: number | null;
          best_day_date?: string | null;
          best_day_score?: number | null;
          streak_during?: number | null;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'agency' | 'client';
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: 'agency' | 'client';
        };
        Update: {
          role?: 'agency' | 'client';
        };
      };
    };
    Functions: {
      seed_default_habits: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
      lock_checkin: {
        Args: {
          p_checkin_id: string;
          p_identity_score: number;
          p_execution_score: number;
          p_outcome_score: number;
          p_penalty_score: number;
        };
        Returns: number;
      };
      get_user_stats: {
        Args: Record<string, never>;
        Returns: Array<{
          streak: number;
          day_count: number;
          lifetime_avg: number;
          best_score: number | null;
          best_date: string | null;
        }>;
      };
      get_history: {
        Args: { p_days?: number };
        Returns: Array<{
          id: string;
          date: string;
          total_score: number;
          identity_score: number;
          execution_score: number;
          outcome_score: number;
          penalty_score: number;
          whoop_score_adj: number;
          reflection_win: string | null;
          reflection_broke: string | null;
          is_late_checkin: boolean;
        }>;
      };
      ensure_user_dashboard_setup: {
        Args: Record<string, never>;
        Returns: string;
      };
      has_role: {
        Args: { _user_id: string; _role: 'agency' | 'client' };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: 'agency' | 'client';
      habit_type: HabitType;
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Habit = Database['public']['Tables']['habits']['Row'];
export type OutcomeMetric = Database['public']['Tables']['outcome_metrics']['Row'];
export type PenaltyItem = Database['public']['Tables']['penalty_items']['Row'];
export type DailyCheckin = Database['public']['Tables']['daily_checkins']['Row'];
export type MirrorPhoto = Database['public']['Tables']['mirror_photos']['Row'];
export type WeeklyReview = Database['public']['Tables']['weekly_reviews']['Row'];
export type MonthlyReview = Database['public']['Tables']['monthly_reviews']['Row'];
