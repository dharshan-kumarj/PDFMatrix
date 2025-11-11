import { create } from 'zustand';

interface PDFStore {
  // PDF file state
  pdfFile: File | null;
  pdfUrl: string | null;
  
  // Editor state
  isEditorReady: boolean;
  isLoading: boolean;
  
  // WebViewer instance
  webViewerInstance: any;
  
  // Actions
  setPdfFile: (file: File | null) => void;
  setPdfUrl: (url: string | null) => void;
  setIsEditorReady: (ready: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setWebViewerInstance: (instance: any) => void;
  resetState: () => void;
}

export const usePdfStore = create<PDFStore>((set) => ({
  // Initial state
  pdfFile: null,
  pdfUrl: null,
  isEditorReady: false,
  isLoading: false,
  webViewerInstance: null,
  
  // Actions
  setPdfFile: (file: File | null) => set({ pdfFile: file }),
  setPdfUrl: (url: string | null) => set({ pdfUrl: url }),
  setIsEditorReady: (ready: boolean) => set({ isEditorReady: ready }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setWebViewerInstance: (instance: any) => set({ webViewerInstance: instance }),
  
  resetState: () => set({
    pdfFile: null,
    pdfUrl: null,
    isEditorReady: false,
    isLoading: false,
    webViewerInstance: null,
  }),
}));
