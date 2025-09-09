import React, { useRef, useEffect, useState, useCallback } from 'react';
import { usePDF } from '../contexts/PDFContext';
import AnnotationModal from './AnnotationModal';

export default function PDFViewer() {
  const {
    pdfDoc,
    currentPage,
    scale,
    annotations,
    currentFontSize,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
  } = usePDF();

  const canvasRef = useRef(null);
  const annotationsLayerRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAnnotation, setPendingAnnotation] = useState(null);
  const [editingAnnotation, setEditingAnnotation] = useState(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  // Render PDF page
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = viewport.width + 'px';
      canvas.style.height = viewport.height + 'px';

      // Update annotations layer size
      if (annotationsLayerRef.current) {
        annotationsLayerRef.current.style.width = viewport.width + 'px';
        annotationsLayerRef.current.style.height = viewport.height + 'px';
      }

      // Store canvas dimensions for PDF saving
      setCanvasDimensions({ width: viewport.width, height: viewport.height });

      // Render page
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  }, [pdfDoc, currentPage, scale]);

  // Effect to render page when dependencies change
  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Handle canvas click for adding annotations
  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPendingAnnotation({ x, y, page: currentPage });
    setEditingAnnotation(null);
    setIsModalOpen(true);
  };

  // Handle annotation save
  const handleAnnotationSave = (text, fontSize) => {
    if (editingAnnotation) {
      // Update existing annotation
      updateAnnotation(editingAnnotation.id, { text, fontSize });
    } else if (pendingAnnotation) {
      // Add new annotation
      const annotation = {
        id: Date.now(),
        text,
        x: pendingAnnotation.x,
        y: pendingAnnotation.y,
        page: pendingAnnotation.page,
        scale,
        fontSize,
      };
      addAnnotation(annotation);
    }
    setPendingAnnotation(null);
    setEditingAnnotation(null);
  };

  // Handle annotation edit
  const handleAnnotationEdit = (annotation) => {
    setEditingAnnotation(annotation);
    setPendingAnnotation(null);
    setIsModalOpen(true);
  };

  // Handle annotation delete
  const handleAnnotationDelete = (annotationId) => {
    if (confirm('Delete this annotation?')) {
      deleteAnnotation(annotationId);
    }
  };

  // Get current page annotations
  const currentPageAnnotations = annotations.filter(ann => ann.page === currentPage);

  if (!pdfDoc) {
    return null;
  }

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-5 shadow-lg">
      <div className="relative flex justify-center items-start overflow-auto border border-gray-300 rounded-lg bg-gray-50 p-5">
        <div className="relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="max-w-full h-auto shadow-lg bg-white cursor-crosshair"
          />
          
          {/* Annotations Layer */}
          <div
            ref={annotationsLayerRef}
            className="absolute top-0 left-0 pointer-events-none"
          >
            {currentPageAnnotations.map((annotation) => (
              <AnnotationElement
                key={annotation.id}
                annotation={annotation}
                scale={scale}
                onEdit={handleAnnotationEdit}
                onDelete={handleAnnotationDelete}
              />
            ))}
          </div>
        </div>
      </div>

      <AnnotationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPendingAnnotation(null);
          setEditingAnnotation(null);
        }}
        onSave={handleAnnotationSave}
        annotation={editingAnnotation}
        defaultFontSize={currentFontSize}
      />
    </div>
  );
}

// Annotation Element Component
function AnnotationElement({ annotation, scale, onEdit, onDelete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({
    x: annotation.x * (scale / annotation.scale),
    y: annotation.y * (scale / annotation.scale),
  });

  const elementRef = useRef(null);

  useEffect(() => {
    setPosition({
      x: annotation.x * (scale / annotation.scale),
      y: annotation.y * (scale / annotation.scale),
    });
  }, [annotation.x, annotation.y, annotation.scale, scale]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = position.x;
    const initialY = position.y;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      setPosition({
        x: initialX + deltaX,
        y: initialY + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Update annotation position
      annotation.x = position.x * (annotation.scale / scale);
      annotation.y = position.y * (annotation.scale / scale);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(annotation);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    onDelete(annotation.id);
  };

  const fontSize = annotation.fontSize || 12;

  return (
    <div
      ref={elementRef}
      className={`annotation ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        fontSize: `${Math.round(fontSize * scale)}px`,
        pointerEvents: 'all',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {annotation.text}
    </div>
  );
}
