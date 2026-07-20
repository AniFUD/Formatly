import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Download, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import { getTargetFormats } from '../utils/registry';
import type { CategoryType } from '../utils/registry';

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  category: CategoryType;
  sourceFormat: string;
  targetFormat: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  progress: number;
  progressMsg: string;
  logs?: string[];
  resultUrl?: string;
  resultSize?: number;
  compressionLevel: number; // 0.2: High, 0.5: Medium, 0.8: Low
}

interface FileCardProps {
  fileItem: FileItem;
  mode: 'convert' | 'compress';
  onRemove: (id: string) => void;
  onStart: (id: string) => void;
  onTargetFormatChange: (id: string, format: string) => void;
  onCompressionLevelChange: (id: string, level: number) => void;
}

export default function FileCard({
  fileItem,
  mode,
  onRemove,
  onStart,
  onTargetFormatChange,
  onCompressionLevelChange
}: FileCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCompressDropdown, setShowCompressDropdown] = useState(false);
  const targetFormatsGroup = getTargetFormats(fileItem.category);
  const [activeSubcat, setActiveSubcat] = useState<string>(() => Object.keys(targetFormatsGroup)[0] || '');
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const compressDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (compressDropdownRef.current && !compressDropdownRef.current.contains(event.target as Node)) {
        setShowCompressDropdown(false);
      }
    }
    if (showCompressDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCompressDropdown]);

  // Get all formats in flat list for searching
  const allFormats: { id: string; label: string; subcat: string }[] = [];
  Object.keys(targetFormatsGroup).forEach(subcat => {
    targetFormatsGroup[subcat].forEach(fmt => {
      allFormats.push({ id: fmt.id, label: fmt.label, subcat });
    });
  });

  const filteredFormats = searchQuery.trim()
    ? allFormats.filter(fmt =>
      fmt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fmt.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const formatsToShow = searchQuery.trim()
    ? filteredFormats
    : targetFormatsGroup[activeSubcat] || [];

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 1;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
  };




  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%' }}>
      {/* File Card Row */}
      <div
        className="file-card-row"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1.5px solid var(--card-border)',
          borderRadius: '12px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          height: '88px',
          boxShadow: 'none',
          position: 'relative',
          gap: '32px'
        }}
        data-node-id="457:140126"
      >
        {/* Left Side: Metadata */}
        <div
          className="file-card-metadata"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'Google Sans Flex, sans-serif',
            fontSize: '16px',
            color: 'var(--text-primary)',
            minWidth: 0,
            flex: '1 1 auto'
          }}
          data-node-id="457:140127"
        >
          <span
            className="file-card-name"
            style={{
              fontWeight: 500,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              color: 'var(--text-primary)',
              maxWidth: '280px'
            }}
            data-node-id="457:140128"
          >
            {fileItem.name}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }} data-node-id="457:140129">
            |
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px', whiteSpace: 'nowrap' }} data-node-id="457:140130">
            {formatSize(fileItem.size)}
          </span>
        </div>

        {/* Right Side: Options & Actions */}
        <div
          className="file-card-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
          data-node-id="457:140133"
        >
          {fileItem.status === 'idle' && (
            <>
              {mode === 'convert' ? (
                /* Target Format Dropdown Selector */
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="selector-trigger-btn"
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1.5px solid var(--card-border)',
                      borderRadius: '10px',
                      height: '48px',
                      padding: '0 16px',
                      fontFamily: 'Google Sans Flex, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = 'var(--text-primary)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'var(--card-border)';
                    }}
                  >
                    <span>To {fileItem.targetFormat.toUpperCase()}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--text-secondary)' }}>
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {showDropdown && (
                    <div
                      ref={dropdownRef}
                      className="format-popover"
                      style={{
                        position: 'absolute',
                        bottom: '54px',
                        right: 0,
                        backgroundColor: 'var(--card-bg)',
                        border: '1.5px solid var(--card-border)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                        zIndex: 99,
                        width: '460px',
                        height: '320px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        fontFamily: 'Google Sans Flex, sans-serif',
                        animation: 'dropdownFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        transformOrigin: 'bottom right'
                      }}
                    >
                      {/* Search Bar */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          borderBottom: '1px solid var(--card-border)',
                          backgroundColor: 'var(--card-bg)'
                        }}
                      >
                        <Search size={16} style={{ color: 'var(--text-secondary)' }} />
                        <input
                          type="text"
                          placeholder="Search Format"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{
                            flexGrow: 1,
                            border: 'none',
                            background: 'transparent',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            outline: 'none',
                            color: 'var(--text-primary)'
                          }}
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="popover-content" style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                        {/* Sidebar (only shown if not searching) */}
                        {!searchQuery.trim() && (
                          <div
                            className="popover-sidebar"
                            style={{
                              width: '180px',
                              borderRight: '1px solid var(--card-border)',
                              overflowY: 'auto',
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                          >
                            {Object.keys(targetFormatsGroup).map(subcat => (
                              <button
                                key={subcat}
                                type="button"
                                onClick={() => setActiveSubcat(subcat)}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '12px 14px',
                                  border: 'none',
                                  backgroundColor: activeSubcat === subcat ? 'var(--card-bg)' : 'transparent',
                                  color: 'var(--text-primary)',
                                  fontSize: '13px',
                                  fontWeight: activeSubcat === subcat ? 600 : 500,
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  borderLeft: activeSubcat === subcat ? '3px solid var(--text-primary)' : '3px solid transparent',
                                  transition: 'background-color 0.15s'
                                }}
                                className="dropdown-item"
                              >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '4px' }}>
                                  {subcat}
                                </span>
                                {activeSubcat === subcat && <ChevronRight size={12} style={{ color: 'var(--text-secondary)' }} />}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Grid of formats */}
                        <div style={{ flexGrow: 1, padding: '16px', overflowY: 'auto', backgroundColor: 'var(--card-bg)' }}>
                          {searchQuery.trim() && (
                            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>
                              Search Results ({filteredFormats.length})
                            </div>
                          )}
                          {formatsToShow.length === 0 ? (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
                              No formats found
                            </div>
                          ) : (
                            <div
                              key={activeSubcat}
                              className="popover-grid"
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '8px',
                                animation: 'fadeIn 0.2s ease-out'
                              }}
                            >
                              {formatsToShow.map(fmt => (
                                <button
                                  key={fmt.id}
                                  type="button"
                                  onClick={() => {
                                    onTargetFormatChange(fileItem.id, fmt.id);
                                    setShowDropdown(false);
                                  }}
                                  style={{
                                    padding: '8px 4px',
                                    border: '1px solid var(--card-border)',
                                    borderRadius: '6px',
                                    backgroundColor: fileItem.targetFormat === fmt.id ? 'var(--text-primary)' : 'var(--card-bg)',
                                    color: fileItem.targetFormat === fmt.id ? 'var(--card-bg)' : 'var(--text-primary)',
                                    textAlign: 'center',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    transition: 'all 0.15s ease'
                                  }}
                                  className="dropdown-item"
                                >
                                  {fmt.id}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Compression Level Selector */
                <div style={{ position: 'relative' }} ref={compressDropdownRef}>
                  <button
                    type="button"
                    className="selector-trigger-btn"
                    onClick={() => setShowCompressDropdown(!showCompressDropdown)}
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      border: showCompressDropdown ? '1.5px solid #2563eb' : '1.5px solid var(--card-border)',
                      borderRadius: '10px',
                      height: '48px',
                      width: '240px',
                      padding: '0 16px',
                      fontFamily: 'Google Sans Flex, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onMouseOver={(e) => {
                      if (!showCompressDropdown) {
                        e.currentTarget.style.borderColor = 'var(--text-primary)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!showCompressDropdown) {
                        e.currentTarget.style.borderColor = 'var(--card-border)';
                      }
                    }}
                  >
                    <span>
                      {fileItem.compressionLevel === 0.8 && 'Low Compression'}
                      {fileItem.compressionLevel === 0.5 && 'Medium Compression'}
                      {fileItem.compressionLevel === 0.2 && 'High Compression'}
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        color: showCompressDropdown ? '#2563eb' : 'var(--text-secondary)',
                        transition: 'transform 0.2s ease',
                        transform: showCompressDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    >
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {showCompressDropdown && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '54px',
                        right: 0,
                        backgroundColor: 'var(--card-bg)',
                        border: '1.5px solid var(--card-border)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                        zIndex: 99,
                        width: '240px',
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        fontFamily: 'Google Sans Flex, sans-serif',
                        animation: 'dropdownFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        transformOrigin: 'bottom right'
                      }}
                    >
                      {[
                        { value: 0.8, label: 'Low Compression', desc: 'High Quality' },
                        { value: 0.5, label: 'Medium Compression', desc: 'Balanced' },
                        { value: 0.2, label: 'High Compression', desc: 'Small Size' }
                      ].map((opt) => {
                        const isSelected = fileItem.compressionLevel === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              onCompressionLevelChange(fileItem.id, opt.value);
                              setShowCompressDropdown(false);
                            }}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                              border: 'none',
                              color: isSelected ? '#2563eb' : 'var(--text-primary)',
                              fontSize: '13px',
                              fontWeight: isSelected ? 600 : 500,
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseOver={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                              }
                            }}
                            onMouseOut={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            <span>{opt.label}</span>
                            <span style={{ fontSize: '11px', color: isSelected ? '#2563eb' : 'var(--text-secondary)', fontWeight: 400 }}>
                              {opt.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Action Trigger Button */}
              <button
                type="button"
                className="action-trigger-btn"
                onClick={() => onStart(fileItem.id)}
                style={{
                  backgroundColor: 'var(--btn-bg-primary)',
                  color: 'var(--btn-text-primary)',
                  border: 'none',
                  borderRadius: '10px',
                  height: '48px',
                  padding: '0 24px',
                  fontFamily: 'Google Sans Flex, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  whiteSpace: 'nowrap'
                }}
                data-node-id="457:140134"
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {mode === 'convert' ? `Convert to ${fileItem.targetFormat.toUpperCase()}` : 'Compress file'}
              </button>
            </>
          )}

          {fileItem.status === 'processing' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#777', fontSize: '14px' }}>
              <Loader2 size={16} className="animate-spin" />
              <span>Processing ({fileItem.progress}%)</span>
            </div>
          )}

          {fileItem.status === 'success' && (
            <div style={{ color: 'var(--success-color)', fontSize: '14px', fontWeight: 500 }}>
              <span>Completed</span>
            </div>
          )}

          {fileItem.status === 'error' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error-color)', fontSize: '14px', fontWeight: 500 }}>
              <AlertTriangle size={16} />
              <span>Failed</span>
            </div>
          )}

          {/* Remove/Cancel Button */}
          <button
            type="button"
            className="remove-file-btn"
            onClick={() => onRemove(fileItem.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            data-node-id="457:140137"
            aria-label="Remove file"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Progress & Output State Panel below the row */}
      {fileItem.status !== 'idle' && (
        <div
          style={{
            width: '100%',
            backgroundColor: 'rgba(217, 217, 217, 0.4)',
            borderRadius: '12px',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {fileItem.status === 'processing' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                width: '100%'
              }}
              data-node-id="457:140215"
            >
              <Loader2 className="spinner animate-spin" size={20} style={{ color: 'var(--text-primary)' }} data-node-id="457:140217" />
              <p
                style={{
                  fontFamily: 'Google Sans Flex, sans-serif',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  margin: 0
                }}
                data-node-id="457:140218"
              >
                {fileItem.progressMsg}
              </p>
              {/* Progress Bar */}
              <div style={{ width: '200px', height: '4px', backgroundColor: 'var(--card-border)', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                <div style={{ width: `${fileItem.progress}%`, height: '100%', backgroundColor: 'var(--text-primary)', transition: 'width 0.2s ease' }} />
              </div>
              {/* Dev/Simulator Logs (collapsible) */}
              {fileItem.logs && fileItem.logs.length > 0 && (
                <div
                  style={{
                    width: '100%',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    backgroundColor: '#1e1e1e',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontFamily: 'Courier New, monospace',
                    fontSize: '11px',
                    color: '#00ff00',
                    textAlign: 'left',
                    marginTop: '8px',
                    lineHeight: '1.4'
                  }}
                >
                  {fileItem.logs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {fileItem.status === 'success' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                width: '100%'
              }}
              data-node-id="457:140297"
            >
              <p
                style={{
                  fontFamily: 'Google Sans Flex, sans-serif',
                  fontSize: '14px',
                  color: mode === 'compress' ? '#FFFFFF' : 'var(--text-primary)',
                  textAlign: 'center',
                  margin: 0,
                  fontWeight: 500
                }}
                data-node-id="457:140299"
              >
                {mode === 'convert'
                  ? `We have converted your ${fileItem.category.replace(/s$/, '')} file to ${fileItem.targetFormat.toUpperCase()}`
                  : `We have compressed your file to about ${Math.round((fileItem.resultSize || 0) / fileItem.size * 100)}% of its original size`}
              </p>

              {/* Download Trigger */}
              <a
                href={fileItem.resultUrl}
                download={fileItem.name.substring(0, fileItem.name.lastIndexOf('.')) + (mode === 'convert' ? `.${fileItem.targetFormat}` : `_compressed.${fileItem.sourceFormat}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: mode === 'compress' ? '#FFFFFF' : 'var(--btn-bg-primary)',
                  color: mode === 'compress' ? '#000000' : 'var(--btn-text-primary)',
                  padding: '10px 20px',
                  borderRadius: '200px',
                  fontFamily: 'Google Sans Flex, sans-serif',
                  fontSize: '14px',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'opacity 0.2s',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                data-node-id="457:140302"
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Download size={16} />
                <span>
                  {mode === 'convert' ? 'Download file' : 'Download compressed file'}
                </span>
                <span style={{ opacity: 0.6 }}>|</span>
                <span>{fileItem.resultSize ? formatSize(fileItem.resultSize) : ''}</span>
              </a>
            </div>
          )}

          {fileItem.status === 'error' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                color: 'var(--error-color)'
              }}
              data-node-id="457:140384"
            >
              <p
                style={{
                  fontFamily: 'Google Sans Flex, sans-serif',
                  fontSize: '14px',
                  textAlign: 'center',
                  margin: 0,
                  fontWeight: 500
                }}
                data-node-id="457:140386"
              >
                {mode === 'convert'
                  ? 'Error! Your file couldn’t be converted'
                  : 'Error! Your file couldn’t be compressed'}
              </p>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>
                The format container is corrupt or unsupported in browser sandbox.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
