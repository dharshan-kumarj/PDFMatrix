import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PageRotation {
  pageNumber: number;
  rotation: number; // 0, 90, 180, 270
  thumbnail: string;
}

const PdfRotation: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pageRotations, setPageRotations] = useState<PageRotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  // Handle PDF file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file');
      return;
    }

    try {
      setIsLoading(true);
      setPdfFile(file);

      const arrayBuffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer).slice(0);
      setPdfData(pdfBytes);

      // Load with PDF.js for rendering
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);

      // Generate thumbnails and initialize rotations
      await generateThumbnails(pdf);

      console.log(`PDF loaded: ${pdf.numPages} pages`);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error loading PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate thumbnails for all pages
  const generateThumbnails = async (pdf: any) => {
    const rotations: PageRotation[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          const thumbnail = canvas.toDataURL('image/png');
          rotations.push({
            pageNumber: pageNum,
            rotation: 0,
            thumbnail,
          });
        }
      } catch (error) {
        console.error(`Error generating thumbnail for page ${pageNum}:`, error);
      }
    }

    setPageRotations(rotations);
  };

  // Rotate specific page
  const rotatePage = (pageNumber: number, angle: number) => {
    setPageRotations(prev =>
      prev.map(p =>
        p.pageNumber === pageNumber
          ? { ...p, rotation: (p.rotation + angle) % 360 }
          : p
      )
    );
  };

  // Rotate all pages
  const rotateAllPages = (angle: number) => {
    setPageRotations(prev =>
      prev.map(p => ({
        ...p,
        rotation: (p.rotation + angle) % 360,
      }))
    );
  };

  // Rotate selected pages
  const rotateSelectedPages = (angle: number) => {
    if (selectedPages.size === 0) {
      alert('Please select at least one page to rotate');
      return;
    }

    setPageRotations(prev =>
      prev.map(p =>
        selectedPages.has(p.pageNumber)
          ? { ...p, rotation: (p.rotation + angle) % 360 }
          : p
      )
    );
  };

  // Toggle page selection
  const togglePageSelection = (pageNumber: number) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageNumber)) {
        newSet.delete(pageNumber);
      } else {
        newSet.add(pageNumber);
      }
      return newSet;
    });
  };

  // Select all pages
  const selectAllPages = () => {
    setSelectedPages(new Set(pageRotations.map(p => p.pageNumber)));
  };

  // Deselect all pages
  const deselectAllPages = () => {
    setSelectedPages(new Set());
  };

  // Reset all rotations
  const resetRotations = () => {
    setPageRotations(prev =>
      prev.map(p => ({ ...p, rotation: 0 }))
    );
  };

  // Apply rotations and download
  const applyRotationsAndDownload = async () => {
    if (!pdfData) {
      alert('No PDF loaded');
      return;
    }

    // Check if any rotation is applied
    const hasRotations = pageRotations.some(p => p.rotation !== 0);
    if (!hasRotations) {
      alert('No rotations applied. Please rotate at least one page.');
      return;
    }

    setIsRotating(true);

    try {
      console.log('Applying rotations...');

      // Load PDF with pdf-lib
      const pdfDoc = await PDFDocument.load(pdfData);
      const pages = pdfDoc.getPages();

      // Apply rotations to each page
      pageRotations.forEach((pageRot, index) => {
        if (pageRot.rotation !== 0) {
          const page = pages[index];
          // Get current rotation and add new rotation
          const currentRotation = page.getRotation().angle;
          const newRotation = (currentRotation + pageRot.rotation) % 360;
          page.setRotation(degrees(newRotation));
          console.log(`Page ${pageRot.pageNumber}: Rotated ${pageRot.rotation}°`);
        }
      });

      // Save rotated PDF
      const rotatedPdfBytes = await pdfDoc.save();

      // Download
      const uint8Array = new Uint8Array(rotatedPdfBytes);
      const blob = new Blob([uint8Array], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfFile?.name.replace('.pdf', '_rotated.pdf') || 'rotated.pdf';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);

      alert('PDF rotated successfully!');
    } catch (error) {
      console.error('Error rotating PDF:', error);
      alert('Error rotating PDF. Please try again.');
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🔄 PDF Rotation</h1>

          {/* File Upload Section */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Select PDF file to rotate
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-50 file:text-orange-700
                hover:file:bg-orange-100
                cursor-pointer"
            />
            {pdfFile && (
              <p className="mt-2 text-sm text-gray-600">
                📄 <strong>{pdfFile.name}</strong> - {totalPages} pages
              </p>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              <p className="mt-4 text-gray-600">Loading PDF pages...</p>
            </div>
          )}

          {/* Main Controls */}
          {!isLoading && pdfFile && pageRotations.length > 0 && (
            <>
              {/* Global Rotation Controls */}
              <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Rotate All */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Rotate All Pages</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => rotateAllPages(90)}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium text-sm"
                      >
                        ↻ 90° Right
                      </button>
                      <button
                        onClick={() => rotateAllPages(-90)}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium text-sm"
                      >
                        ↺ 90° Left
                      </button>
                      <button
                        onClick={() => rotateAllPages(180)}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium text-sm"
                      >
                        ⟲ 180°
                      </button>
                    </div>
                  </div>

                  {/* Rotate Selected */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Rotate Selected ({selectedPages.size} pages)
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => rotateSelectedPages(90)}
                        disabled={selectedPages.size === 0}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm"
                      >
                        ↻ 90° Right
                      </button>
                      <button
                        onClick={() => rotateSelectedPages(-90)}
                        disabled={selectedPages.size === 0}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm"
                      >
                        ↺ 90° Left
                      </button>
                      <button
                        onClick={() => rotateSelectedPages(180)}
                        disabled={selectedPages.size === 0}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm"
                      >
                        ⟲ 180°
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selection Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={selectAllPages}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllPages}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    Deselect All
                  </button>
                  <button
                    onClick={resetRotations}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    Reset All Rotations
                  </button>
                </div>
              </div>

              {/* Page Thumbnails Grid */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Pages (Click to select, then use individual controls)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {pageRotations.map((page) => (
                    <div
                      key={page.pageNumber}
                      className={`relative border-2 rounded-lg overflow-hidden transition-all cursor-pointer ${
                        selectedPages.has(page.pageNumber)
                          ? 'border-orange-500 bg-orange-50 shadow-lg'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                      onClick={() => togglePageSelection(page.pageNumber)}
                    >
                      {/* Selection Indicator */}
                      {selectedPages.has(page.pageNumber) && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10">
                          ✓
                        </div>
                      )}

                      {/* Page Thumbnail */}
                      <div className="bg-gray-100 p-2">
                        <img
                          src={page.thumbnail}
                          alt={`Page ${page.pageNumber}`}
                          className="w-full h-auto"
                          style={{
                            transform: `rotate(${page.rotation}deg)`,
                            transition: 'transform 0.3s ease',
                          }}
                        />
                      </div>

                      {/* Page Info & Controls */}
                      <div className="p-3 bg-white">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Page {page.pageNumber}
                          {page.rotation !== 0 && (
                            <span className="ml-2 text-orange-600">({page.rotation}°)</span>
                          )}
                        </p>

                        {/* Individual Rotation Buttons */}
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              rotatePage(page.pageNumber, -90);
                            }}
                            className="flex-1 px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                            title="Rotate left 90°"
                          >
                            ↺
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              rotatePage(page.pageNumber, 90);
                            }}
                            className="flex-1 px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                            title="Rotate right 90°"
                          >
                            ↻
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              rotatePage(page.pageNumber, 180);
                            }}
                            className="flex-1 px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                            title="Rotate 180°"
                          >
                            ⟲
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={applyRotationsAndDownload}
                disabled={isRotating}
                className="w-full px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg
                  hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                  transition-colors shadow-md hover:shadow-lg"
              >
                {isRotating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Applying Rotations...
                  </span>
                ) : (
                  '🔄 Apply Rotations & Download'
                )}
              </button>
            </>
          )}

          {/* Info Section */}
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="text-sm font-semibold text-orange-800 mb-2">📖 How to use:</h3>
            <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
              <li>Upload a PDF file</li>
              <li>Use "Rotate All" to rotate all pages at once</li>
              <li>Click pages to select them, then use "Rotate Selected"</li>
              <li>Or rotate pages individually using the buttons below each thumbnail</li>
              <li>Click "Apply Rotations & Download" to save your rotated PDF</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfRotation;
