import React, { useState, useEffect } from 'react';

export default function AnnotationModal({
  isOpen,
  onClose,
  onSave,
  annotation = null,
  defaultFontSize = 12,
}) {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(defaultFontSize);

  useEffect(() => {
    if (isOpen) {
      if (annotation) {
        // Editing existing annotation
        setText(annotation.text);
        setFontSize(annotation.fontSize || 12);
      } else {
        // Creating new annotation
        setText('');
        setFontSize(defaultFontSize);
      }
    }
  }, [isOpen, annotation, defaultFontSize]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSave(text.trim(), fontSize);
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {annotation ? 'Edit Text Annotation' : 'Add Text Annotation'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your annotation text..."
            rows="4"
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm resize-vertical mb-4 
                     focus:outline-none focus:border-primary-500 transition-colors"
            autoFocus
          />
          
          <div className="flex items-center gap-3 mb-6">
            <label htmlFor="fontSize" className="font-semibold text-gray-700">
              Font Size:
            </label>
            <select
              id="fontSize"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm bg-white cursor-pointer
                       focus:outline-none focus:border-primary-500 transition-colors"
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
          
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="btn btn-primary"
            >
              {annotation ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
