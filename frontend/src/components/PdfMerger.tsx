import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

interface PdfFile {
  id: string;
  file: File;
  name: string;
}

const PdfMerger: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFilesOnly = files.filter(file => file.type === 'application/pdf');
    
    const newPdfFiles = pdfFilesOnly.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
    }));
    
    setPdfFiles(prev => [...prev, ...newPdfFiles]);
  };

  // Remove a PDF from the list
  const removePdf = (id: string) => {
    setPdfFiles(prev => prev.filter(pdf => pdf.id !== id));
  };

  // Move PDF up in the list
  const movePdfUp = (index: number) => {
    if (index === 0) return;
    const newFiles = [...pdfFiles];
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
    setPdfFiles(newFiles);
  };

  // Move PDF down in the list
  const movePdfDown = (index: number) => {
    if (index === pdfFiles.length - 1) return;
    const newFiles = [...pdfFiles];
    [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    setPdfFiles(newFiles);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newFiles = [...pdfFiles];
    const [draggedItem] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(dropIndex, 0, draggedItem);
    
    setPdfFiles(newFiles);
    setDraggedIndex(null);
  };

  // Merge PDFs
  const mergePdfs = async () => {
    if (pdfFiles.length < 2) {
      alert('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsMerging(true);

    try {
      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();

      // Process each PDF file
      for (const pdfFile of pdfFiles) {
        try {
          // Read the file as array buffer
          const arrayBuffer = await pdfFile.file.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);

          // Copy all pages from this PDF
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          
          // Add each copied page to the merged PDF
          copiedPages.forEach((page) => {
            mergedPdf.addPage(page);
          });

          console.log(`Merged: ${pdfFile.name} (${pdf.getPageCount()} pages)`);
        } catch (error) {
          console.error(`Error processing ${pdfFile.name}:`, error);
          throw new Error(`Failed to process ${pdfFile.name}. Please ensure it's a valid PDF.`);
        }
      }

      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      
      // Create a blob and download
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged-document.pdf';
      link.click();
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      alert(`Successfully merged ${pdfFiles.length} PDFs! Total pages: ${mergedPdf.getPageCount()}`);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert(`Error merging PDFs: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsMerging(false);
    }
  };

  // Clear all files
  const clearAll = () => {
    setPdfFiles([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">PDF Merger</h1>
          
          {/* File Upload Section */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Select PDF files to merge
            </label>
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100
                cursor-pointer"
            />
            <p className="mt-2 text-sm text-gray-500">
              You can select multiple PDF files at once
            </p>
          </div>

          {/* PDF List */}
          {pdfFiles.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-700">
                  PDFs to merge ({pdfFiles.length})
                </h2>
                <button
                  onClick={clearAll}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-2">
                {pdfFiles.map((pdf, index) => (
                  <div
                    key={pdf.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 
                      ${draggedIndex === index ? 'opacity-50' : ''} 
                      hover:border-indigo-300 transition-colors cursor-move`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => movePdfUp(index)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => movePdfDown(index)}
                          disabled={index === pdfFiles.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          ▼
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-sm font-semibold text-gray-500 w-8">
                          {index + 1}.
                        </span>
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">
                            {pdf.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removePdf(pdf.id)}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <p className="mt-3 text-sm text-gray-500 italic">
                💡 Tip: Drag and drop to reorder, or use ▲ ▼ buttons
              </p>
            </div>
          )}

          {/* Merge Button */}
          <div className="flex gap-4">
            <button
              onClick={mergePdfs}
              disabled={pdfFiles.length < 2 || isMerging}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg
                hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-colors shadow-md hover:shadow-lg"
            >
              {isMerging ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Merging PDFs...
                </span>
              ) : (
                `Merge ${pdfFiles.length} PDF${pdfFiles.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">How to use:</h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Click "Choose Files" and select multiple PDF files</li>
              <li>Reorder PDFs by dragging or using ▲ ▼ buttons</li>
              <li>Click "Merge PDFs" to combine them into one file</li>
              <li>The merged PDF will be downloaded automatically</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfMerger;
