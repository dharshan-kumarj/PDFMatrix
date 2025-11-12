import { useState } from 'react';
import './App.css';
import PdfMerger from './components/PdfMerger';
import PdfSplitter from './components/PdfSplitter';
import PdfCompressor from './components/PdfCompressor';
import PdfRotation from './components/PdfRotation';
import PdfToImages from './components/PdfToImages';
import ImagesToPdf from './components/ImagesToPdf';
import PdfPageNumbers from './components/PdfPageNumbers';
import PdfWatermark from './components/PdfWatermark';
// import PdfPasswordProtection from './components/PdfPasswordProtection'; // TODO: Implement with backend for real encryption

function App() {
  const [activeTab, setActiveTab] = useState<'merger' | 'splitter' | 'compressor' | 'rotation' | 'pdfToImages' | 'imagesToPdf' | 'pageNumbers' | 'watermark'>('merger');

  return (
    <div>
      {/* Tab Navigation */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('merger')}
              className={`px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'merger'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              📄 PDF Merger
            </button>
            <button
              onClick={() => setActiveTab('splitter')}
              className={`px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'splitter'
                  ? 'text-purple-600 border-purple-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              ✂️ PDF Splitter
            </button>
            <button
              onClick={() => setActiveTab('compressor')}
              className={`px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'compressor'
                  ? 'text-green-600 border-green-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              🗜️ PDF Compressor
            </button>
            <button
              onClick={() => setActiveTab('rotation')}
              className={`px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'rotation'
                  ? 'text-orange-600 border-orange-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              🔄 PDF Rotation
            </button>
            <button
              onClick={() => setActiveTab('pdfToImages')}
              className={`px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'pdfToImages'
                  ? 'text-pink-600 border-pink-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              📄→🖼️ PDF to Images
            </button>
            <button
              onClick={() => setActiveTab('imagesToPdf')}
              className={`px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'imagesToPdf'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              🖼️→📄 Images to PDF
            </button>
            <button
              onClick={() => setActiveTab('pageNumbers')}
              className={`px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'pageNumbers'
                  ? 'text-cyan-600 border-cyan-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              🔢 Page Numbers
            </button>
            <button
              onClick={() => setActiveTab('watermark')}
              className={`px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'watermark'
                  ? 'text-teal-600 border-teal-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              💧 Watermark
            </button>
            {/* TODO: Add Password Protection when backend encryption is implemented */}
            {/* <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'password'
                  ? 'text-red-600 border-red-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              🔒 Password
            </button> */}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'merger' && <PdfMerger />}
      {activeTab === 'splitter' && <PdfSplitter />}
      {activeTab === 'compressor' && <PdfCompressor />}
      {activeTab === 'rotation' && <PdfRotation />}
      {activeTab === 'pdfToImages' && <PdfToImages />}
      {activeTab === 'imagesToPdf' && <ImagesToPdf />}
      {activeTab === 'pageNumbers' && <PdfPageNumbers />}
      {activeTab === 'watermark' && <PdfWatermark />}
      {/* {activeTab === 'password' && <PdfPasswordProtection />} */}
    </div>
  );
}

export default App;
