import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];
type WheelActivity = Database['public']['Tables']['wheel_activities']['Row'];

interface WheelStore {
  // State
  activities: WheelActivity[];
  selectedActivityId: string | null;
  students: Student[];
  availableStudents: Student[];
  selectedStudents: Student[];
  absentees: Set<string>;
  infiniteMode: boolean;

  // Actions
  initialize: (classId: string) => Promise<void>;
  createActivity: (classId: string, name: string) => Promise<void>;
  updateActivity: (activityId: string, name: string) => Promise<void>;
  deleteActivity: (activityId: string) => Promise<void>;
  selectActivity: (activityId: string | null) => Promise<void>;
  selectStudent: (studentId: string) => Promise<void>;
  returnStudent: (studentId: string) => Promise<void>;
  returnAllStudents: () => Promise<void>;
  toggleAttendance: (studentId: string) => Promise<void>;
  setInfiniteMode: (enabled: boolean) => void;
}

export const useWheelStore = create<WheelStore>((set, get) => ({
  activities: [],
  selectedActivityId: null,
  students: [],
  availableStudents: [],
  selectedStudents: [],
  absentees: new Set(),
  infiniteMode: false,

  initialize: async (classId: string) => {
    try {
      // Fetch activities
      const { data: activities } = await supabase
        .from('wheel_activities')
        .select()
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      // Fetch students
      const { data: students } = await supabase
        .from('students')
        .select()
        .eq('class_id', classId)
        .order('last_name')
        .order('first_name');

      set({
        activities: activities || [],
        students: students || [],
        availableStudents: students || [],
        selectedStudents: [],
        absentees: new Set(),
        selectedActivityId: null,
      });
    } catch (error) {
      console.error('Failed to initialize wheel store:', error);
      throw error;
    }
  },

  createActivity: async (classId: string, name: string) => {
    try {
      const { data: activity, error } = await supabase
        .from('wheel_activities')
        .insert({ class_id: classId, name })
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
        .from('wheel_activities')
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

  deleteActivity: async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('wheel_activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      set(state => ({
        activities: state.activities.filter(a => a.id !== activityId),
        selectedActivityId: state.selectedActivityId === activityId ? null : state.selectedActivityId
      }));
    } catch (error) {
      console.error('Failed to delete activity:', error);
      throw error;
    }
  },

  selectActivity: async (activityId: string | null) => {
    try {
      if (!activityId) {
        set(state => ({
          selectedActivityId: null,
          availableStudents: state.students,
          selectedStudents: [],
          absentees: new Set()
        }));
        return;
      }

      const { data: states } = await supabase
        .from('wheel_activity_states')
        .select()
        .eq('activity_id', activityId);

      const selectedIds = new Set<string>();
      const absentIds = new Set<string>();

      states?.forEach(state => {
        if (state.status === 'selected') selectedIds.add(state.student_id);
        else if (state.status === 'absent') absentIds.add(state.student_id);
      });

      set(state => ({
        selectedActivityId: activityId,
        selectedStudents: state.students.filter(s => selectedIds.has(s.id)),
        availableStudents: state.students.filter(s => !selectedIds.has(s.id) && !absentIds.has(s.id)),
        absentees: absentIds
      }));
    } catch (error) {
      console.error('Failed to select activity:', error);
      throw error;
    }
  },

  selectStudent: async (studentId: string) => {
    const { selectedActivityId, infiniteMode, availableStudents, selectedStudents } = get();
    const student = availableStudents.find(s => s.id === studentId);
    
    if (!student) return;

    try {
      if (selectedActivityId && !infiniteMode) {
        await supabase
          .from('wheel_activity_states')
          .upsert({
            activity_id: selectedActivityId,
            student_id: studentId,
            status: 'selected'
          });
      }

      if (!infiniteMode) {
        set({
          availableStudents: availableStudents.filter(s => s.id !== studentId),
          selectedStudents: [...selectedStudents, student],
        });
      }
    } catch (error) {
      console.error('Failed to select student:', error);
      throw error;
    }
  },

  returnStudent: async (studentId: string) => {
    const { selectedActivityId, availableStudents, selectedStudents, absentees } = get();
    const student = selectedStudents.find(s => s.id === studentId);
    
    if (!student) return;

    try {
      if (selectedActivityId) {
        await supabase
          .from('wheel_activity_states')
          .delete()
          .eq('activity_id', selectedActivityId)
          .eq('student_id', studentId);
      }

      set({
        selectedStudents: selectedStudents.filter(s => s.id !== studentId),
        availableStudents: absentees.has(studentId) 
          ? availableStudents 
          : [...availableStudents, student],
      });
    } catch (error) {
      console.error('Failed to return student:', error);
      throw error;
    }
  },

  returnAllStudents: async () => {
    const { selectedActivityId, selectedStudents, absentees } = get();
    const presentStudents = selectedStudents.filter(s => !absentees.has(s.id));
    
    try {
      if (selectedActivityId) {
        await supabase
          .from('wheel_activity_states')
          .delete()
          .eq('activity_id', selectedActivityId)
          .in('student_id', selectedStudents.map(s => s.id));
      }

      set(state => ({
        availableStudents: [...state.availableStudents, ...presentStudents],
        selectedStudents: [],
      }));
    } catch (error) {
      console.error('Failed to return all students:', error);
      throw error;
    }
  },

  toggleAttendance: async (studentId: string) => {
    const { selectedActivityId } = get();

    set(state => {
      const newAbsentees = new Set(state.absentees);
      const isCurrentlyAbsent = newAbsentees.has(studentId);
      
      if (isCurrentlyAbsent) {
        newAbsentees.delete(studentId);
        const student = state.students.find(s => s.id === studentId);
        if (student && !state.selectedStudents.some(s => s.id === studentId)) {
          return {
            absentees: newAbsentees,
            availableStudents: [...state.availableStudents, student],
          };
        }
      } else {
        newAbsentees.add(studentId);
        return {
          absentees: newAbsentees,
          availableStudents: state.availableStudents.filter(s => s.id !== studentId),
        };
      }
      
      return { absentees: newAbsentees };
    });

    try {
      if (selectedActivityId) {
        if (get().absentees.has(studentId)) {
          await supabase
            .from('wheel_activity_states')
            .upsert({
              activity_id: selectedActivityId,
              student_id: studentId,
              status: 'absent'
            });
        } else {
          await supabase
            .from('wheel_activity_states')
            .delete()
            .eq('activity_id', selectedActivityId)
            .eq('student_id', studentId);
        }
      }
    } catch (error) {
      console.error('Failed to toggle attendance:', error);
      throw error;
    }
  },

  setInfiniteMode: (enabled: boolean) => {
    set({ infiniteMode: enabled });
  },
}));