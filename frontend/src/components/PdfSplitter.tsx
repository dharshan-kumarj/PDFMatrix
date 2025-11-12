import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

type SplitMode = 'byRange' | 'byPages' | 'extractPages';

interface SplitRange {
  id: string;
  start: number;
  end: number;
  name: string;
}

const PdfSplitter: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [splitMode, setSplitMode] = useState<SplitMode>('byRange');
  const [isLoading, setIsLoading] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);

  // For 'byRange' mode - multiple custom ranges
  const [splitRanges, setSplitRanges] = useState<SplitRange[]>([]);

  // For 'byPages' mode - comma-separated pages
  const [pagesList, setPagesList] = useState('');

  // For 'extractPages' mode - specific pages to extract
  const [extractPages, setExtractPages] = useState('');

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

      const pdf = await PDFDocument.load(pdfBytes);
      setPdfDoc(pdf);
      setTotalPages(pdf.getPageCount());

      // Reset split ranges when new file is loaded
      setSplitRanges([]);
      
      console.log(`PDF loaded: ${pdf.getPageCount()} pages`);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error loading PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a split range for 'byRange' mode
  const addSplitRange = () => {
    const newRange: SplitRange = {
      id: Date.now().toString(),
      start: 1,
      end: Math.min(10, totalPages),
      name: `document_part_${splitRanges.length + 1}`
    };
    setSplitRanges([...splitRanges, newRange]);
  };

  // Update split range
  const updateSplitRange = (id: string, field: keyof SplitRange, value: string | number) => {
    setSplitRanges(ranges =>
      ranges.map(range =>
        range.id === id ? { ...range, [field]: value } : range
      )
    );
  };

  // Remove split range
  const removeSplitRange = (id: string) => {
    setSplitRanges(ranges => ranges.filter(range => range.id !== id));
  };

  // Download a PDF
  const downloadPdf = (pdfBytes: Uint8Array, filename: string) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  // Split PDF by custom ranges
  const splitByRange = async () => {
    if (!pdfData || splitRanges.length === 0) {
      alert('Please add at least one page range to split.');
      return;
    }

    setIsSplitting(true);

    try {
      for (const range of splitRanges) {
        // Validate range
        if (range.start < 1 || range.end > totalPages || range.start > range.end) {
          alert(`Invalid range: ${range.start}-${range.end}. Please check your ranges.`);
          continue;
        }

        // Load fresh copy for each split
        const sourcePdf = await PDFDocument.load(pdfData);
        const newPdf = await PDFDocument.create();

        // Copy pages in the range (convert to 0-based index)
        const pageIndices = Array.from(
          { length: range.end - range.start + 1 },
          (_, i) => range.start - 1 + i
        );

        const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));

        // Save and download
        const pdfBytes = await newPdf.save();
        downloadPdf(pdfBytes, `${range.name}.pdf`);

        console.log(`Created: ${range.name}.pdf (pages ${range.start}-${range.end})`);
      }

      alert(`Successfully created ${splitRanges.length} PDF file(s)!`);
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('Error splitting PDF. Please try again.');
    } finally {
      setIsSplitting(false);
    }
  };

  // Split PDF by individual pages
  const splitByPages = async () => {
    if (!pdfData || !pagesList.trim()) {
      alert('Please enter page numbers (e.g., 1,3,5-7,10)');
      return;
    }

    setIsSplitting(true);

    try {
      // Parse page list (e.g., "1,3,5-7,10")
      const pageRanges = pagesList.split(',').map(p => p.trim());
      const pagesToExtract: number[] = [];

      for (const range of pageRanges) {
        if (range.includes('-')) {
          const [start, end] = range.split('-').map(n => parseInt(n.trim()));
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= totalPages) pagesToExtract.push(i);
          }
        } else {
          const page = parseInt(range);
          if (page >= 1 && page <= totalPages) pagesToExtract.push(page);
        }
      }

      if (pagesToExtract.length === 0) {
        alert('No valid pages found in the list.');
        return;
      }

      // Remove duplicates and sort
      const uniquePages = Array.from(new Set(pagesToExtract)).sort((a, b) => a - b);

      // Create separate PDF for each page
      for (const pageNum of uniquePages) {
        const sourcePdf = await PDFDocument.load(pdfData);
        const newPdf = await PDFDocument.create();

        const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
        newPdf.addPage(copiedPage);

        const pdfBytes = await newPdf.save();
        downloadPdf(pdfBytes, `page_${pageNum}.pdf`);
      }

      alert(`Successfully created ${uniquePages.length} PDF file(s)!`);
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('Error splitting PDF. Please check your page numbers.');
    } finally {
      setIsSplitting(false);
    }
  };

  // Extract specific pages into one PDF
  const extractSpecificPages = async () => {
    if (!pdfData || !extractPages.trim()) {
      alert('Please enter page numbers to extract (e.g., 1,3,5-7,10)');
      return;
    }

    setIsSplitting(true);

    try {
      // Parse page list
      const pageRanges = extractPages.split(',').map(p => p.trim());
      const pagesToExtract: number[] = [];

      for (const range of pageRanges) {
        if (range.includes('-')) {
          const [start, end] = range.split('-').map(n => parseInt(n.trim()));
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= totalPages) pagesToExtract.push(i);
          }
        } else {
          const page = parseInt(range);
          if (page >= 1 && page <= totalPages) pagesToExtract.push(page);
        }
      }

      if (pagesToExtract.length === 0) {
        alert('No valid pages found in the list.');
        return;
      }

      // Remove duplicates and sort
      const uniquePages = Array.from(new Set(pagesToExtract)).sort((a, b) => a - b);

      // Create one PDF with all extracted pages
      const sourcePdf = await PDFDocument.load(pdfData);
      const newPdf = await PDFDocument.create();

      const pageIndices = uniquePages.map(p => p - 1);
      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      downloadPdf(pdfBytes, `extracted_pages.pdf`);

      alert(`Successfully extracted ${uniquePages.length} page(s) into one PDF!`);
    } catch (error) {
      console.error('Error extracting pages:', error);
      alert('Error extracting pages. Please check your page numbers.');
    } finally {
      setIsSplitting(false);
    }
  };

  // Handle split based on mode
  const handleSplit = () => {
    switch (splitMode) {
      case 'byRange':
        splitByRange();
        break;
      case 'byPages':
        splitByPages();
        break;
      case 'extractPages':
        extractSpecificPages();
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">📄 PDF Splitter</h1>

          {/* File Upload Section */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Select PDF file to split
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100
                cursor-pointer"
            />
            {pdfFile && (
              <p className="mt-2 text-sm text-gray-600">
                📄 <strong>{pdfFile.name}</strong> - {totalPages} pages
              </p>
            )}
          </div>

          {/* Split Mode Selection */}
          {pdfFile && (
            <>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Select Split Mode
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setSplitMode('byRange')}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      splitMode === 'byRange'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-800">📑 Split by Ranges</div>
                    <div className="text-sm text-gray-600">Define custom page ranges</div>
                  </button>

                  <button
                    onClick={() => setSplitMode('byPages')}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      splitMode === 'byPages'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-800">📄 Split into Individual Pages</div>
                    <div className="text-sm text-gray-600">Each page as separate PDF</div>
                  </button>

                  <button
                    onClick={() => setSplitMode('extractPages')}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      splitMode === 'extractPages'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-800">✂️ Extract Specific Pages</div>
                    <div className="text-sm text-gray-600">Select pages to extract into one PDF</div>
                  </button>
                </div>
              </div>

              {/* Split Mode Content */}
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                {splitMode === 'byRange' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Custom Page Ranges</h3>
                      <button
                        onClick={addSplitRange}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
                      >
                        + Add Range
                      </button>
                    </div>

                    {splitRanges.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">
                        Click "Add Range" to create your first split range
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {splitRanges.map((range, index) => (
                          <div
                            key={range.id}
                            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200"
                          >
                            <span className="text-sm font-semibold text-gray-500 w-6">
                              {index + 1}.
                            </span>
                            <input
                              type="text"
                              value={range.name}
                              onChange={(e) => updateSplitRange(range.id, 'name', e.target.value)}
                              placeholder="File name"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600">Pages:</label>
                              <input
                                type="number"
                                value={range.start}
                                onChange={(e) => updateSplitRange(range.id, 'start', parseInt(e.target.value))}
                                min="1"
                                max={totalPages}
                                className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm"
                              />
                              <span className="text-gray-500">to</span>
                              <input
                                type="number"
                                value={range.end}
                                onChange={(e) => updateSplitRange(range.id, 'end', parseInt(e.target.value))}
                                min="1"
                                max={totalPages}
                                className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                            <button
                              onClick={() => removeSplitRange(range.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {splitMode === 'byPages' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Split into Individual Pages</h3>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Enter page numbers (comma-separated, supports ranges)
                    </label>
                    <input
                      type="text"
                      value={pagesList}
                      onChange={(e) => setPagesList(e.target.value)}
                      placeholder="e.g., 1,3,5-7,10,15-20"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      💡 Example: <code className="bg-gray-200 px-2 py-1 rounded">1,3,5-7,10</code> will create separate PDFs for pages 1, 3, 5, 6, 7, and 10
                    </p>
                  </div>
                )}

                {splitMode === 'extractPages' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Extract Specific Pages</h3>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Enter page numbers to extract into one PDF
                    </label>
                    <input
                      type="text"
                      value={extractPages}
                      onChange={(e) => setExtractPages(e.target.value)}
                      placeholder="e.g., 1,3,5-7,10,15-20"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      💡 Example: <code className="bg-gray-200 px-2 py-1 rounded">1,3,5-7,10</code> will extract pages 1, 3, 5, 6, 7, and 10 into <strong>one PDF</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Split Button */}
              <button
                onClick={handleSplit}
                disabled={isSplitting}
                className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg
                  hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                  transition-colors shadow-md hover:shadow-lg"
              >
                {isSplitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Splitting PDF...
                  </span>
                ) : (
                  '✂️ Split PDF'
                )}
              </button>
            </>
          )}

          {/* Info Section */}
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="text-sm font-semibold text-purple-800 mb-2">📖 How to use:</h3>
            <ol className="text-sm text-purple-700 space-y-1 list-decimal list-inside">
              <li>Upload a PDF file</li>
              <li>Choose a split mode that fits your needs</li>
              <li>Configure the split settings</li>
              <li>Click "Split PDF" to download the resulting files</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfSplitter;
