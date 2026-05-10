import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Key, ChevronRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { generateSchemaFromDescription } from '../services/geminiService';
import type { Parameter } from '../types';

interface AIGenerateModalProps {
  onClose: () => void;
  onGenerate: (schemaName: string, parameters: Parameter[]) => void;
  theme: 'light' | 'dark';
}

export function AIGenerateModal({ onClose, onGenerate, theme }: AIGenerateModalProps) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(!localStorage.getItem('gemini_api_key'));
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [streamText, setStreamText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    if (!apiKey.trim()) { setShowKeyInput(true); return; }

    setStatus('loading');
    setError('');
    setStreamText('');

    try {
      localStorage.setItem('gemini_api_key', apiKey);
      const result = await generateSchemaFromDescription(
        description,
        apiKey,
        (partial) => setStreamText(partial)
      );
      setStatus('success');
      setTimeout(() => {
        onGenerate(result.schemaName, result.parameters);
        onClose();
      }, 600);
    } catch (e: any) {
      setStatus('error');
      setError(
        e?.message?.includes('API_KEY_INVALID') || e?.message?.includes('401')
          ? 'Invalid API key. Please check and try again.'
          : e?.message || 'Something went wrong. Please try again.'
      );
    }
  };

  const examples = [
    'A user profile with name, email, age, bio, and optional avatar URL',
    'A product listing with title, price, category, stock quantity, and list of tags',
    'An order object with order ID, customer info, list of items, shipping address, and status',
  ];

  const bg = theme === 'dark' ? 'rgba(9,9,11,0.97)' : 'rgba(255,255,255,0.97)';
  const panelBg = theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const inputBg = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const accentRgb = 'var(--accent-primary)';

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{
        width: '100%', maxWidth: '640px',
        backgroundColor: bg,
        border: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column',
        maxHeight: '90vh', overflow: 'hidden',
        boxShadow: '0 40px 120px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: panelBg,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 36, height: 36,
              backgroundColor: accentRgb,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--bg-primary)', flexShrink: 0,
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.03em' }}>
                AI SCHEMA GENERATOR
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Powered by Gemini 2.0 Flash
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid var(--border-color)',
            width: 36, height: 36, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* API Key Section */}
          <div style={{
            border: '1px solid var(--border-color)',
            backgroundColor: panelBg,
          }}>
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              style={{
                width: '100%', padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--text-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Key size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                  GEMINI API KEY
                </span>
                {apiKey && !showKeyInput && (
                  <span style={{
                    fontSize: '0.7rem', padding: '2px 8px',
                    backgroundColor: '#16a34a22', color: '#16a34a',
                    border: '1px solid #16a34a44',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    ✓ SET
                  </span>
                )}
              </div>
              <ChevronRight size={14} style={{
                color: 'var(--text-muted)',
                transform: showKeyInput ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }} />
            </button>

            {showKeyInput && (
              <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '12px 0 8px' }}>
                  Get your free key at{' '}
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer"
                    style={{ color: accentRgb, textDecoration: 'none', fontWeight: 600 }}>
                    aistudio.google.com
                  </a>
                  {' '}— stored only in your browser.
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  style={{
                    width: '100%', padding: '10px 14px',
                    backgroundColor: inputBg,
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}
          </div>

          {/* Description Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              Describe your schema
            </label>
            <textarea
              ref={textareaRef}
              value={description}
              onChange={e => setDescription(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
              }}
              placeholder="e.g. A movie review with title, rating (1-10), genre, reviewer name, and optional spoiler text..."
              rows={4}
              style={{
                width: '100%', padding: '14px 16px',
                backgroundColor: inputBg,
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.95rem', lineHeight: 1.6,
                resize: 'vertical', boxSizing: 'border-box',
                outline: 'none',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Tip: Be specific about field types, constraints, and which are required. Press Ctrl+Enter to generate.
            </div>
          </div>

          {/* Examples */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Quick Examples
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setDescription(ex)}
                  style={{
                    textAlign: 'left', padding: '10px 14px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: '0.85rem',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <ChevronRight size={12} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {status === 'error' && (
            <div style={{
              padding: '14px 16px',
              backgroundColor: '#ef444420',
              border: '1px solid #ef4444',
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              color: '#ef4444', fontSize: '0.85rem',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          {/* Stream preview */}
          {status === 'loading' && streamText && (
            <div style={{
              padding: '14px', backgroundColor: panelBg,
              border: '1px solid var(--border-color)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.75rem', color: 'var(--text-muted)',
              maxHeight: '120px', overflowY: 'auto',
              lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            }}>
              {streamText}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex', gap: '12px', justifyContent: 'flex-end',
          backgroundColor: panelBg,
        }}>
          <button
            onClick={onClose}
            className="btn-outline"
            style={{ height: 40, padding: '0 20px' }}
          >
            CANCEL
          </button>
          <button
            onClick={handleGenerate}
            disabled={status === 'loading' || !description.trim()}
            style={{
              height: 40, padding: '0 28px',
              backgroundColor: status === 'success' ? '#16a34a' : 'var(--accent-primary)',
              color: 'var(--bg-primary)',
              border: 'none', cursor: status === 'loading' ? 'wait' : 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700, fontSize: '0.8rem',
              letterSpacing: '0.08em',
              display: 'flex', alignItems: 'center', gap: '10px',
              transition: 'all 0.2s', opacity: (!description.trim() && status !== 'loading') ? 0.5 : 1,
            }}
          >
            {status === 'loading' && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            {status === 'success' && <CheckCircle2 size={16} />}
            {status === 'idle' && <Sparkles size={16} />}
            {status === 'idle' && 'GENERATE'}
            {status === 'loading' && 'GENERATING...'}
            {status === 'success' && 'DONE!'}
            {status === 'error' && 'RETRY'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
