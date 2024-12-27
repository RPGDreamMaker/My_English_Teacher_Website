import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];
type SeatingPlan = Database['public']['Tables']['seating_plans']['Row'];
type StudentSeat = Database['public']['Tables']['student_seats']['Row'];
type Activity = Database['public']['Tables']['activities']['Row'];
type ActivityPoints = Database['public']['Tables']['activity_points']['Row'];

interface SeatingStore {
  // State
  seatingPlan: SeatingPlan | null;
  seats: Array<StudentSeat & { student: Student }>;
  students: Student[];
  activities: Activity[];
  points: ActivityPoints[];
  
  // Computed
  unassignedStudents: Student[];
  getStudent: (id: string) => Student | undefined;
  getPoints: (studentId: string, activityId: string) => number;

  // Actions
  initialize: (classId: string) => Promise<void>;
  createSeatingPlan: (rows: number, cols: number) => Promise<void>;
  updateSeat: (studentId: string, row: number, col: number) => Promise<void>;
  createActivity: (name: string) => Promise<void>;
  updatePoints: (studentId: string, activityId: string, points: number) => Promise<void>;
}

export const useSeatingStore = create<SeatingStore>((set, get) => ({
  seatingPlan: null,
  seats: [],
  students: [],
  activities: [],
  points: [],

  unassignedStudents: [],
  getStudent: (id) => get().students.find(s => s.id === id),
  getPoints: (studentId, activityId) => {
    const record = get().points.find(
      p => p.student_id === studentId && p.activity_id === activityId
    );
    return record?.points || 0;
  },

  initialize: async (classId) => {
    try {
      // Fetch seating plan
      const { data: seatingPlan } = await supabase
        .from('seating_plans')
        .select()
        .eq('class_id', classId)
        .single();

      // Fetch students
      const { data: students } = await supabase
        .from('students')
        .select()
        .eq('class_id', classId);

      // Fetch seats if seating plan exists
      let seats: Array<StudentSeat & { student: Student }> = [];
      if (seatingPlan) {
        const { data: seatsData } = await supabase
          .from('student_seats')
          .select('*, student:students(*)')
          .eq('seating_plan_id', seatingPlan.id);
        
        if (seatsData) seats = seatsData;
      }

      // Fetch activities
      const { data: activities } = await supabase
        .from('activities')
        .select()
        .eq('class_id', classId);

      // Fetch points
      const { data: points } = await supabase
        .from('activity_points')
        .select()
        .in('activity_id', (activities || []).map(a => a.id));

      set({
        seatingPlan: seatingPlan || null,
        seats: seats || [],
        students: students || [],
        activities: activities || [],
        points: points || [],
        unassignedStudents: (students || []).filter(student => 
          !seats.some(seat => seat.student_id === student.id)
        ),
      });
    } catch (error) {
      console.error('Failed to initialize seating store:', error);
    }
  },

  createSeatingPlan: async (rows, cols) => {
    const { seatingPlan } = get();
    if (seatingPlan) return;

    try {
      const { data: newPlan, error } = await supabase
        .from('seating_plans')
        .insert({ rows, cols })
        .select()
        .single();

      if (error) throw error;
      set({ seatingPlan: newPlan });
    } catch (error) {
      console.error('Failed to create seating plan:', error);
    }
  },

  updateSeat: async (studentId, row, col) => {
    const { seatingPlan, seats } = get();
    if (!seatingPlan) return;

    try {
      // Remove existing seat if any
      const existingSeat = seats.find(s => s.student_id === studentId);
      if (existingSeat) {
        await supabase
          .from('student_seats')
          .delete()
          .eq('id', existingSeat.id);
      }

      // Add new seat
      const { data: newSeat, error } = await supabase
        .from('student_seats')
        .insert({
          seating_plan_id: seatingPlan.id,
          student_id: studentId,
          row_num: row,
          col_num: col,
        })
        .select('*, student:students(*)')
        .single();

      if (error) throw error;

      set(state => ({
        seats: [...state.seats.filter(s => s.id !== existingSeat?.id), newSeat],
        unassignedStudents: state.students.filter(student =>
          !state.seats.some(seat => seat.student_id === student.id)
        ),
      }));
    } catch (error) {
      console.error('Failed to update seat:', error);
    }
  },

  createActivity: async (name) => {
    const { seatingPlan } = get();
    if (!seatingPlan) return;

    try {
      const { data: activity, error } = await supabase
        .from('activities')
        .insert({ name })
        .select()
        .single();

      if (error) throw error;
      set(state => ({ activities: [...state.activities, activity] }));
    } catch (error) {
      console.error('Failed to create activity:', error);
    }
  },

  updatePoints: async (studentId, activityId, points) => {
    try {
      const { data: existingPoints } = await supabase
        .from('activity_points')
        .select()
        .eq('student_id', studentId)
        .eq('activity_id', activityId)
        .single();

      if (existingPoints) {
        const { data: updatedPoints, error } = await supabase
          .from('activity_points')
          .update({ points })
          .eq('id', existingPoints.id)
          .select()
          .single();

        if (error) throw error;
        set(state => ({
          points: state.points.map(p => 
            p.id === updatedPoints.id ? updatedPoints : p
          ),
        }));
      } else {
        const { data: newPoints, error } = await supabase
          .from('activity_points')
          .insert({ student_id: studentId, activity_id: activityId, points })
          .select()
          .single();

        if (error) throw error;
        set(state => ({ points: [...state.points, newPoints] }));
      }
    } catch (error) {
      console.error('Failed to update points:', error);
    }
  },
}));