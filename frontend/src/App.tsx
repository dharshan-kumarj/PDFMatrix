import './App.css';
import { PdfUploader } from './components/PdfUploader';
import { PdfEditor } from './components/PdfEditor';
import { ExportControls } from './components/ExportControls';
import { usePdfStore } from './store/pdfStore';

function App() {
  const { pdfUrl, resetState } = usePdfStore();

  const handleReset = () => {
    if (confirm('Are you sure you want to upload a new PDF? Any unsaved changes will be lost.')) {
      resetState();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PDFMatrix
            </h1>
          </div>
          
          {pdfUrl && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload New PDF
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {!pdfUrl ? (
          // Upload View
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="mb-8 text-center">
              <h2 className="text-4xl font-bold text-white mb-3">
                Professional PDF Editor
              </h2>
              <p className="text-lg text-white/90">
                Upload, edit, and export your PDF documents with ease
              </p>
            </div>
            <PdfUploader />
            
            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Real-time Editing</h3>
                <p className="text-sm text-white/80">Edit text directly in your PDF with WYSIWYG editor</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Advanced Tools</h3>
                <p className="text-sm text-white/80">Resize, format, and style your PDF content</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Easy Export</h3>
                <p className="text-sm text-white/80">Download your edited PDF instantly</p>
              </div>
            </div>
          </div>
        ) : (
          // Editor View
          <div className="space-y-6">
            <ExportControls />
            
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
              <PdfEditor />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-6 text-center text-white/80">
        <p className="text-sm">Powered by Apryse WebViewer | Built with React & Tailwind CSS</p>
      </footer>
    </div>
  );
}

export default App;
