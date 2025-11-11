import { useEffect, useRef, useState } from 'react';
import { usePdfStore } from '../store/pdfStore';

// Declare WebViewer on window
declare global {
  interface Window {
    WebViewer: any;
  }
}

export const PdfEditor = () => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const { 
    pdfUrl, 
    setIsEditorReady, 
    setWebViewerInstance,
    webViewerInstance 
  } = usePdfStore();

  useEffect(() => {
    if (!viewerRef.current || webViewerInstance) return;

    console.log('Initializing WebViewer with path: /webviewer');
    console.log('PDF URL:', pdfUrl);

    // Load WebViewer script dynamically
    const script = document.createElement('script');
    script.src = '/webviewer/webviewer.min.js';
    script.async = true;
    
    script.onload = () => {
      console.log('WebViewer script loaded');
      
      if (!window.WebViewer) {
        console.error('WebViewer not found on window object');
        setError('Failed to load WebViewer library');
        setIsInitializing(false);
        return;
      }

      // Initialize WebViewer
      window.WebViewer(
        {
          path: '/webviewer',
          licenseKey: 'demo:1762882766533:6018ce730300000000b09d4dfa72ce6c780845be24df81686bd237a1b0',
          initialDoc: pdfUrl || undefined,
          fullAPI: false,
        },
        viewerRef.current as HTMLElement
      ).then((instance: any) => {
        console.log('WebViewer initialized successfully');
        setIsInitializing(false);
        const { UI, Core } = instance;
        
        // Store the instance
        setWebViewerInstance(instance);
        
        // Enable features for PDF editing
        try {
          UI.enableFeatures([UI.Feature.ContentEdit]);
          console.log('Content editing enabled');
        } catch (err) {
          console.warn('Content edit feature not available:', err);
        }
        
        // Customize the UI
        UI.setHeaderItems((header: any) => {
          header.push({
            type: 'actionButton',
            img: 'icon-header-zoom-in-line',
            title: 'Edit Text',
            onClick: () => {
              try {
                const contentEditTool = Core.documentViewer.getTool('ContentEditTool');
                Core.documentViewer.setToolMode(contentEditTool);
              } catch (err) {
                console.error('Error activating content edit tool:', err);
              }
            },
          });
        });

        // Set editor ready state
        Core.documentViewer.addEventListener('documentLoaded', () => {
          setIsEditorReady(true);
          setError(null);
          console.log('Document loaded successfully');
        });

        // Handle document loading errors
        Core.documentViewer.addEventListener('loaderror', (err: any) => {
          console.error('Error loading document:', err);
          setIsEditorReady(false);
          setError('Failed to load PDF. Please try another file.');
        });
      }).catch((err: any) => {
        console.error('Error initializing WebViewer:', err);
        setIsInitializing(false);
        setError('Failed to initialize PDF viewer. Please refresh the page.');
      });
    };

    script.onerror = () => {
      console.error('Failed to load WebViewer script');
      setError('Failed to load WebViewer library. Please refresh the page.');
      setIsInitializing(false);
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [setIsEditorReady, setWebViewerInstance, webViewerInstance, pdfUrl]);

  // Load new document when pdfUrl changes
  useEffect(() => {
    if (webViewerInstance && pdfUrl) {
      console.log('Loading new document:', pdfUrl);
      const { Core } = webViewerInstance;
      Core.documentViewer.loadDocument(pdfUrl);
    }
  }, [pdfUrl, webViewerInstance]);

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden">
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}
      {isInitializing && !error && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <p className="mt-4 text-gray-600">Loading PDF viewer...</p>
          </div>
        </div>
      )}
      <div 
        ref={viewerRef} 
        className="w-full h-full"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
};
