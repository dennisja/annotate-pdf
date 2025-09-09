import React from 'react';
import { usePDF } from '../contexts/PDFContext';

export default function Header() {
  const { annotations, clearAnnotations, saveAnnotatedPDF, isLoading } = usePDF();

  const handleSave = async () => {
    try {
      await saveAnnotatedPDF();
      alert('PDF saved successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleClear = () => {
    if (annotations.length > 0 && confirm('Clear all annotations?')) {
      clearAnnotations();
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md p-5 rounded-xl mb-5 shadow-lg">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">PDF Annotator</h1>
        
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleSave}
            disabled={!annotations.length || isLoading}
            className="btn btn-success"
          >
            {isLoading ? (
              <>
                <div className="loading"></div>
                Saving...
              </>
            ) : (
              'Save Annotated PDF'
            )}
          </button>
          
          <button
            onClick={handleClear}
            disabled={!annotations.length}
            className="btn btn-secondary"
          >
            Clear Annotations
          </button>
        </div>
      </div>
    </header>
  );
}
