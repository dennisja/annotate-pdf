import React, { createContext, useContext, useReducer, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';

// Set up PDF.js worker for Vite - try multiple approaches
try {
  // First try local worker file
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
} catch (error) {
  // Fallback to CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

const PDFContext = createContext();

const initialState = {
  pdfDoc: null,
  originalPdfBytes: null,
  currentPage: 1,
  totalPages: 0,
  scale: 1.0,
  annotations: [],
  isLoading: false,
  error: null,
  currentFontSize: 12,
};

function pdfReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOAD_PDF_SUCCESS':
      return {
        ...state,
        pdfDoc: action.payload.pdfDoc,
        originalPdfBytes: action.payload.originalPdfBytes,
        totalPages: action.payload.totalPages,
        currentPage: 1,
        isLoading: false,
        error: null,
      };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_SCALE':
      return { ...state, scale: action.payload };
    case 'ADD_ANNOTATION':
      return { ...state, annotations: [...state.annotations, action.payload] };
    case 'UPDATE_ANNOTATION':
      return {
        ...state,
        annotations: state.annotations.map(ann =>
          ann.id === action.payload.id ? { ...ann, ...action.payload.updates } : ann
        ),
      };
    case 'DELETE_ANNOTATION':
      return {
        ...state,
        annotations: state.annotations.filter(ann => ann.id !== action.payload),
      };
    case 'CLEAR_ANNOTATIONS':
      return { ...state, annotations: [] };
    case 'SET_FONT_SIZE':
      return { ...state, currentFontSize: action.payload };
    case 'RESET_PDF':
      return { ...initialState, currentFontSize: state.currentFontSize };
    default:
      return state;
  }
}

export function PDFProvider({ children }) {
  const [state, dispatch] = useReducer(pdfReducer, initialState);

  const loadPDF = useCallback(async (file) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Validate file
      if (!file || file.type !== 'application/pdf') {
        throw new Error('Please select a valid PDF file.');
      }

      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      console.log('Original ArrayBuffer size:', arrayBuffer.byteLength);

      // Create independent copies to prevent detachment
      const pdfBytes = new Uint8Array(arrayBuffer.slice(0));
      console.log('Copied Uint8Array size:', pdfBytes.length);

      // Validate PDF data
      const pdfHeader = String.fromCharCode(...pdfBytes.slice(0, 5));
      if (!pdfHeader.startsWith('%PDF-')) {
        throw new Error('Invalid PDF file - missing PDF header.');
      }

      // Additional validation
      if (pdfBytes.length === 0) {
        throw new Error('PDF file is empty or could not be read.');
      }

      console.log('PDF loaded successfully, size:', pdfBytes.length, 'bytes');
      console.log('PDF header:', String.fromCharCode(...pdfBytes.slice(0, 10)));

      // Load PDF with PDF.js (use separate copy for PDF.js)
      const pdfJsBuffer = arrayBuffer.slice(0);
      const loadingTask = pdfjsLib.getDocument(pdfJsBuffer);
      const pdfDoc = await loadingTask.promise;

      dispatch({
        type: 'LOAD_PDF_SUCCESS',
        payload: {
          pdfDoc,
          originalPdfBytes: pdfBytes,
          totalPages: pdfDoc.numPages,
        },
      });

      console.log('PDF data integrity check - bytes length:', pdfBytes.length);
    } catch (error) {
      console.error('Error loading PDF:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  const addAnnotation = useCallback((annotation) => {
    dispatch({ type: 'ADD_ANNOTATION', payload: annotation });
  }, []);

  const updateAnnotation = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_ANNOTATION', payload: { id, updates } });
  }, []);

  const deleteAnnotation = useCallback((id) => {
    dispatch({ type: 'DELETE_ANNOTATION', payload: id });
  }, []);

  const clearAnnotations = useCallback(() => {
    dispatch({ type: 'CLEAR_ANNOTATIONS' });
  }, []);

  const setPage = useCallback((page) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  const setScale = useCallback((scale) => {
    dispatch({ type: 'SET_SCALE', payload: scale });
  }, []);

  const setFontSize = useCallback((fontSize) => {
    dispatch({ type: 'SET_FONT_SIZE', payload: fontSize });
  }, []);

  const saveAnnotatedPDF = useCallback(async () => {
    try {
      // Enhanced debugging
      console.log('=== Save PDF Debug Info ===');
      console.log('originalPdfBytes exists:', !!state.originalPdfBytes);
      console.log('originalPdfBytes type:', state.originalPdfBytes ? state.originalPdfBytes.constructor.name : 'undefined');
      console.log('originalPdfBytes length:', state.originalPdfBytes ? state.originalPdfBytes.length : 'N/A');
      console.log('annotations count:', state.annotations.length);

      if (!state.originalPdfBytes || state.originalPdfBytes.length === 0) {
        throw new Error('No PDF data available! Please upload a PDF file first.');
      }

      if (state.annotations.length === 0) {
        throw new Error('No annotations to save! Please add some text annotations first.');
      }

      // Validate PDF data before processing
      if (state.originalPdfBytes.length < 100) {
        throw new Error('PDF data appears to be corrupted or incomplete.');
      }

      // Check PDF header
      const header = String.fromCharCode(...state.originalPdfBytes.slice(0, 5));
      if (!header.startsWith('%PDF-')) {
        throw new Error('Invalid PDF data - missing PDF header.');
      }

      console.log('PDF data validation passed, proceeding with save...');

      // Load PDF with pdf-lib
      const pdfDoc = await PDFDocument.load(state.originalPdfBytes);
      const pages = pdfDoc.getPages();

      // Group annotations by page
      const annotationsByPage = {};
      state.annotations.forEach(ann => {
        if (!annotationsByPage[ann.page]) {
          annotationsByPage[ann.page] = [];
        }
        annotationsByPage[ann.page].push(ann);
      });

      // Add annotations to each page
      for (const [pageNum, pageAnnotations] of Object.entries(annotationsByPage)) {
        const page = pages[parseInt(pageNum) - 1];
        const { width, height } = page.getSize();

        pageAnnotations.forEach(annotation => {
          // Calculate position relative to PDF page size
          // Note: We'll need to get canvas dimensions from the component
          const canvasWidth = 800; // Default, should be passed from component
          const canvasHeight = 600; // Default, should be passed from component
          
          const pdfX = (annotation.x / annotation.scale) * (width / canvasWidth);
          const pdfY = height - ((annotation.y / annotation.scale) * (height / canvasHeight)) - 20;

          const fontSize = annotation.fontSize || 12;
          page.drawText(annotation.text, {
            x: pdfX,
            y: pdfY,
            size: fontSize,
            color: rgb(0, 0, 0),
          });
        });
      }

      // Save PDF
      const pdfBytes = await pdfDoc.save();

      // Download file
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'annotated-document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error saving PDF:', error);
      
      let errorMessage = 'Error saving PDF. ';
      if (error.message.includes('No PDF header found')) {
        errorMessage += 'The PDF file appears to be corrupted or invalid. Please try uploading the PDF again.';
      } else if (error.message.includes('PDF-lib library')) {
        errorMessage += 'PDF library not loaded. Please refresh the page and try again.';
      } else {
        errorMessage += 'Please try again. If the problem persists, try with a different PDF file.';
      }
      
      throw new Error(errorMessage);
    }
  }, [state.originalPdfBytes, state.annotations]);

  const resetPDF = useCallback(() => {
    dispatch({ type: 'RESET_PDF' });
  }, []);

  const value = {
    ...state,
    loadPDF,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    clearAnnotations,
    setPage,
    setScale,
    setFontSize,
    saveAnnotatedPDF,
    resetPDF,
  };

  return <PDFContext.Provider value={value}>{children}</PDFContext.Provider>;
}

export function usePDF() {
  const context = useContext(PDFContext);
  if (!context) {
    throw new Error('usePDF must be used within a PDFProvider');
  }
  return context;
}
