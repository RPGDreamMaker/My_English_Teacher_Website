import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Database } from '../../lib/database.types';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { Users, Layout, CircleDot, Pencil, Trash2 } from 'lucide-react';
import EditClassModal from './EditClassModal';
import ConfirmDialog from '../ui/ConfirmDialog';

type Class = Database['public']['Tables']['classes']['Row'];

interface ClassCardProps {
  classData: Class;
  onClassUpdated: (updatedClass: Class) => void;
  onClassDeleted: (classId: string) => void;
}

export default function ClassCard({ 
  classData, 
  onClassUpdated,
  onClassDeleted,
}: ClassCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classData.id);

      if (error) throw error;
      onClassDeleted(classData.id);
    } catch (err) {
      console.error('Failed to delete class:', err);
      // Error will be shown by the dialog
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Edit class"
        >
          <Pencil className="h-5 w-5" />
        </button>
        <button
          onClick={() => setIsDeleteDialogOpen(true)}
          className="text-gray-400 hover:text-red-600 transition-colors"
          title="Delete class"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2 pr-16">
        {classData.name}
      </h3>
      {classData.description && (
        <p className="text-gray-600 mb-4">{classData.description}</p>
      )}
      <div className="grid grid-cols-1 gap-2">
        <Link to={`/teacherportal/class/${classData.id}/students`}>
          <Button className="flex items-center space-x-2 w-full">
            <Users className="h-4 w-4" />
            <span>List of Students</span>
          </Button>
        </Link>
        <Link to={`/teacherportal/class/${classData.id}/seating`}>
          <Button variant="secondary" className="flex items-center space-x-2 w-full">
            <Layout className="h-4 w-4" />
            <span>Seating Plan Activities</span>
          </Button>
        </Link>
        <Link to={`/teacherportal/class/${classData.id}/wheel`}>
          <Button variant="secondary" className="flex items-center space-x-2 w-full">
            <CircleDot className="h-4 w-4" />
            <span>Wheel of Names Activities</span>
          </Button>
        </Link>
      </div>

      <EditClassModal
        classData={classData}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onClassUpdated={onClassUpdated}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Class"
        message={`Are you sure you want to delete "${classData.name}"? This will permanently delete all associated data including students, seating plans, and activities. This action cannot be undone.`}
        confirmLabel={isDeleting ? "Deleting..." : "Delete Class"}
        variant="danger"
      />
    </div>
  );
}