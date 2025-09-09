import React, { useEffect } from "react";
import { PDFProvider, usePDF } from "./contexts/PDFContext";
import Header from "./components/Header";
import FileUpload from "./components/FileUpload";
import PDFToolbar from "./components/PDFToolbar";
import PDFViewer from "./components/PDFViewer";

function AppContent() {
  const { pdfDoc, setPage, setScale, currentPage, totalPages, scale } =
    usePDF();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!pdfDoc) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (currentPage > 1) {
            setPage(currentPage - 1);
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (currentPage < totalPages) {
            setPage(currentPage + 1);
          }
          break;
        case "+":
        case "=":
          e.preventDefault();
          setScale(Math.min(scale * 1.2, 3.0));
          break;
        case "-":
          e.preventDefault();
          setScale(Math.max(scale / 1.2, 0.5));
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [pdfDoc, currentPage, totalPages, scale, setPage, setScale]);

  return (
    <div className="min-h-screen p-5">
      <div className="max-w-6xl mx-auto">
        <Header />

        <main>
          {!pdfDoc ? (
            <FileUpload />
          ) : (
            <>
              <PDFToolbar />
              <PDFViewer />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <PDFProvider>
      <AppContent />
    </PDFProvider>
  );
}

export default App;
