import { create } from 'zustand';
import { createActions } from './actions';
import type { SeatingStore } from './types';

export const useSeatingStore = create<SeatingStore>((set, get) => ({
  // Initial state
  seatingPlan: null,
  seats: [],
  students: [],
  activities: [],
  points: [],
  unassignedStudents: [],

  // Computed values
  getStudent: (id) => get().students.find(s => s.id === id),
  getPoints: (studentId, activityId) => {
    const record = get().points.find(
      p => p.student_id === studentId && p.activity_id === activityId
    );
    return record?.points || 0;
  },

  // Actions
  ...createActions(set, get),
}));