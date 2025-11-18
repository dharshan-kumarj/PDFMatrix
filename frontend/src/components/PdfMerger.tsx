import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import PdfQualitySelector, { PdfQualitySettings, DEFAULT_QUALITY_PRESETS } from './PdfQualitySelector';

interface PdfFile {
  id: string;
  file: File;
  name: string;
}

const PdfMerger: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [qualitySettings, setQualitySettings] = useState<PdfQualitySettings>({
    level: 'medium',
    ...DEFAULT_QUALITY_PRESETS.medium,
  });

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

  const handleDragOver = (e: React.DragEvent) => {
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

      // Save the merged PDF with compression settings
      const mergedPdfBytes = await mergedPdf.save({
        useObjectStreams: qualitySettings.useObjectStreams,
      });

      // Create a blob and download
      const arrayBuffer = new Uint8Array(mergedPdfBytes).buffer;
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
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
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl border border-green-500/20 p-6 sm:p-8">
          {/* Header with gradient accent */}
          <div className="mb-6 pb-4 border-b border-green-500/20">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              PDF Merger
            </h1>
            <p className="text-gray-400 text-sm">
              Combine multiple PDF files into a single document
            </p>
          </div>
          
          {/* File Upload Section */}
          <div className="mb-6">
            <label className="block mb-3 text-sm font-semibold text-green-400">
              Select PDF files to merge
            </label>
            <div className="relative">
              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-3 file:px-6
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gradient-to-r file:from-green-500 file:to-emerald-600
                  file:text-black file:shadow-lg file:shadow-green-500/30
                  hover:file:from-green-400 hover:file:to-emerald-500
                  file:transition-all file:duration-200
                  cursor-pointer
                  bg-gray-800/50 border-2 border-green-500/30 rounded-lg p-3
                  hover:border-green-500/50 transition-colors"
              />
            </div>
            <p className="mt-3 text-sm text-gray-500 flex items-center gap-2">
              <span className="text-green-400">💡</span>
              You can select multiple PDF files at once
            </p>
          </div>

          {/* PDF List */}
          {pdfFiles.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-green-400 flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center text-sm">
                    {pdfFiles.length}
                  </span>
                  PDFs to merge
                </h2>
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-sm text-red-400 hover:text-red-300 font-medium
                    bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/30
                    transition-all duration-200"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-3">
                {pdfFiles.map((pdf, index) => (
                  <div
                    key={pdf.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`flex items-center justify-between p-4 
                      bg-gradient-to-r from-gray-800 to-gray-900 
                      rounded-xl border-2 border-green-500/20
                      ${draggedIndex === index ? 'opacity-50 scale-95' : ''} 
                      hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10
                      transition-all duration-200 cursor-move group`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => movePdfUp(index)}
                          disabled={index === 0}
                          className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/20 
                            rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => movePdfDown(index)}
                          disabled={index === pdfFiles.length - 1}
                          className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/20 
                            rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          ▼
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-sm font-bold text-green-400 bg-green-500/20 w-8 h-8 
                          rounded-lg flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex items-center gap-2 min-w-0">
                          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-300 truncate">
                            {pdf.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removePdf(pdf.id)}
                      className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 
                        rounded-lg transition-all duration-200 flex-shrink-0"
                      title="Remove"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <p className="mt-4 text-sm text-gray-400 italic flex items-center gap-2 bg-gray-800/30 p-3 rounded-lg border border-green-500/10">
                <span className="text-green-400">💡</span>
                Tip: Drag and drop to reorder, or use ▲ ▼ buttons
              </p>
            </div>
          )}

          {/* Quality Settings */}
          {pdfFiles.length > 0 && (
            <PdfQualitySelector
              qualitySettings={qualitySettings}
              onChange={setQualitySettings}
              className="mb-6"
            />
          )}

          {/* Merge Button */}
          <div className="flex gap-4">
            <button
              onClick={mergePdfs}
              disabled={pdfFiles.length < 2 || isMerging}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 
                text-black font-bold rounded-xl text-lg
                hover:from-green-400 hover:to-emerald-500 
                disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500
                disabled:cursor-not-allowed
                transition-all duration-200 shadow-lg shadow-green-500/30
                hover:shadow-xl hover:shadow-green-500/40 hover:scale-105
                disabled:shadow-none disabled:scale-100"
            >
              {isMerging ? (
                <span className="flex items-center justify-center gap-3">
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
          <div className="mt-6 p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 
            rounded-xl border border-green-500/30 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
              <span className="text-lg">📖</span>
              How to use:
            </h3>
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li className="pl-2">Click "Choose File" and select multiple PDF files</li>
              <li className="pl-2">Reorder PDFs by dragging or using ▲ ▼ buttons</li>
              <li className="pl-2">Click "Merge PDFs" to combine them into one file</li>
              <li className="pl-2">The merged PDF will be downloaded automatically</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfMerger;
