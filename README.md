# PDF Annotator - React

A modern, React-based PDF annotation tool built with Vite and Tailwind CSS. Add text annotations anywhere on PDF documents and save them permanently.

## 🚀 Features

✨ **Core Functionality**

- Upload PDF files via drag & drop or click
- Click anywhere on PDF to add text annotations
- Drag annotations to reposition them
- Double-click annotations to edit text and font size
- Right-click annotations to delete them
- Save annotated PDFs with embedded text

🎛️ **Navigation & Controls**

- Navigate between pages with Previous/Next buttons
- Zoom in/out functionality with mouse or keyboard
- Keyboard shortcuts for navigation
- Page counter display
- Font size control (8pt - 24pt)

💫 **User Experience**

- Modern React architecture with hooks
- Responsive design with Tailwind CSS
- Smooth animations and transitions
- Loading states and error handling
- Context-based state management

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **PDF.js** - PDF rendering (pdfjs-dist)
- **PDF-lib** - PDF modification and saving
- **Context API** - State management

## 📦 Installation

```bash
# Clone or navigate to the project
cd pdf-annotator-react

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Header.jsx           # Main header with save/clear buttons
│   ├── FileUpload.jsx       # Drag & drop file upload
│   ├── PDFToolbar.jsx       # Page navigation and controls
│   ├── PDFViewer.jsx        # Main PDF viewer with annotations
│   └── AnnotationModal.jsx  # Modal for adding/editing annotations
├── contexts/
│   └── PDFContext.jsx       # PDF state management context
├── App.jsx                  # Main app component
├── main.jsx                 # React entry point
└── index.css               # Tailwind CSS imports and custom styles
```

## 🎯 Component Architecture

### **PDFContext**

- Centralized state management for PDF data
- Handles PDF loading, annotation CRUD operations
- Provides hooks for components to access PDF state

### **Header**

- Save and clear annotation controls
- Loading states and error handling
- Action buttons with proper disabled states

### **FileUpload**

- Drag & drop file upload interface
- File validation and error display
- Loading state during PDF processing

### **PDFToolbar**

- Page navigation controls
- Zoom controls
- Default font size selector

### **PDFViewer**

- PDF rendering with PDF.js
- Annotation overlay system
- Click-to-add annotation functionality
- Drag-to-move annotations

### **AnnotationModal**

- Unified modal for creating and editing
- Font size selection
- Keyboard shortcuts (Escape to cancel, Ctrl/Cmd+Enter to save)

## 🎮 Usage

1. **Upload PDF**: Drag & drop or click to upload a PDF file
2. **Add Annotations**: Click anywhere on the PDF to add text
3. **Edit Annotations**: Double-click any annotation to edit
4. **Move Annotations**: Drag annotations to reposition them
5. **Delete Annotations**: Right-click any annotation to delete
6. **Save PDF**: Click "Save Annotated PDF" to download with embedded annotations

## ⌨️ Keyboard Shortcuts

- `←` / `→` - Navigate between pages
- `+` / `-` - Zoom in/out
- `Escape` - Cancel annotation input (in modal)
- `Ctrl/Cmd + Enter` - Save annotation (in modal)

## 🎨 Styling

Built with Tailwind CSS featuring:

- **Gradient backgrounds** - Beautiful purple/blue gradients
- **Glass morphism** - Backdrop blur effects on panels
- **Smooth animations** - Hover effects and transitions
- **Responsive design** - Mobile-friendly layout
- **Custom components** - Reusable button and annotation styles

## 🔧 Development

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📱 Responsive Design

- **Desktop**: Full-featured experience with all controls
- **Tablet**: Optimized toolbar layout
- **Mobile**: Touch-friendly interface with responsive controls

## 🚀 Performance

- **Code splitting** - Lazy loading of PDF components
- **Memory efficient** - Proper cleanup of PDF resources
- **Fast rendering** - Optimized Canvas operations
- **Smooth interactions** - Hardware-accelerated animations

## 🔒 Privacy & Security

- **Client-side only** - PDFs never leave your device
- **No data collection** - No analytics or tracking
- **Offline capable** - Works without internet connection
- **Local processing** - All PDF operations in browser

## 🐛 Troubleshooting

**PDF won't load**: Ensure file is valid PDF and try different browser
**Annotations disappear**: Make sure to save before closing browser
**Slow performance**: Try reducing zoom level for large PDFs
**Save fails**: Check browser permissions and available disk space

---

Built with ❤️ using React, Vite, and Tailwind CSS for fast, reliable PDF annotation.
