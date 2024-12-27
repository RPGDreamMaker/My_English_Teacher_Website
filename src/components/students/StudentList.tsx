import { useState } from 'react';
import { Database } from '../../lib/database.types';
import { Eye, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import ViewPinModal from './ViewPinModal';
import ResetPinModal from './ResetPinModal';
import EditStudentModal from './EditStudentModal';

type Student = Database['public']['Tables']['students']['Row'];

interface StudentListProps {
  students: Student[];
  onResetPin: (studentId: string) => Promise<void>;
  onDeleteStudent: (studentId: string) => Promise<void>;
  onStudentUpdated: (student: Student) => void;
}

export default function StudentList({
  students,
  onResetPin,
  onDeleteStudent,
  onStudentUpdated,
}: StudentListProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewPinModalOpen, setIsViewPinModalOpen] = useState(false);
  const [isResetPinModalOpen, setIsResetPinModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!students) return null;

  return (
    <div className="mt-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                First Name
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.first_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedStudent(student);
                      setIsViewPinModalOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedStudent(student);
                      setIsResetPinModalOpen(true);
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedStudent(student);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDeleteStudent(student.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <>
          <ViewPinModal
            student={selectedStudent}
            isOpen={isViewPinModalOpen}
            onClose={() => {
              setIsViewPinModalOpen(false);
              setSelectedStudent(null);
            }}
          />
          <ResetPinModal
            student={selectedStudent}
            isOpen={isResetPinModalOpen}
            onClose={() => {
              setIsResetPinModalOpen(false);
              setSelectedStudent(null);
            }}
            onConfirm={() => onResetPin(selectedStudent.id)}
          />
          <EditStudentModal
            student={selectedStudent}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedStudent(null);
            }}
            onStudentUpdated={onStudentUpdated}
          />
        </>
      )}
    </div>
  );
}