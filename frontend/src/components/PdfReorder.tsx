import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - using local worker from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PageInfo {
  id: string;
  pageNumber: number;
  thumbnail: string;
  width: number;
  height: number;
}

const PdfReorder: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [draggedPage, setDraggedPage] = useState<string | null>(null);
  const pdfFileRef = useRef<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      pdfFileRef.current = file;
      setPages([]);
      setSelectedPages(new Set());
      console.log('PDF file selected:', file.name);
      await loadPdfPages(file);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const loadPdfPages = async (file: File) => {
    setLoading(true);
    console.log('Loading PDF pages...');

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Load with PDF.js for thumbnails
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      console.log(`PDF loaded: ${numPages} pages`);

      const pageInfos: PageInfo[] = [];

      // Generate thumbnails for each page
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const thumbnail = canvas.toDataURL('image/png');
        
        pageInfos.push({
          id: `page-${i}-${Date.now()}`,
          pageNumber: i,
          thumbnail,
          width: viewport.width,
          height: viewport.height,
        });

        console.log(`Generated thumbnail for page ${i}`);
      }

      setPages(pageInfos);
      console.log('All thumbnails generated');
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Failed to load PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageSelect = (pageId: string) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageId)) {
      newSelected.delete(pageId);
    } else {
      newSelected.add(pageId);
    }
    setSelectedPages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPages.size === pages.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(pages.map(p => p.id)));
    }
  };

  const handleDragStart = (e: React.DragEvent, pageId: string) => {
    setDraggedPage(pageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetPageId: string) => {
    e.preventDefault();
    
    if (!draggedPage || draggedPage === targetPageId) {
      setDraggedPage(null);
      return;
    }

    const draggedIndex = pages.findIndex(p => p.id === draggedPage);
    const targetIndex = pages.findIndex(p => p.id === targetPageId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newPages = [...pages];
    const [removed] = newPages.splice(draggedIndex, 1);
    newPages.splice(targetIndex, 0, removed);

    setPages(newPages);
    setDraggedPage(null);
    console.log(`Moved page from position ${draggedIndex + 1} to ${targetIndex + 1}`);
  };

  const movePageUp = (pageId: string) => {
    const index = pages.findIndex(p => p.id === pageId);
    if (index <= 0) return;

    const newPages = [...pages];
    [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
    setPages(newPages);
    console.log(`Moved page ${index + 1} up`);
  };

  const movePageDown = (pageId: string) => {
    const index = pages.findIndex(p => p.id === pageId);
    if (index === -1 || index >= pages.length - 1) return;

    const newPages = [...pages];
    [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
    setPages(newPages);
    console.log(`Moved page ${index + 1} down`);
  };

  const duplicatePage = (pageId: string) => {
    const index = pages.findIndex(p => p.id === pageId);
    if (index === -1) return;

    const pageToDuplicate = pages[index];
    const duplicatedPage: PageInfo = {
      ...pageToDuplicate,
      id: `page-${pageToDuplicate.pageNumber}-${Date.now()}-duplicate`,
    };

    const newPages = [...pages];
    newPages.splice(index + 1, 0, duplicatedPage);
    setPages(newPages);
    console.log(`Duplicated page ${index + 1}`);
  };

  const deletePage = (pageId: string) => {
    if (pages.length === 1) {
      alert('Cannot delete the last page. PDF must have at least one page.');
      return;
    }

    const newPages = pages.filter(p => p.id !== pageId);
    setPages(newPages);
    
    // Remove from selection if selected
    const newSelected = new Set(selectedPages);
    newSelected.delete(pageId);
    setSelectedPages(newSelected);
    
    console.log(`Deleted page ${pageId}`);
  };

  const deleteSelectedPages = () => {
    if (selectedPages.size === 0) {
      alert('Please select pages to delete');
      return;
    }

    if (selectedPages.size === pages.length) {
      alert('Cannot delete all pages. PDF must have at least one page.');
      return;
    }

    const confirm = window.confirm(
      `Are you sure you want to delete ${selectedPages.size} page(s)?`
    );
    if (!confirm) return;

    const newPages = pages.filter(p => !selectedPages.has(p.id));
    setPages(newPages);
    setSelectedPages(new Set());
    console.log(`Deleted ${selectedPages.size} pages`);
  };

  const duplicateSelectedPages = () => {
    if (selectedPages.size === 0) {
      alert('Please select pages to duplicate');
      return;
    }

    const newPages = [...pages];
    const pagesToDuplicate: PageInfo[] = [];

    pages.forEach((page, index) => {
      if (selectedPages.has(page.id)) {
        pagesToDuplicate.push({
          ...page,
          id: `page-${page.pageNumber}-${Date.now()}-${index}-duplicate`,
        });
      }
    });

    // Add duplicates at the end
    newPages.push(...pagesToDuplicate);
    setPages(newPages);
    setSelectedPages(new Set());
    console.log(`Duplicated ${pagesToDuplicate.length} pages`);
  };

  const reverseOrder = () => {
    const newPages = [...pages].reverse();
    setPages(newPages);
    console.log('Reversed page order');
  };

  const generateReorderedPdf = async () => {
    if (!pdfFileRef.current || pages.length === 0) {
      alert('No PDF loaded or no pages available');
      return;
    }

    setGenerating(true);
    console.log('Generating reordered PDF...');

    try {
      // Read fresh ArrayBuffer from file to avoid detached buffer issue
      const arrayBuffer = await pdfFileRef.current.arrayBuffer();
      
      // Load the original PDF
      const originalPdf = await PDFDocument.load(arrayBuffer);
      
      // Create a new PDF
      const newPdf = await PDFDocument.create();

      console.log(`Reordering ${pages.length} pages...`);

      // Copy pages in the new order
      for (let i = 0; i < pages.length; i++) {
        const pageInfo = pages[i];
        
        // Copy the page from original PDF (pageNumber is 1-indexed)
        const [copiedPage] = await newPdf.copyPages(originalPdf, [pageInfo.pageNumber - 1]);
        newPdf.addPage(copiedPage);
        
        console.log(`Added page ${pageInfo.pageNumber} at position ${i + 1}`);
      }

      // Save the new PDF
      const pdfBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfFile?.name.replace('.pdf', '') || 'document'}_reordered.pdf`;
      link.click();

      console.log('Reordered PDF created successfully');
      alert('PDF pages reordered successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate reordered PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-100 mb-2">
              🔄 Reorder PDF Pages
            </h1>
            <p className="text-gray-300">
              Drag-and-drop, reorder, duplicate, and delete pages
            </p>
          </div>

          {/* File Upload */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-green-400 mb-3">
              📄 Select PDF File
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-3 file:px-6
                file:rounded-xl file:border-0
                file:text-sm file:font-semibold
                file:bg-gradient-to-r file:from-green-500 file:to-emerald-600 file:text-black file:shadow-lg file:shadow-green-500/30
                hover:file:from-green-400 hover:file:to-emerald-500 file:cursor-pointer
                cursor-pointer border-2 border-dashed border-gray-300
                rounded-xl p-4 hover:border-indigo-400 transition-colors"
            />
            {pdfFile && (
              <p className="mt-3 text-sm text-gray-300 bg-indigo-50 p-3 rounded-xl">
                ✓ Selected: <span className="font-semibold">{pdfFile.name}</span>
                {' - '}
                <span className="font-semibold">{pages.length} pages</span>
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-300 font-semibold">Loading pages and generating thumbnails...</p>
            </div>
          )}

          {/* Toolbar */}
          {pages.length > 0 && !loading && (
            <div className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-200">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-400 hover:to-emerald-500 transition-colors"
                >
                  {selectedPages.size === pages.length ? '❌ Deselect All' : '✅ Select All'}
                </button>
                <button
                  onClick={deleteSelectedPages}
                  disabled={selectedPages.size === 0}
                  className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                    selectedPages.size === 0
                      ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  🗑️ Delete Selected ({selectedPages.size})
                </button>
                <button
                  onClick={duplicateSelectedPages}
                  disabled={selectedPages.size === 0}
                  className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                    selectedPages.size === 0
                      ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-400 hover:to-emerald-500'
                  }`}
                >
                  📋 Duplicate Selected ({selectedPages.size})
                </button>
                <button
                  onClick={reverseOrder}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-400 hover:to-emerald-500 transition-colors"
                >
                  🔃 Reverse Order
                </button>
                <div className="ml-auto">
                  <button
                    onClick={generateReorderedPdf}
                    disabled={generating}
                    className={`px-6 py-2 rounded-xl font-bold transition-colors ${
                      generating
                        ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700'
                    }`}
                  >
                    {generating ? '⏳ Generating...' : '💾 Save Reordered PDF'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pages Grid */}
          {pages.length > 0 && !loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, page.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, page.id)}
                  className={`relative bg-white rounded-xl shadow-lg overflow-hidden transition-all cursor-move ${
                    selectedPages.has(page.id)
                      ? 'ring-4 ring-indigo-500 scale-95'
                      : 'hover:shadow-xl hover:scale-105'
                  } ${draggedPage === page.id ? 'opacity-50' : ''}`}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedPages.has(page.id)}
                      onChange={() => handlePageSelect(page.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Page Number Badge */}
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                    {index + 1}
                  </div>

                  {/* Thumbnail */}
                  <div className="aspect-[3/4] bg-gray-800/50 flex items-center justify-center overflow-hidden">
                    <img
                      src={page.thumbnail}
                      alt={`Page ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="p-3 bg-gradient-to-r from-gray-800 to-gray-900 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => movePageUp(page.id)}
                        disabled={index === 0}
                        className={`p-2 rounded-xl text-sm font-semibold transition-colors ${
                          index === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-gradient-to-r from-green-500 to-emerald-600'
                        }`}
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => movePageDown(page.id)}
                        disabled={index === pages.length - 1}
                        className={`p-2 rounded-xl text-sm font-semibold transition-colors ${
                          index === pages.length - 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-gradient-to-r from-green-500 to-emerald-600'
                        }`}
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => duplicatePage(page.id)}
                        className="p-2 rounded-xl text-sm font-semibold bg-green-500 text-white hover:bg-gradient-to-r from-green-500 to-emerald-600 transition-colors"
                        title="Duplicate"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => deletePage(page.id)}
                        disabled={pages.length === 1}
                        className={`p-2 rounded-xl text-sm font-semibold transition-colors ${
                          pages.length === 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="text-xs text-gray-400 text-center mt-2">
                      Original: Page {page.pageNumber}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && pages.length === 0 && pdfFile && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">No pages loaded. Please try selecting a different PDF file.</p>
            </div>
          )}

          {/* Info Section */}
          {pages.length > 0 && !loading && (
            <div className="mt-8 bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <span>💡</span> How to Reorder Pages
              </h3>
              <ul className="space-y-2 text-sm text-green-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Drag & Drop:</strong> Click and drag any page thumbnail to reorder</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Move Buttons:</strong> Use ▲ and ▼ buttons to move pages up or down</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Select Multiple:</strong> Check boxes to select pages, then use bulk actions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Duplicate:</strong> Create copies of pages using the 📋 button</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Delete:</strong> Remove unwanted pages (must keep at least 1 page)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Reverse Order:</strong> Quickly flip the entire page order</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Save:</strong> Click "Save Reordered PDF" to download your reordered document</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfReorder;
