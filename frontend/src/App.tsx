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
import PdfResize from './components/PdfResize';
import PdfReorder from './components/PdfReorder';

type TabType = 'merger' | 'splitter' | 'compressor' | 'rotation' | 'pdfToImages' | 'imagesToPdf' | 'pageNumbers' | 'watermark' | 'resize' | 'reorder';

interface MenuItem {
  id: TabType;
  label: string;
  icon: string;
  description: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('merger');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { id: 'merger', label: 'Merge PDF', icon: '📄', description: 'Combine multiple PDFs' },
    { id: 'splitter', label: 'Split PDF', icon: '✂️', description: 'Split PDF into parts' },
    { id: 'compressor', label: 'Compress PDF', icon: '🗜️', description: 'Reduce file size' },
    { id: 'rotation', label: 'Rotate Pages', icon: '🔄', description: 'Rotate PDF pages' },
    { id: 'pdfToImages', label: 'PDF to Images', icon: '🖼️', description: 'Convert to images' },
    { id: 'imagesToPdf', label: 'Images to PDF', icon: '📸', description: 'Create PDF from images' },
    { id: 'pageNumbers', label: 'Page Numbers', icon: '🔢', description: 'Add page numbers' },
    { id: 'watermark', label: 'Watermark', icon: '💧', description: 'Add watermarks' },
    { id: 'resize', label: 'Resize Pages', icon: '📐', description: 'Change page size' },
    { id: 'reorder', label: 'Reorder Pages', icon: '🔀', description: 'Rearrange pages' },
  ];

  const currentTool = menuItems.find(item => item.id === activeTab);

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-gradient-to-b from-gray-900 to-black
        border-r border-green-500/20
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/50">
              <span className="text-2xl font-bold text-black">P</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                PDFMatrix
              </h1>
              <p className="text-xs text-gray-400">Professional PDF Tools</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-green-500/20 scrollbar-track-transparent">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full text-left px-4 py-3 rounded-xl
                  transition-all duration-200
                  group relative overflow-hidden
                  ${activeTab === item.id
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 shadow-lg shadow-green-500/20'
                    : 'hover:bg-gray-800/50 border border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <span className={`
                    text-2xl transition-transform duration-200
                    ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}
                  `}>
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`
                      font-semibold text-sm truncate
                      ${activeTab === item.id ? 'text-green-400' : 'text-gray-300 group-hover:text-green-400'}
                    `}>
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.description}
                    </p>
                  </div>
                </div>
                {activeTab === item.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-green-500/20">
          <div className="bg-gray-900/50 rounded-xl p-3 border border-green-500/10">
            <p className="text-xs text-gray-400 text-center">
              🚀 <span className="text-green-400 font-semibold">100%</span> Client-Side Processing
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              Your files never leave your device
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-gradient-to-r from-gray-900 to-black border-b border-green-500/20 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-800 border border-green-500/20 text-green-400 hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Current Tool Info */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg items-center justify-center shadow-lg shadow-green-500/30">
                  <span className="text-2xl">{currentTool?.icon}</span>
                </div>
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-green-400">
                    {currentTool?.label}
                  </h2>
                  <p className="text-xs text-gray-400 hidden sm:block">
                    {currentTool?.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-950 via-black to-gray-900">
          <div className="min-h-full">
            {activeTab === 'merger' && <PdfMerger />}
            {activeTab === 'splitter' && <PdfSplitter />}
            {activeTab === 'compressor' && <PdfCompressor />}
            {activeTab === 'rotation' && <PdfRotation />}
            {activeTab === 'pdfToImages' && <PdfToImages />}
            {activeTab === 'imagesToPdf' && <ImagesToPdf />}
            {activeTab === 'pageNumbers' && <PdfPageNumbers />}
            {activeTab === 'watermark' && <PdfWatermark />}
            {activeTab === 'resize' && <PdfResize />}
            {activeTab === 'reorder' && <PdfReorder />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
