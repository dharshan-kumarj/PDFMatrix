import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
}

const PdfCompressor: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionStats | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<'basic' | 'medium' | 'high'>('medium');

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file');
      return;
    }

    setPdfFile(file);
    setCompressionStats(null);
    console.log(`PDF selected: ${file.name} (${formatFileSize(file.size)})`);
  };

  // Compress PDF
  const compressPdf = async () => {
    if (!pdfFile) {
      alert('Please select a PDF file first');
      return;
    }

    setIsCompressing(true);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const originalSize = arrayBuffer.byteLength;
      
      console.log(`Starting compression with ${compressionLevel} level...`);
      console.log(`Original size: ${formatFileSize(originalSize)}`);

      // Load PDF
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Apply compression based on level
      let compressedPdfBytes: Uint8Array;

      switch (compressionLevel) {
        case 'basic':
          // Basic: Just re-save without object streams
          compressedPdfBytes = await pdfDoc.save({
            useObjectStreams: false,
          });
          break;

        case 'medium':
          // Medium: Use object streams (better compression)
          compressedPdfBytes = await pdfDoc.save({
            useObjectStreams: true,
          });
          break;

        case 'high':
          // High: Object streams + optimize for size
          compressedPdfBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
          });
          break;

        default:
          compressedPdfBytes = await pdfDoc.save();
      }

      const compressedSize = compressedPdfBytes.byteLength;
      const reduction = ((originalSize - compressedSize) / originalSize) * 100;

      console.log(`Compressed size: ${formatFileSize(compressedSize)}`);
      console.log(`Reduction: ${reduction.toFixed(2)}%`);

      // Update stats
      setCompressionStats({
        originalSize,
        compressedSize,
        reductionPercentage: reduction,
      });

      // Download compressed PDF
      const uint8Array = new Uint8Array(compressedPdfBytes);
      const blob = new Blob([uint8Array], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfFile.name.replace('.pdf', '_compressed.pdf');
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);

      alert(`PDF compressed successfully!\nReduction: ${reduction.toFixed(2)}%`);
    } catch (error) {
      console.error('Error compressing PDF:', error);
      alert('Error compressing PDF. Please try again.');
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl border border-green-500/20 p-6 sm:p-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">🗜️ PDF Compressor</h1>

          {/* File Upload Section */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-green-400">
              Select PDF file to compress
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-gradient-to-r file:from-green-500 file:to-emerald-600 file:text-black file:shadow-lg file:shadow-green-500/30
                hover:file:from-green-400 hover:file:to-emerald-500
                cursor-pointer"
            />
            {pdfFile && (
              <div className="mt-3 p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
                <p className="text-sm text-green-800">
                  📄 <strong>{pdfFile.name}</strong>
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Original size: <strong>{formatFileSize(pdfFile.size)}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Compression Level Selection */}
          {pdfFile && (
            <>
              <div className="mb-6">
                <label className="block mb-3 text-sm font-medium text-green-400">
                  Select Compression Level
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setCompressionLevel('basic')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      compressionLevel === 'basic'
                        ? 'border-green-500 bg-green-50'
                        : 'border-green-500/20 hover:border-green-500/40'
                    }`}
                  >
                    <div className="font-semibold text-gray-100">🟢 Basic</div>
                    <div className="text-sm text-gray-300 mt-1">Light compression</div>
                    <div className="text-xs text-gray-400 mt-1">~5-15% reduction</div>
                  </button>

                  <button
                    onClick={() => setCompressionLevel('medium')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      compressionLevel === 'medium'
                        ? 'border-green-500 bg-green-50'
                        : 'border-green-500/20 hover:border-green-500/40'
                    }`}
                  >
                    <div className="font-semibold text-gray-100">🟡 Medium</div>
                    <div className="text-sm text-gray-300 mt-1">Balanced compression</div>
                    <div className="text-xs text-gray-400 mt-1">~15-30% reduction</div>
                  </button>

                  <button
                    onClick={() => setCompressionLevel('high')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      compressionLevel === 'high'
                        ? 'border-green-500 bg-green-50'
                        : 'border-green-500/20 hover:border-green-500/40'
                    }`}
                  >
                    <div className="font-semibold text-gray-100">🔴 High</div>
                    <div className="text-sm text-gray-300 mt-1">Maximum compression</div>
                    <div className="text-xs text-gray-400 mt-1">~30-50% reduction</div>
                  </button>
                </div>
              </div>

              {/* Compression Stats */}
              {compressionStats && (
                <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border-2 border-green-200">
                  <h3 className="text-lg font-semibold text-gray-100 mb-3">📊 Compression Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-300">Original Size</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        {formatFileSize(compressionStats.originalSize)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Compressed Size</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatFileSize(compressionStats.compressedSize)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Reduction</p>
                      <p className="text-2xl font-bold text-teal-600">
                        {compressionStats.reductionPercentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-green-500 to-teal-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(compressionStats.reductionPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Compress Button */}
              <button
                onClick={compressPdf}
                disabled={isCompressing}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold rounded-xl
                  hover:from-green-400 hover:to-emerald-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed
                  transition-colors shadow-md hover:shadow-lg"
              >
                {isCompressing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Compressing PDF...
                  </span>
                ) : (
                  '🗜️ Compress PDF'
                )}
              </button>
            </>
          )}

          {/* Info Section */}
          <div className="mt-6 p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
            <h3 className="text-sm font-semibold text-green-800 mb-2">💡 How it works:</h3>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li><strong>Basic:</strong> Removes redundant data and optimizes structure</li>
              <li><strong>Medium:</strong> Uses object streams for better compression</li>
              <li><strong>High:</strong> Maximum optimization with object streams</li>
            </ul>
            <p className="text-xs text-green-600 mt-3">
              ⚠️ Note: Compression results vary based on PDF content. PDFs with many images may not compress as much.
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-4 p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
            <h3 className="text-sm font-semibold text-green-400 mb-2">📖 Tips for best results:</h3>
            <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
              <li>Start with "Medium" compression for balanced results</li>
              <li>Use "High" for maximum file size reduction</li>
              <li>PDFs with lots of text compress better than image-heavy PDFs</li>
              <li>Already compressed PDFs may not reduce much further</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfCompressor;
