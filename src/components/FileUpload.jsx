import React, { useRef, useState } from 'react';
import { usePDF } from '../contexts/PDFContext';

export default function FileUpload() {
  const { loadPDF, isLoading, error } = usePDF();
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = async (file) => {
    if (file && file.type === 'application/pdf') {
      await loadPDF(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-5 shadow-lg">
      <div
        className={`border-3 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? 'border-primary-500 bg-primary-50 transform scale-105'
            : 'border-gray-300 bg-gray-50 hover:border-primary-500 hover:bg-primary-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
        />
        
        {isLoading ? (
          <div className="text-gray-600">
            <div className="loading mx-auto mb-4 w-8 h-8 border-4"></div>
            <p className="text-lg">Loading PDF...</p>
          </div>
        ) : (
          <div className="text-gray-600">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
              />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10,9 9,9 8,9" />
            </svg>
            <p className="text-lg mb-2">Click to upload a PDF file or drag and drop</p>
            {error && (
              <p className="text-red-500 text-sm mt-2">
                Error: {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
