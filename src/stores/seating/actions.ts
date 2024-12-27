import { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { SeatingStore } from './types';

export const createActions: StateCreator<SeatingStore> = (set, get) => ({
  initialize: async (classId: string) => {
    try {
      // Fetch the latest seating plan
      const { data: seatingPlan } = await supabase
        .from('seating_plans')
        .select()
        .eq('class_id', classId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Fetch students
      const { data: students } = await supabase
        .from('students')
        .select()
        .eq('class_id', classId)
        .order('last_name')
        .order('first_name');

      // Fetch seats if seating plan exists
      let seats: SeatingStore['seats'] = [];
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
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      // Fetch points for all activities if there are any
      let points: SeatingStore['points'] = [];
      if (activities && activities.length > 0) {
        const { data: pointsData } = await supabase
          .from('activity_points')
          .select()
          .in('activity_id', activities.map(a => a.id));
        
        if (pointsData) points = pointsData;
      }

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
      throw error;
    }
  },

  createSeatingPlan: async (classId: string, rows: number, cols: number) => {
    try {
      const { data: newPlan, error } = await supabase
        .from('seating_plans')
        .insert({
          class_id: classId,
          rows,
          cols
        })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        ...state,
        seatingPlan: newPlan,
        seats: [],
        unassignedStudents: state.students
      }));
    } catch (error) {
      console.error('Failed to create seating plan:', error);
      throw error;
    }
  },

  updateSeat: async (studentId: string, row: number | null, col: number | null) => {
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

      // If row and col are null, just remove the seat
      if (row === null || col === null) {
        set(state => ({
          seats: state.seats.filter(s => s.id !== existingSeat?.id),
          unassignedStudents: [
            ...state.unassignedStudents,
            state.students.find(s => s.id === studentId)!
          ]
        }));
        return;
      }

      // Add new seat
      const { data: newSeat, error } = await supabase
        .from('student_seats')
        .insert({
          seating_plan_id: seatingPlan.id,
          student_id: studentId,
          row_num: row,
          col_num: col
        })
        .select('*, student:students(*)')
        .single();

      if (error) throw error;

      set(state => ({
        seats: [...state.seats.filter(s => s.id !== existingSeat?.id), newSeat],
        unassignedStudents: state.unassignedStudents.filter(s => s.id !== studentId)
      }));
    } catch (error) {
      console.error('Failed to update seat:', error);
      throw error;
    }
  },

  createActivity: async (classId: string, name: string) => {
    try {
      const { data: activity, error } = await supabase
        .from('activities')
        .insert({ 
          class_id: classId,
          name 
        })
        .select()
        .single();

      if (error) throw error;

      set(state => ({ 
        activities: [activity, ...state.activities]
      }));
    } catch (error) {
      console.error('Failed to create activity:', error);
      throw error;
    }
  },

  updateActivity: async (activityId: string, name: string) => {
    try {
      const { data: activity, error } = await supabase
        .from('activities')
        .update({ name })
        .eq('id', activityId)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        activities: state.activities.map(a => 
          a.id === activityId ? activity : a
        )
      }));
    } catch (error) {
      console.error('Failed to update activity:', error);
      throw error;
    }
  },

  updatePoints: async (studentId: string, activityId: string, points: number) => {
    try {
      // Use upsert with on_conflict to handle both insert and update
      const { data: updatedPoints, error } = await supabase
        .from('activity_points')
        .upsert(
          { 
            student_id: studentId,
            activity_id: activityId,
            points 
          },
          {
            onConflict: 'activity_id,student_id',
            ignoreDuplicates: false
          }
        )
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        points: [
          ...state.points.filter(p => 
            !(p.student_id === studentId && p.activity_id === activityId)
          ),
          updatedPoints
        ]
      }));
    } catch (error) {
      console.error('Failed to update points:', error);
      throw error;
    }
  },

  deleteActivity: async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      set(state => ({
        activities: state.activities.filter(a => a.id !== activityId),
        points: state.points.filter(p => p.activity_id !== activityId)
      }));
    } catch (error) {
      console.error('Failed to delete activity:', error);
      throw error;
    }
  },

  resetActivityScores: async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('activity_points')
        .delete()
        .eq('activity_id', activityId);

      if (error) throw error;

      set(state => ({
        points: state.points.filter(p => p.activity_id !== activityId)
      }));
    } catch (error) {
      console.error('Failed to reset activity scores:', error);
      throw error;
    }
  }
});