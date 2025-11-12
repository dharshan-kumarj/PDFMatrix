import { useState } from 'react';
import './App.css';
import PdfMerger from './components/PdfMerger';
import PdfSplitter from './components/PdfSplitter';

function App() {
  const [activeTab, setActiveTab] = useState<'merger' | 'splitter'>('merger');

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
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'merger' ? <PdfMerger /> : <PdfSplitter />}
    </div>
  );
}

export default App;
