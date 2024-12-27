import { Database } from '../../lib/database.types';

export type Student = Database['public']['Tables']['students']['Row'];
export type SeatingPlan = Database['public']['Tables']['seating_plans']['Row'];
export type StudentSeat = Database['public']['Tables']['student_seats']['Row'] & {
  student: Student;
};
export type Activity = Database['public']['Tables']['activities']['Row'];
export type ActivityPoints = Database['public']['Tables']['activity_points']['Row'];

export interface SeatingStore {
  // State
  seatingPlan: SeatingPlan | null;
  seats: StudentSeat[];
  students: Student[];
  activities: Activity[];
  points: ActivityPoints[];
  unassignedStudents: Student[];
  
  // Computed
  getStudent: (id: string) => Student | undefined;
  getPoints: (studentId: string, activityId: string) => number;

  // Actions
  initialize: (classId: string) => Promise<void>;
  createSeatingPlan: (classId: string, rows: number, cols: number) => Promise<void>;
  updateSeat: (studentId: string, row: number | null, col: number | null) => Promise<void>;
  createActivity: (classId: string, name: string) => Promise<void>;
  updatePoints: (studentId: string, activityId: string, points: number) => Promise<void>;
  deleteActivity: (activityId: string) => Promise<void>;
  resetActivityScores: (activityId: string) => Promise<void>;
}