import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import Select from '../ui/Select';

type Class = Database['public']['Tables']['classes']['Row'];

interface ClassSelectProps {
  value: string;
  onChange: (classId: string) => void;
}

export default function ClassSelect({ value, onChange }: ClassSelectProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchClasses() {
      try {
        const { data, error: fetchError } = await supabase
          .from('classes')
          .select('*')
          .order('name');

        if (fetchError) throw fetchError;
        setClasses(data || []);
      } catch (err) {
        setError('Failed to load classes');
      }
    }

    fetchClasses();
  }, []);

  return (
    <Select
      label="Select Class"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      required
    >
      <option value="">Select a class...</option>
      {classes.map((classItem) => (
        <option key={classItem.id} value={classItem.id}>
          {classItem.name}
        </option>
      ))}
    </Select>
  );
}