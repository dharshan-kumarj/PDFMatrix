import React, { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { TextBox } from '../types';

// Configure PDF.js worker - using local worker to avoid CORS issues
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PdfEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(null);

  // Load PDF
  const loadPdf = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    setPdfArrayBuffer(arrayBuffer);
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    setPdfDoc(pdf);
    setTotalPages(pdf.numPages);
    setCurrentPage(1);
    setTextBoxes([]);
  };

  // Render PDF page
  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    setCanvasWidth(viewport.width);
    setCanvasHeight(viewport.height);

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
  };

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale]);

  // Add text box
  const addTextBox = () => {
    const newBox: TextBox = {
      id: Date.now().toString(),
      text: 'New Text',
      x: 50,
      y: 50,
      width: 200,
      height: 40,
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000000',
    };
    setTextBoxes([...textBoxes, newBox]);
  };

  // Handle text box mouse down
  const handleMouseDown = (e: React.MouseEvent, boxId: string) => {
    e.preventDefault();
    setSelectedBox(boxId);
    setIsDragging(true);
    
    const box = textBoxes.find(b => b.id === boxId);
    if (box && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - box.x,
        y: e.clientY - rect.top - box.y,
      });
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedBox || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setTextBoxes(textBoxes.map(box =>
      box.id === selectedBox
        ? { ...box, x: Math.max(0, Math.min(x, canvasWidth - box.width)), y: Math.max(0, Math.min(y, canvasHeight - box.height)) }
        : box
    ));
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Update text box text
  const updateTextBoxText = (id: string, text: string) => {
    setTextBoxes(textBoxes.map(box =>
      box.id === id ? { ...box, text } : box
    ));
  };

  // Update text box font size
  const updateTextBoxFontSize = (id: string, fontSize: number) => {
    setTextBoxes(textBoxes.map(box =>
      box.id === id ? { ...box, fontSize } : box
    ));
  };

  // Update text box color
  const updateTextBoxColor = (id: string, color: string) => {
    setTextBoxes(textBoxes.map(box =>
      box.id === id ? { ...box, color } : box
    ));
  };

  // Delete text box
  const deleteTextBox = (id: string) => {
    setTextBoxes(textBoxes.filter(box => box.id !== id));
    if (selectedBox === id) {
      setSelectedBox(null);
    }
  };

  // Export PDF
  const exportPdf = async () => {
    if (!pdfArrayBuffer || !canvasRef.current) return;

    try {
      // Load the original PDF
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      
      // Get page dimensions
      const { width: pageWidth, height: pageHeight } = firstPage.getSize();
      
      // Calculate scale factor (canvas pixels to PDF points)
      const scaleX = pageWidth / canvasWidth;
      const scaleY = pageHeight / canvasHeight;

      // Embed font
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Add text boxes to PDF
      for (const box of textBoxes) {
        // Convert canvas coordinates to PDF coordinates
        // PDF origin is bottom-left, canvas is top-left
        const pdfX = box.x * scaleX;
        const pdfY = pageHeight - (box.y * scaleY) - (box.fontSize * scaleY);
        
        // Parse color
        const hexColor = box.color.replace('#', '');
        const r = parseInt(hexColor.substr(0, 2), 16) / 255;
        const g = parseInt(hexColor.substr(2, 2), 16) / 255;
        const b = parseInt(hexColor.substr(4, 2), 16) / 255;

        firstPage.drawText(box.text, {
          x: pdfX,
          y: pdfY,
          size: box.fontSize * scaleY,
          font: helveticaFont,
          color: rgb(r, g, b),
        });
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      
      // Download
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'edited-document.pdf';
      link.click();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">PDF Editor</h1>
          
          {/* File Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) loadPdf(file);
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          {/* Controls */}
          {pdfDoc && (
            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={addTextBox}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Add Text Box
              </button>
              
              <button
                onClick={exportPdf}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Export PDF
              </button>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Zoom:</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Editor Area */}
        {pdfDoc && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Canvas Container */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div
                  ref={containerRef}
                  className="relative inline-block border border-gray-300"
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ cursor: isDragging ? 'grabbing' : 'default' }}
                >
                  <canvas ref={canvasRef} className="block" />
                  
                  {/* Text Boxes Overlay */}
                  {textBoxes.map((box) => (
                    <div
                      key={box.id}
                      className={`absolute border-2 cursor-move ${
                        selectedBox === box.id ? 'border-indigo-500' : 'border-transparent hover:border-indigo-300'
                      }`}
                      style={{
                        left: box.x,
                        top: box.y,
                        width: box.width,
                        height: box.height,
                        fontSize: box.fontSize,
                        color: box.color,
                        fontFamily: box.fontFamily,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, box.id)}
                      onClick={() => setSelectedBox(box.id)}
                    >
                      <div className="p-1 whitespace-pre-wrap break-words">
                        {box.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Properties Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Properties</h2>
                
                {selectedBox ? (
                  <div className="space-y-4">
                    {(() => {
                      const box = textBoxes.find(b => b.id === selectedBox);
                      if (!box) return null;
                      
                      return (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Text
                            </label>
                            <textarea
                              value={box.text}
                              onChange={(e) => updateTextBoxText(box.id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              rows={3}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Font Size
                            </label>
                            <input
                              type="number"
                              value={box.fontSize}
                              onChange={(e) => updateTextBoxFontSize(box.id, parseInt(e.target.value) || 12)}
                              min="8"
                              max="72"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Color
                            </label>
                            <input
                              type="color"
                              value={box.color}
                              onChange={(e) => updateTextBoxColor(box.id, e.target.value)}
                              className="w-full h-10 rounded-md cursor-pointer"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>X: {Math.round(box.x)}px</div>
                            <div>Y: {Math.round(box.y)}px</div>
                            <div>W: {box.width}px</div>
                            <div>H: {box.height}px</div>
                          </div>

                          <button
                            onClick={() => deleteTextBox(box.id)}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            Delete Text Box
                          </button>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Select a text box to edit its properties
                  </p>
                )}

                {/* Text Boxes List */}
                {textBoxes.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Text Boxes</h3>
                    <div className="space-y-1">
                      {textBoxes.map((box) => (
                        <div
                          key={box.id}
                          onClick={() => setSelectedBox(box.id)}
                          className={`p-2 text-xs rounded cursor-pointer truncate ${
                            selectedBox === box.id
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {box.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!pdfDoc && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No PDF loaded</h3>
            <p className="text-gray-500">Upload a PDF file to start editing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfEditor;
