export interface Database {
  public: {
    Tables: {
      classes: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          teacher_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          teacher_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          teacher_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          class_id: string;
          last_name: string;
          first_name: string;
          pin: string;
          pin_changed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          last_name: string;
          first_name: string;
          pin: string;
          pin_changed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          last_name?: string;
          first_name?: string;
          pin?: string;
          pin_changed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      seating_plans: {
        Row: {
          id: string;
          class_id: string;
          rows: number;
          columns: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          rows: number;
          columns: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          rows?: number;
          columns?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      student_seats: {
        Row: {
          id: string;
          seating_plan_id: string;
          student_id: string;
          row: number;
          column: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seating_plan_id: string;
          student_id: string;
          row: number;
          column: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seating_plan_id?: string;
          student_id?: string;
          row?: number;
          column?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          class_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_points: {
        Row: {
          id: string;
          activity_id: string;
          student_id: string;
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          activity_id: string;
          student_id: string;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          activity_id?: string;
          student_id?: string;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}