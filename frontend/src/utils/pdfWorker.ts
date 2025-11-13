/**
 * Centralized PDF.js worker configuration
 * This ensures the worker is initialized only once and works in offline mode
 */
import * as pdfjsLib from 'pdfjs-dist';

// Use worker from public folder - this ensures it's always available offline
// The file is copied from node_modules during build
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// Export pdfjsLib so components can use it without re-initializing
export { pdfjsLib };
