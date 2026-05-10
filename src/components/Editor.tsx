import React from 'react';
import { EditorNode } from './EditorNode';
import { type Parameter, createParameter } from '../types';
import { Sparkles, ChevronRight, Key, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateSchemaFromDescription } from '../services/geminiService';

interface EditorProps {
  parameters: Parameter[];
  onChange: (parameters: Parameter[]) => void;
  schemaName: string;
  onSchemaNameChange: (name: string) => void;
  schemaStrict: boolean;
  onSchemaStrictChange: (strict: boolean) => void;
  theme: 'light' | 'dark';
  isDraft?: boolean;
  onDraftCommit?: (name: string, params: Parameter[]) => void;
}

const EXAMPLES = [
  'A movie review with title, rating 1-10, genre, reviewer name, and optional spoiler text',
  'A user profile with name, email, age, bio, and optional avatar URL',
  'A product listing with title, price, category, stock quantity, and list of tags',
];

export const Editor = ({ 
  parameters, 
  onChange,
  schemaName,
  onSchemaNameChange,
  schemaStrict,
  onSchemaStrictChange,
  theme,
  isDraft = false,
  onDraftCommit,
}: EditorProps) => {
  const [isImporting, setIsImporting] = React.useState(false);
  const [importText, setImportText] = React.useState('');
  const [importError, setImportError] = React.useState<string | null>(null);

  // Inline AI state
  const [aiDescription, setAiDescription] = React.useState('');
  const [apiKey, setApiKey] = React.useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = React.useState(!localStorage.getItem('gemini_api_key'));
  const [aiStatus, setAiStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [aiError, setAiError] = React.useState('');

  const panelBg = theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

  const handleAIGenerate = async () => {
    if (!aiDescription.trim() || !apiKey.trim()) {
      if (!apiKey.trim()) setShowKeyInput(true);
      return;
    }
    setAiStatus('loading');
    setAiError('');
    try {
      localStorage.setItem('gemini_api_key', apiKey);
      const result = await generateSchemaFromDescription(aiDescription, apiKey);
      if (isDraft && onDraftCommit) {
        // Commit the draft atomically with name + params
        onDraftCommit(result.schemaName, result.parameters);
      } else {
        onSchemaNameChange(result.schemaName);
        onChange(result.parameters);
      }
      setAiStatus('success');
    } catch (e: any) {
      setAiStatus('error');
      setAiError(
        e?.message?.includes('API_KEY_INVALID') || e?.message?.includes('401')
          ? 'Invalid API key.'
          : e?.message || 'Generation failed. Try again.'
      );
    }
  };

  const parseJsonSchema = (schema: any): Parameter[] => {
    const parseProperties = (props: any, requiredList: string[] = []): Parameter[] => {
      const params: Parameter[] = [];
      for (const key in props) {
        const p = props[key];
        const param: Parameter = {
          id: crypto.randomUUID(),
          key: key,
          description: p.description || '',
          type: (p.type === 'integer' || p.type === 'number' || p.type === 'string' || p.type === 'boolean' || p.type === 'object' || p.type === 'array') ? p.type : 'string',
          required: requiredList.includes(key),
          nullable: p.nullable || (Array.isArray(p.type) && p.type.includes('null')) || false
        };
        
        if (Array.isArray(p.type)) {
          const t = p.type.find((t: string) => t !== 'null');
          if (t) param.type = t;
        }
        
        if (p.enum) {
          param.enumOptions = p.enum.join(', ');
          param.showAdvanced = true;
        }
        
        if (param.type === 'object') {
          if (p.properties) {
            param.children = parseProperties(p.properties, p.required || []);
          }
          if (p.additionalProperties !== undefined) {
            param.additionalProperties = p.additionalProperties;
            param.showAdvanced = true;
          }
        }
        
        if (param.type === 'array' && p.items) {
          param.itemType = p.items.type === 'integer' ? 'integer' : (p.items.type || 'string');
        }

        if (p.format !== undefined) { param.format = p.format; param.showAdvanced = true; }
        if (p.minimum !== undefined) { param.minimum = p.minimum; param.showAdvanced = true; }
        if (p.maximum !== undefined) { param.maximum = p.maximum; param.showAdvanced = true; }
        if (p.minItems !== undefined) { param.minItems = p.minItems; param.showAdvanced = true; }
        if (p.maxItems !== undefined) { param.maxItems = p.maxItems; param.showAdvanced = true; }

        params.push(param);
      }
      return params;
    };
    
    if (schema.type === 'object' && schema.properties) {
      return parseProperties(schema.properties, schema.required || []);
    }
    
    return [];
  };

  const handleImport = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importText);
      const newParams = parseJsonSchema(parsed);
      if (newParams.length > 0) {
        onChange(newParams);
        setIsImporting(false);
        setImportText('');
      } else {
        setImportError("Could not parse properties from this JSON schema.");
      }
    } catch (e) {
      setImportError("Invalid JSON format.");
    }
  };

  const handleAddParam = () => {
    const newParam = createParameter();
    if (isDraft && onDraftCommit) {
      // Committing draft with first manual param
      onDraftCommit('new_schema', [newParam]);
    } else {
      onChange([...parameters, newParam]);
    }
  };

  const handleRemoveParam = (id: string) => {
    onChange(parameters.filter(p => p.id !== id));
  };

  const handleUpdateParam = (id: string, updates: Partial<Parameter>) => {
    onChange(parameters.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deepUpdate = (params: Parameter[], parentId: string, childId: string, updates: Partial<Parameter>): Parameter[] => {
    return params.map(p => {
      if (p.id === parentId && p.children) {
        return { ...p, children: p.children.map(c => c.id === childId ? { ...c, ...updates } : c) };
      }
      if (p.children) return { ...p, children: deepUpdate(p.children, parentId, childId, updates) };
      return p;
    });
  };

  const deepAdd = (params: Parameter[], parentId: string, child: Parameter): Parameter[] => {
    return params.map(p => {
      if (p.id === parentId) return { ...p, children: [...(p.children || []), child] };
      if (p.children) return { ...p, children: deepAdd(p.children, parentId, child) };
      return p;
    });
  };

  const deepRemove = (params: Parameter[], parentId: string, childId: string): Parameter[] => {
    return params.map(p => {
      if (p.id === parentId && p.children) return { ...p, children: p.children.filter(c => c.id !== childId) };
      if (p.children) return { ...p, children: deepRemove(p.children, parentId, childId) };
      return p;
    });
  };

  const handleUpdateChild = (parentId: string, childId: string, updates: Partial<Parameter>) => {
    onChange(deepUpdate(parameters, parentId, childId, updates));
  };

  const handleAddChild = (parentId: string, child: Parameter) => {
    onChange(deepAdd(parameters, parentId, child));
  };

  const handleRemoveChild = (parentId: string, childId: string) => {
    onChange(deepRemove(parameters, parentId, childId));
  };

  const deepMove = (params: Parameter[], id: string, direction: 'up' | 'down'): Parameter[] => {
    const index = params.findIndex(p => p.id === id);
    if (index !== -1) {
      if (direction === 'up' && index > 0) {
        const newParams = [...params];
        [newParams[index - 1], newParams[index]] = [newParams[index], newParams[index - 1]];
        return newParams;
      }
      if (direction === 'down' && index < params.length - 1) {
        const newParams = [...params];
        [newParams[index + 1], newParams[index]] = [newParams[index], newParams[index + 1]];
        return newParams;
      }
      return params;
    }
    return params.map(p => {
      if (p.children) return { ...p, children: deepMove(p.children, id, direction) };
      return p;
    });
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    onChange(deepMove(parameters, id, direction));
  };

  return (
    <div className="editor-area">
      <div className="parameters-header">
        <div className="parameters-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <path d="M3 9h18M9 21V9"></path>
          </svg>
          SCHEMA DEFINITION
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn-outline" onClick={() => setIsImporting(!isImporting)} style={{ borderStyle: 'dashed', flex: '1 1 auto' }}>
            IMPORT SCHEMA
          </button>
          <button className="btn-outline" onClick={handleAddParam} style={{ flex: '1 1 auto' }}>
            ADD_PARAM
          </button>
        </div>
      </div>

      {/* Global Schema Settings */}
      <div className="param-block" style={{ marginBottom: '24px' }}>
        <div className="param-header">
          <div className="param-title-group">
            <span className="param-number">SET</span>
            <span className="param-name">GLOBAL_SCHEMA_SETTINGS</span>
          </div>
          <div className="param-actions">
            <div className="req-checkbox-header" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => onSchemaStrictChange(!schemaStrict)}>
              <button
                type="button"
                style={{
                  width: '28px', height: '16px', padding: '2px', cursor: 'pointer',
                  backgroundColor: schemaStrict ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  border: '1px solid', borderColor: schemaStrict ? 'var(--accent-primary)' : 'var(--border-color)',
                  display: 'flex', alignItems: 'center'
                }}
              >
                <div style={{
                  width: '10px', height: '10px', backgroundColor: schemaStrict ? 'var(--bg-primary)' : 'var(--text-muted)',
                  transform: schemaStrict ? 'translateX(12px)' : 'translateX(0)', transition: 'transform 0.15s ease-in-out'
                }} />
              </button>
              <span className="req-label" style={{ fontSize: '0.75rem', margin: 0, userSelect: 'none' }}>STRICT</span>
            </div>
          </div>
        </div>

        <div className="param-body" style={{ backgroundColor: 'transparent' }}>
          <div className="form-group">
            <label className="form-label">SCHEMA NAME</label>
            <input 
              type="text" 
              className="form-input" 
              value={schemaName} 
              onChange={e => onSchemaNameChange(e.target.value)} 
              placeholder="e.g. math_response"
              style={{ borderColor: 'var(--accent-primary)', backgroundColor: 'rgba(var(--accent-primary-rgb), 0.05)' }}
            />
          </div>
        </div>
      </div>

      {/* Import Panel */}
      {isImporting && (
        <div className="param-block" style={{ padding: '32px', backgroundColor: 'var(--bg-secondary)', marginBottom: '32px' }}>
          <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>PASTE JSON SCHEMA</label>
          <textarea 
            className="form-input" 
            rows={8} 
            value={importText} 
            onChange={(e) => setImportText(e.target.value)}
            placeholder='{ "type": "object", "properties": { ... } }'
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', resize: 'vertical', marginBottom: '8px' }}
          />
          {importError && (
            <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {importError}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button className="btn-outline" onClick={() => { setIsImporting(false); setImportError(null); }} style={{ borderStyle: 'dashed' }}>CANCEL</button>
            <button className="btn-outline" onClick={handleImport} style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>PARSE JSON</button>
          </div>
        </div>
      )}

      {/* Inline AI Generate — shown only in draft mode */}
      {isDraft && !isImporting && (
        <div className="param-block" style={{ marginBottom: '24px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', gap: '12px',
            backgroundColor: panelBg,
          }}>
            <div style={{
              width: 28, height: 28,
              backgroundColor: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--bg-primary)', flexShrink: 0,
            }}>
              <Sparkles size={14} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
                STRUCT AI GENERATOR
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Describe your schema in plain English
              </div>
            </div>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* API Key */}
            <div style={{ border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                style={{
                  width: '100%', padding: '10px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={13} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>GEMINI API KEY</span>
                  {apiKey && !showKeyInput && (
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', backgroundColor: '#16a34a22', color: '#16a34a', border: '1px solid #16a34a44' }}>✓ SET</span>
                  )}
                </div>
                <ChevronRight size={13} style={{ color: 'var(--text-muted)', transform: showKeyInput ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {showKeyInput && (
                <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '10px 0 8px' }}>
                    Get a free key at{' '}
                    <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
                      aistudio.google.com
                    </a>
                    {' '}— stored locally only.
                  </div>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="form-input"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' }}
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="form-label">DESCRIBE YOUR SCHEMA</label>
              <textarea
                value={aiDescription}
                onChange={e => setAiDescription(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAIGenerate(); }}
                placeholder="e.g. A movie review with title, rating 1-10, genre, and reviewer name..."
                rows={3}
                className="form-input"
                style={{ resize: 'vertical', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', lineHeight: 1.6 }}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ctrl+Enter to generate</div>
            </div>

            {/* Quick examples */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="form-label">QUICK EXAMPLES</div>
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setAiDescription(ex)}
                  style={{
                    textAlign: 'left', padding: '8px 12px',
                    backgroundColor: 'transparent', border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem',
                    display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <ChevronRight size={11} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  {ex}
                </button>
              ))}
            </div>

            {/* Error */}
            {aiStatus === 'error' && (
              <div style={{ padding: '12px 14px', backgroundColor: '#ef444420', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '0.83rem' }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {aiError}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleAddParam}
                className="btn-outline"
                style={{ flex: 1, borderStyle: 'dashed' }}
              >
                ADD PARAM MANUALLY
              </button>
              <button
                onClick={handleAIGenerate}
                disabled={aiStatus === 'loading' || !aiDescription.trim()}
                style={{
                  flex: 2, height: 40,
                  backgroundColor: aiStatus === 'success' ? '#16a34a' : 'var(--accent-primary)',
                  color: 'var(--bg-primary)', border: 'none',
                  cursor: aiStatus === 'loading' ? 'wait' : 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.08em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: !aiDescription.trim() && aiStatus !== 'loading' ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {aiStatus === 'loading' && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
                {aiStatus === 'success' && <CheckCircle2 size={15} />}
                {aiStatus === 'idle' && <Sparkles size={15} />}
                {aiStatus === 'idle' ? 'GENERATE WITH AI' : aiStatus === 'loading' ? 'GENERATING...' : aiStatus === 'success' ? 'DONE!' : 'RETRY'}
              </button>
            </div>
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Parameters List */}
      <div className="parameters-list">
        {parameters.map((param, index) => (
          <EditorNode
            key={param.id}
            param={param}
            index={index}
            onUpdate={handleUpdateParam}
            onRemove={handleRemoveParam}
            onAddChild={handleAddChild}
            onRemoveChild={handleRemoveChild}
            onUpdateChild={handleUpdateChild}
            onMove={handleMove}
          />
        ))}
      </div>
    </div>
  );
};
