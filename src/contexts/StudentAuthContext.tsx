import { createContext, useContext, useState, ReactNode } from 'react';
import { Database } from '../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];
type Class = Database['public']['Tables']['classes']['Row'];

interface StudentSession {
  student: Student;
  class: Class;
}

interface StudentAuthContextType {
  session: StudentSession | null;
  setSession: (session: StudentSession | null) => void;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StudentSession | null>(null);

  return (
    <StudentAuthContext.Provider value={{ session, setSession }}>
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext);
  if (context === undefined) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
}