import React from 'react';
import { usePDF } from '../contexts/PDFContext';

export default function PDFToolbar() {
  const {
    currentPage,
    totalPages,
    scale,
    currentFontSize,
    setPage,
    setScale,
    setFontSize,
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

  return (
    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg mb-5 flex-wrap gap-3">
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

      {/* Font Size Control */}
      <div className="flex items-center gap-2">
        <label htmlFor="defaultFontSize" className="text-sm font-semibold text-gray-600">
          Default Font Size:
        </label>
        <select
          id="defaultFontSize"
          value={currentFontSize}
          onChange={handleFontSizeChange}
          className="px-3 py-1 border border-gray-300 rounded text-sm bg-white cursor-pointer focus:outline-none focus:border-primary-500"
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
  );
}
