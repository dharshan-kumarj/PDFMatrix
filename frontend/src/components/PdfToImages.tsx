import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface ConvertedImage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
  fileName: string;
}

const PdfToImages: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg'>('png');
  const [imageQuality, setImageQuality] = useState(0.95);
  const [scale, setScale] = useState(2); // DPI multiplier (1 = 72 DPI, 2 = 144 DPI, 3 = 216 DPI)
  const [selectedPages, setSelectedPages] = useState<'all' | 'custom'>('all');
  const [customPages, setCustomPages] = useState('');

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file');
      return;
    }

    try {
      setPdfFile(file);
      setConvertedImages([]);

      // Load PDF to get page count
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);

      console.log(`PDF loaded: ${pdf.numPages} pages`);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error loading PDF. Please try again.');
    }
  };

  // Parse custom pages input (e.g., "1,3,5-7,10")
  const parsePageNumbers = (input: string, maxPages: number): number[] => {
    const pages: number[] = [];
    const ranges = input.split(',').map(p => p.trim());

    for (const range of ranges) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(n => parseInt(n.trim()));
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= maxPages) pages.push(i);
        }
      } else {
        const page = parseInt(range);
        if (page >= 1 && page <= maxPages) pages.push(page);
      }
    }

    return Array.from(new Set(pages)).sort((a, b) => a - b);
  };

  // Convert PDF to images
  const convertPdfToImages = async () => {
    if (!pdfFile) {
      alert('Please select a PDF file first');
      return;
    }

    setIsConverting(true);
    setConvertedImages([]);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      // Determine which pages to convert
      let pagesToConvert: number[];
      if (selectedPages === 'all') {
        pagesToConvert = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
      } else {
        if (!customPages.trim()) {
          alert('Please enter page numbers to convert');
          setIsConverting(false);
          return;
        }
        pagesToConvert = parsePageNumbers(customPages, pdf.numPages);
        if (pagesToConvert.length === 0) {
          alert('No valid pages found in the list');
          setIsConverting(false);
          return;
        }
      }

      console.log(`Converting ${pagesToConvert.length} pages to ${imageFormat.toUpperCase()}...`);

      const images: ConvertedImage[] = [];

      for (const pageNum of pagesToConvert) {
        try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale });

          // Create canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          if (!context) continue;

          // Render page to canvas
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          // Convert canvas to blob
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob(
              (b) => resolve(b!),
              `image/${imageFormat}`,
              imageQuality
            );
          });

          const dataUrl = canvas.toDataURL(`image/${imageFormat}`, imageQuality);
          const fileName = `page_${pageNum}.${imageFormat}`;

          images.push({
            pageNumber: pageNum,
            dataUrl,
            blob,
            fileName,
          });

          console.log(`Converted page ${pageNum}`);
        } catch (error) {
          console.error(`Error converting page ${pageNum}:`, error);
        }
      }

      setConvertedImages(images);
      alert(`Successfully converted ${images.length} page(s) to images!`);
    } catch (error) {
      console.error('Error converting PDF:', error);
      alert('Error converting PDF. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  // Download single image
  const downloadImage = (image: ConvertedImage) => {
    const url = URL.createObjectURL(image.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = image.fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  // Download all images as ZIP
  const downloadAllAsZip = async () => {
    if (convertedImages.length === 0) return;

    try {
      const zip = new JSZip();

      // Add each image to ZIP
      convertedImages.forEach((image) => {
        zip.file(image.fileName, image.blob);
      });

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Download ZIP
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfFile?.name.replace('.pdf', '')}_images.zip`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);

      console.log('Downloaded all images as ZIP');
    } catch (error) {
      console.error('Error creating ZIP:', error);
      alert('Error creating ZIP file. Please try again.');
    }
  };

  // Download all images individually
  const downloadAllIndividually = () => {
    convertedImages.forEach((image, index) => {
      setTimeout(() => downloadImage(image), index * 200); // Stagger downloads
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">📄➡️🖼️ PDF to Images</h1>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Select PDF file
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer"
            />
            {pdfFile && (
              <p className="mt-2 text-sm text-gray-600">
                📄 <strong>{pdfFile.name}</strong> - {totalPages} pages
              </p>
            )}
          </div>

          {/* Conversion Settings */}
          {pdfFile && (
            <>
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Conversion Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Format */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Image Format
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setImageFormat('png')}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                          imageFormat === 'png'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        PNG (Lossless)
                      </button>
                      <button
                        onClick={() => setImageFormat('jpeg')}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                          imageFormat === 'jpeg'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        JPEG (Smaller)
                      </button>
                    </div>
                  </div>

                  {/* Quality (for JPEG) */}
                  {imageFormat === 'jpeg' && (
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        JPEG Quality: {Math.round(imageQuality * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="1"
                        step="0.05"
                        value={imageQuality}
                        onChange={(e) => setImageQuality(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Lower size</span>
                        <span>Better quality</span>
                      </div>
                    </div>
                  )}

                  {/* Resolution/DPI */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Resolution: {scale}x ({scale * 72} DPI)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="0.5"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1x (72 DPI)</span>
                      <span>2x (144 DPI)</span>
                      <span>3x (216 DPI)</span>
                      <span>4x (288 DPI)</span>
                    </div>
                  </div>

                  {/* Page Selection */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Pages to Convert
                    </label>
                    <div className="flex gap-3 mb-2">
                      <button
                        onClick={() => setSelectedPages('all')}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                          selectedPages === 'all'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        All Pages
                      </button>
                      <button
                        onClick={() => setSelectedPages('custom')}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                          selectedPages === 'custom'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                    {selectedPages === 'custom' && (
                      <input
                        type="text"
                        value={customPages}
                        onChange={(e) => setCustomPages(e.target.value)}
                        placeholder="e.g., 1,3,5-7,10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Convert Button */}
              <button
                onClick={convertPdfToImages}
                disabled={isConverting}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg
                  hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                  transition-colors shadow-md hover:shadow-lg mb-6"
              >
                {isConverting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Converting to Images...
                  </span>
                ) : (
                  '🖼️ Convert to Images'
                )}
              </button>

              {/* Converted Images */}
              {convertedImages.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Converted Images ({convertedImages.length})
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={downloadAllAsZip}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                      >
                        📦 Download All as ZIP
                      </button>
                      <button
                        onClick={downloadAllIndividually}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                      >
                        ⬇️ Download All Individually
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {convertedImages.map((image) => (
                      <div key={image.pageNumber} className="border rounded-lg overflow-hidden bg-gray-50">
                        <div className="p-2 bg-white">
                          <img
                            src={image.dataUrl}
                            alt={`Page ${image.pageNumber}`}
                            className="w-full h-auto"
                          />
                        </div>
                        <div className="p-3 bg-white border-t">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Page {image.pageNumber}
                          </p>
                          <button
                            onClick={() => downloadImage(image)}
                            className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                          >
                            ⬇️ Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Info Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Tips:</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li><strong>PNG</strong> format preserves quality but creates larger files</li>
              <li><strong>JPEG</strong> format creates smaller files, adjust quality as needed</li>
              <li>Higher resolution (DPI) means better quality but larger file size</li>
              <li>Use <strong>2x (144 DPI)</strong> for screen viewing, <strong>3x (216 DPI)</strong> for printing</li>
              <li>Download all as ZIP for easy organization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfToImages;
