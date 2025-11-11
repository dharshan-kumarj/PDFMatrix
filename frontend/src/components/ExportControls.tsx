import { useState } from 'react';
import { usePdfStore } from '../store/pdfStore';

export const ExportControls = () => {
  const { webViewerInstance, pdfFile, isEditorReady } = usePdfStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!webViewerInstance || !isEditorReady) {
      alert('Please wait for the document to load');
      return;
    }

    try {
      setIsExporting(true);
      const { Core } = webViewerInstance;
      const doc = Core.documentViewer.getDocument();
      
      // Get the PDF data
      const data = await doc.getFileData({
        // Include annotations and changes
        xfdfString: await Core.annotationManager.exportAnnotations(),
      });
      
      // Create a blob from the data
      const blob = new Blob([data], { type: 'application/pdf' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const originalName = pdfFile?.name || 'document.pdf';
      const nameWithoutExt = originalName.replace('.pdf', '');
      link.download = `${nameWithoutExt}_edited.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
      
      setIsExporting(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (!webViewerInstance || !isEditorReady) {
      alert('Please wait for the document to load');
      return;
    }

    const { UI } = webViewerInstance;
    UI.print();
  };

  if (!pdfFile) return null;

  return (
    <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">Current file:</p>
        <p className="font-semibold text-gray-800 truncate">{pdfFile.name}</p>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={handlePrint}
          disabled={!isEditorReady}
          className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
        
        <button
          onClick={handleExport}
          disabled={isExporting || !isEditorReady}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 flex items-center gap-2"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Edited PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
};
