import { useState, useEffect, useRef } from 'react';
import { Moon, Sun, RefreshCw, Trash2, CheckCircle2, Download, FilePlus } from 'lucide-react';
import FileCard from './components/FileCard';
import type { FileItem } from './components/FileCard';
import { detectFileCategory, getTargetFormats } from './utils/registry';
import { convertFile, compressFile } from './utils/engine';

// Helper to decode a minimal valid PDF base64 string into a File object
const getValidMockPdfFile = (fileName: string): File => {
  const base64Pdf = 'JVBERi0xLgoxIDAgb2JqPDwvUGFnZXMgMiAwIFI+PmVuZG9iagoyIDAgb2JqPDwvS2lkc1szIDAgUl0vQ291bnQgMT4+ZW5kb2JqCjMgMCBvYmo8PC9QYXJlbnQgMiAwIFI+PmVuZG9iagp0cmFpbGVyIDw8L1Jvb3QgMSAwIFI+Pg==';
  try {
    const byteCharacters = atob(base64Pdf);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], fileName, { type: 'application/pdf' });
  } catch {
    return new File(['%PDF-1.1\nFormatly Mock PDF'], fileName, { type: 'application/pdf' });
  }
};

export default function App() {
  const [mode, setMode] = useState<'convert' | 'compress'>('convert');
  const [files, setFiles] = useState<FileItem[]>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('mock=true')) {
      const fileName = 'very_long_file_name_that_should_truncate_gracefully_to_fit_in_the_row_and_leave_plenty_of_space_for_other_components.pdf';
      return [{
        id: 'mock-file-id',
        file: getValidMockPdfFile(fileName),
        name: fileName,
        size: 1024 * 1024 * 5,
        category: 'documents',
        sourceFormat: 'pdf',
        targetFormat: 'docx',
        status: 'idle',
        progress: 0,
        progressMsg: '',
        compressionLevel: 0.5
      }];
    }
    return [];
  });
  const [darkTheme, setDarkTheme] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkTheme]);

  const handleFilesAdded = (fileList: FileList) => {
    setErrorMsg(null);
    const newItems: FileItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const match = detectFileCategory(file.name);

      if (!match) {
        setErrorMsg(`Unsupported file type: ${file.name}`);
        continue;
      }

      // Filter out duplicate files
      if (files.some(f => f.file.name === file.name && f.file.size === file.size)) {
        continue;
      }

      // Determine default target format
      const targetFormats = getTargetFormats(match.category);
      let defaultTarget = 'pdf';
      const firstSubcat = Object.keys(targetFormats)[0];
      if (firstSubcat && targetFormats[firstSubcat].length > 0) {
        defaultTarget = targetFormats[firstSubcat][0].id;
      }

      newItems.push({
        id: `${file.name}-${Date.now()}-${i}`,
        file,
        name: file.name,
        size: file.size,
        category: match.category,
        sourceFormat: match.format.id,
        targetFormat: defaultTarget,
        status: 'idle',
        progress: 0,
        progressMsg: '',
        compressionLevel: 0.5
      });
    }

    if (newItems.length > 0) {
      setFiles(prev => [...prev, ...newItems]);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleTargetFormatChange = (id: string, format: string) => {
    setFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, targetFormat: format } : f))
    );
  };

  const handleCompressionLevelChange = (id: string, level: number) => {
    setFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, compressionLevel: level } : f))
    );
  };

  // Run conversion or compression on a specific file
  const processSingleFile = async (id: string) => {
    const fileItem = files.find(f => f.id === id);
    if (!fileItem || fileItem.status === 'processing') return;

    setFiles(prev =>
      prev.map(f =>
        f.id === id
          ? {
            ...f,
            status: 'processing',
            progress: 0,
            progressMsg: mode === 'convert' ? 'Starting conversion...' : 'Initializing compression...'
          }
          : f
      )
    );

    try {
      if (mode === 'convert') {
        const result = await convertFile(fileItem.file, fileItem.targetFormat, (prog) => {
          setFiles(prev =>
            prev.map(f =>
              f.id === id
                ? {
                  ...f,
                  progress: prog.percent,
                  progressMsg: prog.message,
                  logs: prog.logs
                }
                : f
            )
          );
        });

        setFiles(prev =>
          prev.map(f =>
            f.id === id
              ? {
                ...f,
                status: 'success',
                progress: 100,
                resultUrl: result.url,
                resultSize: result.fileSize
              }
              : f
          )
        );
      } else {
        const result = await compressFile(fileItem.file, fileItem.compressionLevel, (prog) => {
          setFiles(prev =>
            prev.map(f =>
              f.id === id
                ? {
                  ...f,
                  progress: prog.percent,
                  progressMsg: prog.message,
                  logs: prog.logs
                }
                : f
            )
          );
        });

        setFiles(prev =>
          prev.map(f =>
            f.id === id
              ? {
                ...f,
                status: 'success',
                progress: 100,
                resultUrl: result.url,
                resultSize: result.fileSize
              }
              : f
          )
        );
      }
    } catch (err: any) {
      console.error(err);
      setFiles(prev =>
        prev.map(f =>
          f.id === id
            ? {
              ...f,
              status: 'error',
              progressMsg: err.message || 'Processing failed'
            }
            : f
        )
      );
    }
  };

  // Process all idle files
  const processAllFiles = () => {
    files.forEach(f => {
      if (f.status === 'idle') {
        processSingleFile(f.id);
      }
    });
  };

  // Clear all files
  const clearAllFiles = () => {
    setFiles([]);
    setErrorMsg(null);
  };

  // Download all completed files
  const downloadAllFiles = () => {
    const completed = files.filter(f => f.status === 'success');
    completed.forEach((f, idx) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = f.resultUrl || '';
        const base = f.name.substring(0, f.name.lastIndexOf('.'));
        const ext = mode === 'convert' ? f.targetFormat : f.sourceFormat;
        a.download = mode === 'convert' ? `${base}.${ext}` : `${base}_compressed.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, idx * 300); // Small interval to prevent browser popup block
    });
  };

  const completedCount = files.filter(f => f.status === 'success').length;
  const processingCount = files.filter(f => f.status === 'processing').length;
  const idleCount = files.filter(f => f.status === 'idle').length;

  // Calculate dynamic container width based on the longest filename in the queue
  const longestFileNameLength = files.reduce((max, f) => Math.max(max, f.name.length), 0);
  const containerWidth = Math.min(1200, Math.max(734, 480 + longestFileNameLength * 8));

  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (processingCount > 0) return;

    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (processingCount > 0) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (processingCount > 0) return;
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(e.target.files);
    }
  };

  const triggerFileInput = () => {
    if (processingCount > 0) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="app-container">
      {/* Main Header navigation */}
      <header className="main-nav" data-node-id="457:140063">
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} data-node-id="457:140068">
          <svg width="32" height="32" viewBox="0 0 63 63" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 19C9.34315 19 8 20.3431 8 22V56.5C8 58.1569 9.34315 59.5 11 59.5H36V33.2426C36 32.447 35.6839 31.6839 35.1213 31.1213L23.8787 19.8787C23.3161 19.3161 22.553 19 21.7574 19H11Z" fill="currentColor"/>
            <path d="M40.2574 4C41.053 4 41.8161 4.31607 42.3787 4.87868L53.6213 16.1213C54.1839 16.6839 54.5 17.447 54.5 18.2426V56.5C54.5 58.1569 53.1569 59.5 51.5 59.5H40V31.5854C40 30.7898 39.6839 30.0267 39.1213 29.4641L25.5359 15.8787C24.9733 15.3161 24.2102 15 23.4146 15H14.5V7C14.5 5.34315 15.8431 4 17.5 4H40.2574Z" fill="currentColor"/>
          </svg>
          <span>Formatly</span>
        </div>
        <button
          className="theme-toggle-btn"
          onClick={() => setDarkTheme(!darkTheme)}
          aria-label={darkTheme ? "Switch to light mode" : "Switch to dark mode"}
          data-node-id="457:140069"
        >
          {darkTheme ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </header>

      {/* Main Card Content */}
      <main className="card-wrapper" data-node-id="457:139998">
        {/* Bio Text */}
        <section className="bio-section" data-node-id="457:139999">
          <h1 className="bio-title" data-node-id="457:140001">
            Convert. Compress. Done.
          </h1>
          <p className="bio-desc" data-node-id="457:140002">
            Drop a file, pick your format, and convert it in one click. Compress your files without the hassle.
          </p>
        </section>

        {/* Switch Mode Switcher */}
        <div className="mode-switch-pill" style={{ position: 'relative' }} data-node-id="457:140003">
          {/* Sliding background */}
          <div
            className="mode-switch-slider"
            style={{
              position: 'absolute',
              top: '8px',
              left: mode === 'convert' ? '8px' : '130px',
              width: '112px',
              height: '48px',
              borderRadius: '200px',
              backgroundColor: 'var(--btn-bg-primary)',
              transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: 'var(--shadow-kjj)',
              zIndex: 0
            }}
          />

          <button
            type="button"
            className="mode-switch-btn"
            style={{
              backgroundColor: 'transparent',
              color: mode === 'convert' ? 'var(--btn-text-primary)' : 'var(--text-primary)',
              fontWeight: mode === 'convert' ? 500 : 400,
              zIndex: 1,
              boxShadow: 'none',
              padding: '4px'
            }}
            onClick={() => {
              setMode('convert');
              clearAllFiles();
            }}
            data-node-id="457:140004"
          >
            Convert
          </button>
          <button
            type="button"
            className="mode-switch-btn"
            style={{
              backgroundColor: 'transparent',
              color: mode === 'compress' ? 'var(--btn-text-primary)' : 'var(--text-primary)',
              fontWeight: mode === 'compress' ? 500 : 400,
              zIndex: 1,
              boxShadow: 'none',
              padding: '4px'
            }}
            onClick={() => {
              setMode('compress');
              clearAllFiles();
            }}
            data-node-id="457:140005"
          >
            Compress
          </button>
        </div>

        {/* Category tabs and global mapper removed */}

        {/* Error notification */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'var(--error-bg)',
              border: '1.5px solid var(--error-color)',
              borderRadius: '8px',
              padding: '12px 24px',
              color: 'var(--error-color)',
              fontSize: '14px',
              fontFamily: 'Google Sans Flex, sans-serif',
              fontWeight: 500,
              maxWidth: '398px',
              textAlign: 'center',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Main Unified Card Container */}
        <div
          className={`main-card-wrapper ${isDragActive ? 'drag-active' : ''}`}
          style={{
            backgroundColor: 'var(--card-bg)',
            border: isDragActive ? '1.5px dashed var(--accent-color)' : '1.5px solid var(--card-border)',
            borderRadius: '16px',
            padding: '24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%',
            maxWidth: `${containerWidth}px`,
            boxShadow: 'var(--shadow-card)',
            fontFamily: 'Google Sans Flex, sans-serif',
            transition: 'all 0.3s ease',
            animation: 'fadeIn 0.3s ease-out',
            boxSizing: 'border-box'
          }}
        >
          {files.length === 0 ? (
            /* Dropzone View (Empty State) */
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              style={{
                border: '1.5px dashed var(--card-border)',
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.005)',
                padding: '48px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                cursor: processingCount > 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                minHeight: '220px',
                width: '100%'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={processingCount > 0}
              />

              {/* Stacked File & Upload Icon */}
              <div style={{ position: 'relative', width: '40px', height: '48px', marginBottom: '8px' }}>
                <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--text-secondary)' }}>
                  <path d="M2.5 0C1.11929 0 0 1.11929 0 2.5V45.5C0 46.8807 1.11929 48 2.5 48H37.5C38.8807 48 40 46.8807 40 45.5V12L28 0H2.5Z" fill="currentColor" opacity="0.05" />
                  <path d="M2.5 0.5H28V12H39.5V45.5C39.5 46.6046 38.6046 47.5 37.5 47.5H2.5C1.39543 47.5 0.5 46.6046 0.5 45.5V2.5C0.5 1.39543 1.39543 0.5 2.5 0.5Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M28 0.5V12H39.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--card-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 9V1M5 1L1 5M5 1L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 600 }}>
                  <span>Drag and Drop file here or </span>
                  <span
                    style={{
                      color: 'var(--text-primary)',
                      textDecoration: 'underline',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Choose file
                  </span>
                </div>

                {/* Maximum Size Limit */}
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Maximum size: 1GB
                </div>
              </div>
            </div>
          ) : (
            /* File List & Processing View (Expanded State) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

              {/* Compact Drag Target at Top */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                style={{
                  border: '1.5px dashed var(--card-border)',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.005)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: processingCount > 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  userSelect: 'none',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  width: '100%'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={processingCount > 0}
                />
                <FilePlus size={16} />
                <span>Drag more files here or <b style={{ textDecoration: 'underline' }}>Choose files</b></span>
              </div>

              {/* Bulk Action Toolbar */}
              <div
                className="queue-header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--card-border)',
                  paddingBottom: '12px'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span>Queue: {files.length} file(s)</span>
                  {completedCount > 0 && (
                    <span style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} />
                      {completedCount} completed
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {idleCount > 0 && (
                    <button
                      type="button"
                      onClick={processAllFiles}
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--text-secondary)',
                        border: 'none',
                        padding: '6px 8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'color 0.2s ease',
                        fontFamily: 'inherit'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <RefreshCw size={14} />
                      <span>RUN ALL</span>
                    </button>
                  )}

                  {idleCount > 0 && completedCount > 0 && (
                    <span style={{ color: 'var(--card-border)', fontSize: '14px', userSelect: 'none' }}>|</span>
                  )}

                  {completedCount > 0 && (
                    <button
                      type="button"
                      onClick={downloadAllFiles}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#2e7d32',
                        border: 'none',
                        padding: '6px 8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'opacity 0.2s ease',
                        fontFamily: 'inherit'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      <Download size={14} />
                      <span>DOWNLOAD ALL</span>
                    </button>
                  )}

                  {((idleCount > 0 || completedCount > 0) && files.length > 0) && (
                    <span style={{ color: 'var(--card-border)', fontSize: '14px', userSelect: 'none' }}>|</span>
                  )}

                  <button
                    type="button"
                    onClick={clearAllFiles}
                    disabled={processingCount > 0}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary)',
                      border: 'none',
                      padding: '6px 8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: processingCount > 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: processingCount > 0 ? 0.5 : 1,
                      transition: 'color 0.2s ease',
                      fontFamily: 'inherit'
                    }}
                    onMouseOver={(e) => {
                      if (processingCount === 0) {
                        e.currentTarget.style.color = 'var(--error-color)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (processingCount === 0) {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <Trash2 size={14} />
                    <span>CLEAR ALL</span>
                  </button>
                </div>
              </div>

              {/* List of File Card Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                {files.map(item => (
                  <FileCard
                    key={item.id}
                    fileItem={item}
                    mode={mode}
                    onRemove={handleRemoveFile}
                    onStart={processSingleFile}
                    onTargetFormatChange={handleTargetFormatChange}
                    onCompressionLevelChange={handleCompressionLevelChange}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: 0.8
        }}>
          <span>🔒 Your files are secure. We do not store any of the files uploaded.</span>
        </div>
      </main>

      <footer className="footer-section" data-node-id="457:140071">
        <span>Made with ❤️ by</span>
        <a 
          href="https://odunfalade.vercel.app/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="footer-author" 
          style={{ textDecoration: 'none', color: 'var(--text-primary)', transition: 'opacity 0.2s' }}
          onMouseOver={(e) => { e.currentTarget.style.opacity = '0.7'; }}
          onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
          data-node-id="457:140073"
        >
          Odunayo Falade.
        </a>
      </footer>
    </div>
  );
}
