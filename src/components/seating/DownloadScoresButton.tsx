import { Download } from 'lucide-react';
import { useSeatingStore } from '../../stores/seating';
import Button from '../ui/Button';

interface DownloadScoresButtonProps {
  activityId: string | null;
}

export default function DownloadScoresButton({ activityId }: DownloadScoresButtonProps) {
  const { students, getPoints, activities } = useSeatingStore();

  function handleDownload() {
    if (!activityId) return;
    
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    // Sort students by last name, then first name
    const sortedStudents = [...students].sort((a, b) => {
      const lastNameCompare = a.last_name.localeCompare(b.last_name);
      return lastNameCompare !== 0 
        ? lastNameCompare 
        : a.first_name.localeCompare(b.first_name);
    });

    // Create content with scores
    const content = sortedStudents.map(student => {
      const points = getPoints(student.id, activityId);
      return `${student.last_name} ${student.first_name}: ${points}`;
    }).join('\n');

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activity.name}_scores.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      variant="secondary"
      onClick={handleDownload}
      disabled={!activityId}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      <span>Download Scores</span>
    </Button>
  );
}