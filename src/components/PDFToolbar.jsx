import React from "react";
import { usePDF } from "../contexts/PDFContext";

export default function PDFToolbar() {
  const {
    currentPage,
    totalPages,
    scale,
    currentFontSize,
    drawingMode,
    lineThickness,
    lineColor,
    setPage,
    setScale,
    setFontSize,
    setDrawingMode,
    setLineThickness,
    setLineColor,
  } = usePDF();

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setScale(Math.min(scale * 1.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale / 1.2, 0.5));
  };

  const handleFontSizeChange = (e) => {
    setFontSize(parseInt(e.target.value));
  };

  const handleDrawingModeChange = (mode) => {
    setDrawingMode(mode);
  };

  const handleLineThicknessChange = (e) => {
    setLineThickness(parseInt(e.target.value));
  };

  const handleLineColorChange = (e) => {
    setLineColor(e.target.value);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-5">
      {/* Top Row: Page Navigation and Zoom */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        {/* Page Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="btn btn-small btn-secondary"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="btn btn-small btn-secondary"
          >
            Next
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleZoomOut}
            className="btn btn-small btn-secondary"
          >
            -
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="btn btn-small btn-secondary"
          >
            +
          </button>
        </div>
      </div>

      {/* Bottom Row: Drawing Tools */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Drawing Mode */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600">Mode:</span>
          <button
            onClick={() => handleDrawingModeChange("text")}
            className={`btn btn-small ${drawingMode === "text" ? "btn-primary" : "btn-secondary"}`}
          >
            📝 Text
          </button>
          <button
            onClick={() => handleDrawingModeChange("line")}
            className={`btn btn-small ${drawingMode === "line" ? "btn-primary" : "btn-secondary"}`}
          >
            📏 Line
          </button>
        </div>

        {/* Text Controls */}
        {drawingMode === "text" && (
          <div className="flex items-center gap-2">
            <label
              htmlFor="defaultFontSize"
              className="text-sm font-semibold text-gray-600"
            >
              Font Size:
            </label>
            <select
              id="defaultFontSize"
              value={currentFontSize}
              onChange={handleFontSizeChange}
              className="px-3 py-1 border border-gray-300 rounded text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500"
            >
              <option value="8">8pt</option>
              <option value="10">10pt</option>
              <option value="12">12pt</option>
              <option value="14">14pt</option>
              <option value="16">16pt</option>
              <option value="18">18pt</option>
              <option value="20">20pt</option>
              <option value="24">24pt</option>
            </select>
          </div>
        )}

        {/* Line Controls */}
        {drawingMode === "line" && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label
                htmlFor="lineThickness"
                className="text-sm font-semibold text-gray-600"
              >
                Thickness:
              </label>
              <select
                id="lineThickness"
                value={lineThickness}
                onChange={handleLineThicknessChange}
                className="px-3 py-1 border border-gray-300 rounded text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value="1">1px</option>
                <option value="2">2px</option>
                <option value="3">3px</option>
                <option value="4">4px</option>
                <option value="5">5px</option>
                <option value="8">8px</option>
                <option value="10">10px</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="lineColor"
                className="text-sm font-semibold text-gray-600"
              >
                Color:
              </label>
              <input
                id="lineColor"
                type="color"
                value={lineColor}
                onChange={handleLineColorChange}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
