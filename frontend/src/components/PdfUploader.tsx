import { useCallback, useState } from 'react';
import { usePdfStore } from '../store/pdfStore';

export const PdfUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setPdfFile, setPdfUrl, setIsLoading } = usePdfStore();

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return false;
    }
    
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      setError('File size must be less than 50MB');
      return false;
    }
    
    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (!validateFile(file)) return;
    
    setIsLoading(true);
    setPdfFile(file);
    
    // Create a URL for the file
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    
    setIsLoading(false);
  }, [setPdfFile, setPdfUrl, setIsLoading]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50 scale-105' 
            : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-gray-50'
          }
        `}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Upload Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
          </div>

          {/* Upload Text */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Upload Your PDF
            </h3>
            <p className="text-gray-600 mb-1">
              Drag and drop your PDF here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Maximum file size: 50MB
            </p>
          </div>

          {/* File Input */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              Choose File
            </span>
          </label>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
