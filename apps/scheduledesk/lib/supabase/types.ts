// Database types - will be updated when we generate from actual schema
export interface Database {
  public: {
    Tables: {
      team_members: {
        Row: {
          id: string;
          first_name: string;
          last_name: string | null;
          display_name: string | null;
          avatar_uri: string | null;
          jobber_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name?: string | null;
          display_name?: string | null;
          avatar_uri?: string | null;
          jobber_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string | null;
          display_name?: string | null;
          avatar_uri?: string | null;
          jobber_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      availability_events: {
        Row: {
          id: string;
          team_member_id: string;
          event_type: string;
          start_date: string;
          end_date: string;
          start_time: string | null;
          end_time: string | null;
          all_day: boolean | null;
          recurrence: string | null;
          monthly_recurrence: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_member_id: string;
          event_type: string;
          start_date: string;
          end_date: string;
          start_time?: string | null;
          end_time?: string | null;
          all_day?: boolean | null;
          recurrence?: string | null;
          monthly_recurrence?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_member_id?: string;
          event_type?: string;
          start_date?: string;
          end_date?: string;
          start_time?: string | null;
          end_time?: string | null;
          all_day?: boolean | null;
          recurrence?: string | null;
          monthly_recurrence?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}