import React, { useRef, useEffect, useState, useCallback } from "react";
import { usePDF } from "../contexts/PDFContext";
import AnnotationModal from "./AnnotationModal";

export default function PDFViewer() {
  const {
    pdfDoc,
    currentPage,
    scale,
    annotations,
    currentFontSize,
    drawingMode,
    lineThickness,
    lineColor,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
  } = usePDF();

  const canvasRef = useRef(null);
  const annotationsLayerRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAnnotation, setPendingAnnotation] = useState(null);
  const [editingAnnotation, setEditingAnnotation] = useState(null);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [lineStart, setLineStart] = useState(null);
  const [currentLine, setCurrentLine] = useState(null);

  // Keep track of current render task and rendering state
  const renderTaskRef = useRef(null);
  const isRenderingRef = useRef(false);

  // Render PDF page
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || isRenderingRef.current) return;

    isRenderingRef.current = true;

    try {
      // Cancel any existing render task
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // Ignore cancellation errors
        }
        renderTaskRef.current = null;
      }

      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;

      // Double-check canvas is still available
      if (!canvas) {
        isRenderingRef.current = false;
        return;
      }

      const context = canvas.getContext("2d");

      // Set canvas dimensions first
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = viewport.width + "px";
      canvas.style.height = viewport.height + "px";

      // Clear the canvas after setting dimensions
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Update annotations layer size
      if (annotationsLayerRef.current) {
        annotationsLayerRef.current.style.width = viewport.width + "px";
        annotationsLayerRef.current.style.height = viewport.height + "px";
      }

      // Store canvas dimensions for PDF saving
      setCanvasDimensions({ width: viewport.width, height: viewport.height });

      // Render page
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      // Store the render task so we can cancel it if needed
      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
      renderTaskRef.current = null;
    } catch (error) {
      renderTaskRef.current = null;
      if (
        error.name !== "RenderingCancelledException" &&
        error.message !== "Rendering cancelled"
      ) {
        console.error("Error rendering page:", error);
      }
    } finally {
      isRenderingRef.current = false;
    }
  }, [pdfDoc, currentPage, scale]);

  // Effect to render page when dependencies change
  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Cancel any pending render tasks when component unmounts
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // Ignore cancellation errors
        }
        renderTaskRef.current = null;
      }
    };
  }, []);

  // Handle canvas interactions
  const handleCanvasMouseDown = (e) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawingMode === "text") {
      setPendingAnnotation({ x, y, page: currentPage });
      setEditingAnnotation(null);
      setIsModalOpen(true);
    } else if (drawingMode === "line") {
      setIsDrawingLine(true);
      setLineStart({ x, y });
      setCurrentLine({ x1: x, y1: y, x2: x, y2: y });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current || !isDrawingLine || !lineStart) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentLine({
      x1: lineStart.x,
      y1: lineStart.y,
      x2: x,
      y2: y,
    });
  };

  const handleCanvasMouseUp = (e) => {
    if (!canvasRef.current || !isDrawingLine || !lineStart) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only create line if there's meaningful distance
    const distance = Math.sqrt(
      Math.pow(x - lineStart.x, 2) + Math.pow(y - lineStart.y, 2),
    );
    if (distance > 5) {
      const lineAnnotation = {
        id: Date.now(),
        type: "line",
        x1: lineStart.x,
        y1: lineStart.y,
        x2: x,
        y2: y,
        page: currentPage,
        scale,
        thickness: lineThickness,
        color: lineColor,
      };
      addAnnotation(lineAnnotation);
    }

    setIsDrawingLine(false);
    setLineStart(null);
    setCurrentLine(null);
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
    if (confirm("Delete this annotation?")) {
      deleteAnnotation(annotationId);
    }
  };

  // Get current page annotations
  const currentPageAnnotations = annotations.filter(
    (ann) => ann.page === currentPage,
  );

  if (!pdfDoc) {
    return null;
  }

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-5 shadow-lg">
      <div className="relative flex justify-center items-start overflow-auto border border-gray-300 rounded-lg bg-gray-50 p-5">
        <div className="relative">
          <canvas
            id="pdfCanvas"
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className={`max-w-full h-auto shadow-lg bg-white ${
              drawingMode === "text" ? "cursor-text" : "cursor-crosshair"
            }`}
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

            {/* Line Preview */}
            {currentLine && (
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{
                  width: canvasDimensions.width + "px",
                  height: canvasDimensions.height + "px",
                }}
              >
                <line
                  x1={currentLine.x1}
                  y1={currentLine.y1}
                  x2={currentLine.x2}
                  y2={currentLine.y2}
                  stroke={lineColor}
                  strokeWidth={lineThickness}
                  strokeOpacity="0.7"
                />
              </svg>
            )}
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
  const elementRef = useRef(null);

  // Handle line annotations differently
  if (annotation.type === "line") {
    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-all"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <line
          x1={annotation.x1 * (scale / annotation.scale)}
          y1={annotation.y1 * (scale / annotation.scale)}
          x2={annotation.x2 * (scale / annotation.scale)}
          y2={annotation.y2 * (scale / annotation.scale)}
          stroke={annotation.color}
          strokeWidth={annotation.thickness * (scale / annotation.scale)}
          className="cursor-pointer hover:opacity-80"
          onDoubleClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // For lines, we could open a modal to edit color/thickness
            // For now, just allow deletion
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            onDelete(annotation.id);
          }}
        />
      </svg>
    );
  }

  // Handle text annotations
  const [position, setPosition] = useState({
    x: annotation.x * (scale / annotation.scale),
    y: annotation.y * (scale / annotation.scale),
  });

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
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // Update annotation position
      annotation.x = position.x * (annotation.scale / scale);
      annotation.y = position.y * (annotation.scale / scale);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
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
      className={`annotation ${isDragging ? "dragging" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        fontSize: `${Math.round(fontSize * scale)}px`,
        pointerEvents: "all",
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {annotation.text}
    </div>
  );
}
