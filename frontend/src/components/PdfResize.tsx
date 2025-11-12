import React, { useState } from 'react';
import { PDFDocument, PDFPage } from 'pdf-lib';

type PageSize = 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5' | 'Tabloid' | 'Custom';
type FitMode = 'fit' | 'fill' | 'stretch' | 'none';

interface PageDimensions {
  width: number;
  height: number;
}

const PdfResize: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPageSize, setCurrentPageSize] = useState<string>('Unknown');
  const [pageCount, setPageCount] = useState<number>(0);

  // Resize settings
  const [targetPageSize, setTargetPageSize] = useState<PageSize>('A4');
  const [customWidth, setCustomWidth] = useState(612); // 8.5 inches in points
  const [customHeight, setCustomHeight] = useState(792); // 11 inches in points
  const [fitMode, setFitMode] = useState<FitMode>('fit');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // Margin cropping
  const [cropMargins, setCropMargins] = useState(false);
  const [marginTop, setMarginTop] = useState(36); // 0.5 inch in points
  const [marginBottom, setMarginBottom] = useState(36);
  const [marginLeft, setMarginLeft] = useState(36);
  const [marginRight, setMarginRight] = useState(36);

  // Apply to specific pages
  const [applyToAllPages, setApplyToAllPages] = useState(true);
  const [specificPages, setSpecificPages] = useState('');

  // Page size presets in points (1 inch = 72 points)
  const pageSizes: Record<PageSize, PageDimensions> = {
    'A4': { width: 595, height: 842 },
    'Letter': { width: 612, height: 792 },
    'Legal': { width: 612, height: 1008 },
    'A3': { width: 842, height: 1191 },
    'A5': { width: 420, height: 595 },
    'Tabloid': { width: 792, height: 1224 },
    'Custom': { width: customWidth, height: customHeight },
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      console.log('PDF file selected:', file.name);
      
      // Analyze the PDF to get current page size
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        setPageCount(pages.length);
        
        if (pages.length > 0) {
          const firstPage = pages[0];
          const { width, height } = firstPage.getSize();
          const detectedSize = detectPageSize(width, height);
          setCurrentPageSize(detectedSize);
          console.log(`Current page size: ${detectedSize} (${width} x ${height} points)`);
        }
      } catch (error) {
        console.error('Error analyzing PDF:', error);
      }
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const detectPageSize = (width: number, height: number): string => {
    const tolerance = 5; // Allow 5 points tolerance
    
    for (const [name, size] of Object.entries(pageSizes)) {
      if (name === 'Custom') continue;
      
      // Check portrait
      if (Math.abs(width - size.width) < tolerance && Math.abs(height - size.height) < tolerance) {
        return `${name} (Portrait)`;
      }
      
      // Check landscape
      if (Math.abs(width - size.height) < tolerance && Math.abs(height - size.width) < tolerance) {
        return `${name} (Landscape)`;
      }
    }
    
    return `Custom (${Math.round(width)} x ${Math.round(height)} pt)`;
  };

  const parsePageNumbers = (input: string, totalPages: number): number[] => {
    if (!input.trim()) return [];
    
    const pages = new Set<number>();
    const parts = input.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number);
        if (start && end && start <= end) {
          for (let i = start; i <= Math.min(end, totalPages); i++) {
            pages.add(i);
          }
        }
      } else {
        const pageNum = Number(trimmed);
        if (pageNum && pageNum <= totalPages) {
          pages.add(pageNum);
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const getTargetDimensions = (): PageDimensions => {
    let dims = pageSizes[targetPageSize];
    
    // Swap dimensions for landscape
    if (orientation === 'landscape') {
      return { width: dims.height, height: dims.width };
    }
    
    return dims;
  };

  const resizePage = (
    page: PDFPage,
    targetWidth: number,
    targetHeight: number,
    mode: FitMode
  ) => {
    const { width: currentWidth, height: currentHeight } = page.getSize();
    
    if (mode === 'none') {
      // Just change page size without scaling content
      page.setSize(targetWidth, targetHeight);
      return;
    }

    if (mode === 'stretch') {
      // Stretch to fill entire page
      const scaleX = targetWidth / currentWidth;
      const scaleY = targetHeight / currentHeight;
      page.scale(scaleX, scaleY);
      page.setSize(targetWidth, targetHeight);
      return;
    }

    if (mode === 'fit') {
      // Scale proportionally to fit within page
      const scaleX = targetWidth / currentWidth;
      const scaleY = targetHeight / currentHeight;
      const scale = Math.min(scaleX, scaleY);
      
      page.scale(scale, scale);
      
      // Center the content
      const scaledWidth = currentWidth * scale;
      const scaledHeight = currentHeight * scale;
      const offsetX = (targetWidth - scaledWidth) / 2;
      const offsetY = (targetHeight - scaledHeight) / 2;
      
      page.setSize(targetWidth, targetHeight);
      page.translateContent(offsetX, offsetY);
      return;
    }

    if (mode === 'fill') {
      // Scale proportionally to fill entire page (may crop)
      const scaleX = targetWidth / currentWidth;
      const scaleY = targetHeight / currentHeight;
      const scale = Math.max(scaleX, scaleY);
      
      page.scale(scale, scale);
      
      // Center the content
      const scaledWidth = currentWidth * scale;
      const scaledHeight = currentHeight * scale;
      const offsetX = (targetWidth - scaledWidth) / 2;
      const offsetY = (targetHeight - scaledHeight) / 2;
      
      page.setSize(targetWidth, targetHeight);
      page.translateContent(offsetX, offsetY);
      return;
    }
  };

  const cropPageMargins = (page: PDFPage) => {
    const { width, height } = page.getSize();
    
    // Calculate new dimensions
    const newWidth = width - marginLeft - marginRight;
    const newHeight = height - marginTop - marginBottom;
    
    if (newWidth <= 0 || newHeight <= 0) {
      console.warn('Margins too large, skipping crop');
      return;
    }
    
    // Set crop box
    page.setCropBox(marginLeft, marginBottom, newWidth, newHeight);
    
    // Adjust page size to cropped dimensions
    page.setSize(newWidth, newHeight);
    
    // Translate content to account for cropped margins
    page.translateContent(-marginLeft, -marginBottom);
  };

  const resizePdf = async () => {
    if (!pdfFile) {
      alert('Please select a PDF file first');
      return;
    }

    setLoading(true);
    console.log('Resizing PDF pages...');

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      console.log(`PDF loaded: ${totalPages} pages`);

      // Determine which pages to resize
      let pagesToResize: number[];
      if (applyToAllPages) {
        pagesToResize = Array.from({ length: totalPages }, (_, i) => i + 1);
      } else {
        pagesToResize = parsePageNumbers(specificPages, totalPages);
        if (pagesToResize.length === 0) {
          alert('Please specify valid page numbers');
          setLoading(false);
          return;
        }
      }

      console.log(`Resizing pages: ${pagesToResize.join(', ')}`);

      const targetDims = getTargetDimensions();
      console.log(`Target size: ${targetDims.width} x ${targetDims.height} points`);
      console.log(`Fit mode: ${fitMode}`);
      console.log(`Crop margins: ${cropMargins}`);

      for (const pageNum of pagesToResize) {
        const page = pages[pageNum - 1];
        const originalSize = page.getSize();
        
        console.log(`Processing page ${pageNum} (original: ${Math.round(originalSize.width)} x ${Math.round(originalSize.height)})`);

        // First crop margins if enabled
        if (cropMargins) {
          cropPageMargins(page);
          console.log(`  - Cropped margins: T:${marginTop} R:${marginRight} B:${marginBottom} L:${marginLeft}`);
        }

        // Then resize to target dimensions
        resizePage(page, targetDims.width, targetDims.height, fitMode);
        
        const newSize = page.getSize();
        console.log(`  - Resized to: ${Math.round(newSize.width)} x ${Math.round(newSize.height)}`);
      }

      // Save the resized PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfFile.name.replace('.pdf', '')}_resized.pdf`;
      link.click();

      console.log('Resized PDF created successfully');
      alert('PDF pages resized successfully!');
    } catch (error) {
      console.error('Error resizing PDF:', error);
      alert('Failed to resize PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              📐 Resize PDF Pages
            </h1>
            <p className="text-gray-300">
              Change page size, fit content, and crop margins
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
                rounded-xl p-4 hover:border-violet-400 transition-colors"
            />
            {pdfFile && (
              <div className="mt-3 text-sm bg-green-500/20 p-4 rounded-xl space-y-2">
                <p className="text-gray-300">
                  ✓ Selected: <span className="font-semibold">{pdfFile.name}</span>
                </p>
                <p className="text-gray-300">
                  📄 Pages: <span className="font-semibold">{pageCount}</span>
                </p>
                <p className="text-gray-300">
                  📏 Current Size: <span className="font-semibold">{currentPageSize}</span>
                </p>
              </div>
            )}
          </div>

          {/* Target Page Size */}
          <div className="mb-8 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border-2 border-violet-200">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>📏</span> Target Page Size
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Page Size Preset */}
              <div>
                <label className="block text-sm font-semibold text-green-400 mb-3">
                  Page Size
                </label>
                <select
                  value={targetPageSize}
                  onChange={(e) => setTargetPageSize(e.target.value as PageSize)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="A4">A4 (595 x 842 pt)</option>
                  <option value="Letter">Letter (612 x 792 pt)</option>
                  <option value="Legal">Legal (612 x 1008 pt)</option>
                  <option value="A3">A3 (842 x 1191 pt)</option>
                  <option value="A5">A5 (420 x 595 pt)</option>
                  <option value="Tabloid">Tabloid (792 x 1224 pt)</option>
                  <option value="Custom">Custom Size</option>
                </select>
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-sm font-semibold text-green-400 mb-3">
                  Orientation
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setOrientation('portrait')}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                      orientation === 'portrait'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                        : 'bg-white border-2 border-gray-300 text-green-400 hover:border-violet-400'
                    }`}
                  >
                    📄 Portrait
                  </button>
                  <button
                    onClick={() => setOrientation('landscape')}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                      orientation === 'landscape'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                        : 'bg-white border-2 border-gray-300 text-green-400 hover:border-violet-400'
                    }`}
                  >
                    📄 Landscape
                  </button>
                </div>
              </div>

              {/* Custom Dimensions */}
              {targetPageSize === 'Custom' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-green-400 mb-3">
                      Width (points)
                    </label>
                    <input
                      type="number"
                      min="72"
                      max="2000"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {(customWidth / 72).toFixed(2)} inches
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-green-400 mb-3">
                      Height (points)
                    </label>
                    <input
                      type="number"
                      min="72"
                      max="3000"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {(customHeight / 72).toFixed(2)} inches
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Target Size Info */}
            <div className="mt-4 bg-white rounded-xl p-4 border-2 border-green-500/20">
              <p className="text-sm text-gray-300">
                📐 Target: <span className="font-semibold">
                  {Math.round(getTargetDimensions().width)} x {Math.round(getTargetDimensions().height)} points
                  ({(getTargetDimensions().width / 72).toFixed(2)} x {(getTargetDimensions().height / 72).toFixed(2)} inches)
                </span>
              </p>
            </div>
          </div>

          {/* Fit Mode */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>🎯</span> Content Fitting Mode
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => setFitMode('fit')}
                className={`py-4 px-4 rounded-xl font-semibold transition-all ${
                  fitMode === 'fit'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-white border-2 border-gray-300 text-green-400 hover:border-blue-400'
                }`}
              >
                <div className="text-2xl mb-1">📦</div>
                <div className="text-sm">Fit</div>
              </button>
              <button
                onClick={() => setFitMode('fill')}
                className={`py-4 px-4 rounded-xl font-semibold transition-all ${
                  fitMode === 'fill'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-white border-2 border-gray-300 text-green-400 hover:border-blue-400'
                }`}
              >
                <div className="text-2xl mb-1">📐</div>
                <div className="text-sm">Fill</div>
              </button>
              <button
                onClick={() => setFitMode('stretch')}
                className={`py-4 px-4 rounded-xl font-semibold transition-all ${
                  fitMode === 'stretch'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-white border-2 border-gray-300 text-green-400 hover:border-blue-400'
                }`}
              >
                <div className="text-2xl mb-1">↔️</div>
                <div className="text-sm">Stretch</div>
              </button>
              <button
                onClick={() => setFitMode('none')}
                className={`py-4 px-4 rounded-xl font-semibold transition-all ${
                  fitMode === 'none'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-white border-2 border-gray-300 text-green-400 hover:border-blue-400'
                }`}
              >
                <div className="text-2xl mb-1">⊡</div>
                <div className="text-sm">None</div>
              </button>
            </div>

            <div className="mt-4 bg-white rounded-xl p-4 border-2 border-green-500/20">
              <p className="text-sm text-gray-300">
                {fitMode === 'fit' && '📦 Fit: Scales content proportionally to fit within page (maintains aspect ratio)'}
                {fitMode === 'fill' && '📐 Fill: Scales content proportionally to fill entire page (may crop edges)'}
                {fitMode === 'stretch' && '↔️ Stretch: Stretches content to fill page (may distort aspect ratio)'}
                {fitMode === 'none' && '⊡ None: Changes page size only without scaling content'}
              </p>
            </div>
          </div>

          {/* Margin Cropping */}
          <div className="mb-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>✂️</span> Crop Margins
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  Remove margins from pages before resizing
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cropMargins}
                  onChange={(e) => setCropMargins(e.target.checked)}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                />
                <span className="text-sm font-semibold text-green-400">Enable</span>
              </label>
            </div>

            {cropMargins && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-green-400 mb-2">
                    Top (pt)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={marginTop}
                    onChange={(e) => setMarginTop(Number(e.target.value))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-400 mb-2">
                    Right (pt)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={marginRight}
                    onChange={(e) => setMarginRight(Number(e.target.value))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-400 mb-2">
                    Bottom (pt)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={marginBottom}
                    onChange={(e) => setMarginBottom(Number(e.target.value))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-400 mb-2">
                    Left (pt)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={marginLeft}
                    onChange={(e) => setMarginLeft(Number(e.target.value))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Page Selection */}
          <div className="mb-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-green-400 mb-4">
              📄 Apply To Pages
            </h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={applyToAllPages}
                  onChange={() => setApplyToAllPages(true)}
                  className="w-5 h-5 text-violet-600 border-gray-300 focus:ring-violet-500 cursor-pointer"
                />
                <span className="text-green-400">Apply to all pages</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={!applyToAllPages}
                  onChange={() => setApplyToAllPages(false)}
                  className="w-5 h-5 text-violet-600 border-gray-300 focus:ring-violet-500 cursor-pointer"
                />
                <span className="text-green-400">Apply to specific pages</span>
              </label>
              {!applyToAllPages && (
                <input
                  type="text"
                  value={specificPages}
                  onChange={(e) => setSpecificPages(e.target.value)}
                  placeholder="e.g., 1,3,5-7,10"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              )}
            </div>
          </div>

          {/* Resize Button */}
          <button
            onClick={resizePdf}
            disabled={!pdfFile || loading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all ${
              !pdfFile || loading
                ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold hover:from-green-400 hover:to-emerald-500 transform hover:scale-[1.02]'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Resizing Pages...
              </span>
            ) : (
              '📐 Resize PDF Pages'
            )}
          </button>

          {/* Info Section */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span>💡</span> Resize Tips
            </h3>
            <ul className="space-y-2 text-sm text-green-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Fit Mode:</strong> Best for maintaining quality - scales content proportionally to fit in target size</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Fill Mode:</strong> Fills entire page, may crop edges if aspect ratios don't match</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Stretch Mode:</strong> May distort content if aspect ratios differ significantly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>None Mode:</strong> Changes page size only, useful for adding margins or blank space</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Crop Margins:</strong> Remove white space before resizing to maximize content area</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Points:</strong> 1 inch = 72 points (e.g., 8.5" x 11" = 612 x 792 points)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfResize;
