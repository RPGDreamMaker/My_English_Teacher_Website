import { useRef } from 'react';
import { Upload } from 'lucide-react';
import Button from '../ui/Button';

interface StudentFileUploadProps {
  onUpload: (file: File) => void;
}

export default function StudentFileUpload({ onUpload }: StudentFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
      // Reset the input value so the same file can be selected again
      event.target.value = '';
    }
  }

  return (
    <>
      <Button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center space-x-2"
      >
        <Upload className="h-5 w-5" />
        <span>Upload Student List</span>
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".txt"
        onChange={handleFileChange}
      />
    </>
  );
}