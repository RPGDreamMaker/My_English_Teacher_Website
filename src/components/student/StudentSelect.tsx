import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import Select from '../ui/Select';
import { formatStudentName } from '../../lib/utils';

type Student = Database['public']['Tables']['students']['Row'];

interface StudentSelectProps {
  classId: string;
  value: string;
  onChange: (studentId: string) => void;
}

export default function StudentSelect({ classId, value, onChange }: StudentSelectProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStudents() {
      if (!classId) return;
      
      try {
        const { data, error: fetchError } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', classId)
          .order('last_name')
          .order('first_name');

        if (fetchError) throw fetchError;
        setStudents(data || []);
      } catch (err) {
        setError('Failed to load students');
      }
    }

    fetchStudents();
  }, [classId]);

  return (
    <Select
      label="Select Your Name"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      required
      disabled={!classId}
    >
      <option value="">Select your name...</option>
      {students.map((student) => (
        <option key={student.id} value={student.id}>
          {formatStudentName(student.last_name, student.first_name)}
        </option>
      ))}
    </Select>
  );
}