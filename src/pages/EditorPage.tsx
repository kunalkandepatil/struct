import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Moon, Sun, Download, Copy, CheckSquare, Plus, FileJson, Trash2, PanelLeft } from 'lucide-react';
import { Editor } from '../components/Editor';
import { type Parameter } from '../types';

const THEME_COLORS = [
  { name: 'Orange', value: '#f97316' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Red', value: '#ef4444' },
];

interface EditorPageProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
}

export function EditorPage({ theme, toggleTheme, themeColor, setThemeColor }: EditorPageProps) {
  const [previewWidth, setPreviewWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [schemaName, setSchemaName] = useState('my_schema');
  const [schemaStrict, setSchemaStrict] = useState(true);

  const { schemaId: urlSchemaId } = useParams<{ schemaId: string }>();
  const navigate = useNavigate();

  const [history, setHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('struct_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  });

  // true when on /editor (no UUID in URL) — "draft" mode
  const isDraft = !urlSchemaId;

  // Active schema is the one matching the URL param (if any)
  const activeSchemaId = !isDraft && history.find((s: any) => s.id === urlSchemaId)
    ? urlSchemaId!
    : '';

  // Load schema into local state when switching between saved schemas
  useEffect(() => {
    if (isDraft) {
      // Reset to blank draft state
      setParameters([]);
      setSchemaName('new_schema');
      setSchemaStrict(true);
      setProvider('gemini');
      return;
    }
    const active = history.find((s: any) => s.id === activeSchemaId);
    if (active) {
      setParameters(active.parameters);
      setSchemaName(active.name);
      setSchemaStrict(active.strict);
      setProvider(active.provider);
    }
  }, [activeSchemaId, isDraft]);

  // Sync edits back to history — only for committed schemas
  useEffect(() => {
    if (isDraft || !activeSchemaId) return;
    setHistory((prev: any[]) => prev.map((s: any) => {
      if (s.id === activeSchemaId) {
        return { ...s, name: schemaName, parameters, strict: schemaStrict, provider, lastModified: Date.now() };
      }
      return s;
    }));
  }, [parameters, schemaName, schemaStrict, provider]);

  // Persist ALL schemas to localStorage (schema remains even if params removed)
  useEffect(() => {
    localStorage.setItem('struct_history', JSON.stringify(history));
  }, [history]);

  // Commit draft: called when first param added or AI generates while on /editor
  const handleDraftCommit = (name: string, params: Parameter[]) => {
    const newId = crypto.randomUUID();
    const newSchema = { id: newId, name, parameters: params, strict: schemaStrict, provider, lastModified: Date.now() };
    setHistory((prev: any[]) => [newSchema, ...prev]);
    navigate(`/editor/${newId}`);
  };

  const [copied, setCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const activeColor = THEME_COLORS.find(c => c.value === themeColor) || THEME_COLORS[0];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const GithubIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = document.body.clientWidth - e.clientX;
      if (newWidth > 250 && newWidth < 800) {
        setPreviewWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const generateJsonSchema = (params: Parameter[], isRoot = true): any => {
    const schema: any = { type: 'object', properties: {}, required: [] };
    if (provider === 'openai') schema.additionalProperties = false;

    params.forEach((p, idx) => {
      const fallbackKey = `unnamed_field_${idx + 1}`;
      const safeKey = p.key || fallbackKey;
      let propSchema: any = { type: p.type };
      if (p.nullable) propSchema.nullable = true;

      if (p.type === 'object' && p.children) {
        propSchema = { ...propSchema, ...generateJsonSchema(p.children, false) };
        if (p.additionalProperties !== undefined) propSchema.additionalProperties = p.additionalProperties;
      } else if (p.type === 'object') {
        if (p.additionalProperties !== undefined) propSchema.additionalProperties = p.additionalProperties;
        else if (provider === 'openai') propSchema.additionalProperties = false;
      } else if (p.type === 'array') {
        propSchema.items = { type: p.itemType || 'string' };
        if (p.itemType === 'object' && provider === 'openai') propSchema.items.additionalProperties = false;
        if (p.minItems !== undefined && p.minItems !== '') propSchema.minItems = p.minItems;
        if (p.maxItems !== undefined && p.maxItems !== '') propSchema.maxItems = p.maxItems;
      }

      if (p.description) propSchema.description = p.description;
      if (p.enumOptions && (p.type === 'string' || p.type === 'number' || p.type === 'integer')) {
        let options: any[] = p.enumOptions.split(',').map(s => s.trim()).filter(s => s);
        if (p.type === 'number' || p.type === 'integer') options = options.map(s => Number(s)).filter(n => !isNaN(n));
        if (options.length > 0) propSchema.enum = options;
      }
      if (p.type === 'string' && p.format) propSchema.format = p.format;
      if (p.type === 'number' || p.type === 'integer') {
        if (p.minimum !== undefined && p.minimum !== '') propSchema.minimum = p.minimum;
        if (p.maximum !== undefined && p.maximum !== '') propSchema.maximum = p.maximum;
      }
      schema.properties[safeKey] = propSchema;
      if (p.required) schema.required.push(safeKey);
    });
    if (schema.required.length === 0) delete schema.required;
    if (isRoot && provider === 'openai') return { name: schemaName, strict: schemaStrict, schema: schema };
    return schema;
  };

  const schemaJson = generateJsonSchema(parameters);

  const SyntaxHighlighter = ({ content, isJson }: { content: any, isJson: boolean }) => {
    if (!isJson) return <div>{content}</div>;
    const jsonString = JSON.stringify(content, null, 2);
    const highlighted = jsonString.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) cls = 'json-key';
        else cls = 'json-string';
      } else if (/true|false/.test(match)) cls = 'json-boolean';
      else if (/null/.test(match)) cls = 'json-null';
      return `<span class="${cls}">${match}</span>`;
    });
    return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(schemaJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = JSON.stringify(schemaJson, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const createNewSchema = () => {
    navigate('/editor');
    if (isMobile) setIsSidebarOpen(false);
  };

  const deleteSchema = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter((s: any) => s.id !== id);
    setHistory(newHistory);
    if (activeSchemaId === id) {
      if (newHistory.length > 0) {
        navigate(`/editor/${newHistory[0].id}`, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>

      {/* Sunlight Glow from top (Editor) */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute',
          top: '-200px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100vw',
          maxWidth: '1200px',
          height: '350px',
          background: 'var(--accent-primary)',
          filter: 'blur(140px)',
          opacity: theme === 'dark' ? 0.25 : 0.15,
          transition: 'background 0.3s, opacity 0.3s'
        }} />
      </div>

      <header className="header" style={{ 
        flexShrink: 0, position: 'relative', zIndex: 10, 
        backgroundColor: 'transparent', backdropFilter: 'blur(12px)',
        borderTop: themeColor ? '2px solid var(--accent-primary)' : 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="icon-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ 
            width: '36px', height: '36px', backgroundColor: isSidebarOpen ? 'var(--bg-secondary)' : 'transparent',
            border: '1px solid var(--border-color)', color: isSidebarOpen ? 'var(--accent-primary)' : 'var(--text-muted)'
          }}>
            <PanelLeft size={18} />
          </button>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: isMobile ? '0.75rem' : '0.9rem', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, letterSpacing: '0.05em' }}>
            <div style={{ width: 20, height: 20, backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-primary)', fontWeight: 'bold', fontSize: 10, borderRadius: '0px' }}>S</div>
            STRUCT
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button
              className="form-input"
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40px', width: '40px', cursor: 'pointer',
                backgroundColor: 'transparent', border: '1px solid var(--border-color)'
              }}
            >
              <div style={{
                width: '24px', height: '24px', flexShrink: 0,
                backgroundColor: activeColor.value || (theme === 'light' ? '#000000' : '#ffffff')
              }} />
            </button>

            {isThemeDropdownOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'row', gap: '8px', padding: '8px', zIndex: 50,
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
              }}>
                {THEME_COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => { setThemeColor(c.value); setIsThemeDropdownOpen(false); }}
                    title={c.name}
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      width: '28px', height: '28px', border: 'none',
                      backgroundColor: c.value || (theme === 'light' ? '#000000' : '#ffffff'),
                      cursor: 'pointer', opacity: activeColor.value === c.value ? 1 : 0.6,
                      transition: 'opacity 0.2s, transform 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ))}
              </div>
            )}
          </div>
          <button style={{ 
            background: 'transparent', border: '1px solid var(--border-color)', 
            width: '40px', height: '40px', color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }} onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer"
            style={{ 
              display: 'flex', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'none',
              fontSize: '0.8rem', fontWeight: 600, transition: 'color 0.2s', marginLeft: '8px'
            }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <GithubIcon /> 
          </a>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {isMobile && isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90 }} />}
        
        <aside style={{ 
          width: isSidebarOpen ? (isMobile ? '85%' : '260px') : '0px', position: isMobile ? 'absolute' : 'relative',
          top: 0, bottom: 0, left: 0, zIndex: 100, 
          backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(20px)',
          borderRight: isSidebarOpen ? '1px solid var(--border-color)' : 'none', display: 'flex',
          flexDirection: 'column', flexShrink: 0, overflow: 'hidden', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), border 0.3s'
        }}>
          <div style={{ minWidth: isMobile ? '85vw' : '260px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <button className="btn-outline" onClick={createNewSchema} style={{ width: '100%', borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Plus size={16} /> NEW SCHEMA
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '12px', padding: '0 8px', letterSpacing: '0.05em' }}>SAVED SCHEMAS</div>
              {history.map((s: any) => (
                <div key={s.id} onClick={() => { navigate(`/editor/${s.id}`); if (isMobile) setIsSidebarOpen(false); }} style={{
                  padding: '10px 12px', marginBottom: '4px', cursor: 'pointer',
                  backgroundColor: activeSchemaId === s.id ? 'rgba(var(--accent-primary-rgb, 255, 255, 255), 0.1)' : 'transparent',
                  border: activeSchemaId === s.id ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <FileJson size={14} style={{ flexShrink: 0, color: activeSchemaId === s.id ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'JetBrains Mono', monospace", color: activeSchemaId === s.id ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.name || 'unnamed'}</span>
                  </div>
                  <button className="icon-btn delete-schema-btn" onClick={(e) => deleteSchema(s.id, e)} style={{ padding: '4px', opacity: activeSchemaId === s.id ? 1 : 0 }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', overflow: 'hidden' }}>
          {isMobile && (
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'transparent', backdropFilter: 'blur(10px)' }}>
              <button onClick={() => setActiveTab('editor')} style={{ 
                flex: 1, padding: '16px', fontSize: '0.8rem', fontWeight: 600,
                color: activeTab === 'editor' ? 'var(--accent-primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'editor' ? '2px solid var(--accent-primary)' : 'none',
                backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                letterSpacing: '0.05em'
              }}>EDITOR</button>
              <button onClick={() => setActiveTab('preview')} style={{ 
                flex: 1, padding: '16px', fontSize: '0.8rem', fontWeight: 600,
                color: activeTab === 'preview' ? 'var(--accent-primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'preview' ? '2px solid var(--accent-primary)' : 'none',
                backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                letterSpacing: '0.05em'
              }}>PREVIEW</button>
            </div>
          )}

          <div style={{ flex: 1, display: (isMobile && activeTab !== 'editor') ? 'none' : 'block', overflowY: 'auto' }}>
            <Editor
              parameters={parameters}
              onChange={setParameters}
              schemaName={schemaName}
              onSchemaNameChange={setSchemaName}
              schemaStrict={schemaStrict}
              onSchemaStrictChange={setSchemaStrict}
              theme={theme}
              isDraft={isDraft}
              onDraftCommit={handleDraftCommit}
            />
          </div>

          {!isMobile && <div className={`resizer ${isResizing ? 'active' : ''}`} onMouseDown={() => setIsResizing(true)} />}

          <div className="preview-panel" style={{ 
            width: isMobile ? '100%' : `${previewWidth}px`, 
            display: (isMobile && activeTab !== 'preview') ? 'none' : 'flex',
            backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-outline" style={{ height: '32px', padding: '0 12px', fontSize: '0.7rem', backgroundColor: provider === 'gemini' ? 'var(--accent-primary)' : 'transparent', color: provider === 'gemini' ? 'var(--bg-primary)' : 'var(--text-primary)', borderColor: provider === 'gemini' ? 'var(--accent-primary)' : 'var(--border-color)' }} onClick={() => setProvider('gemini')}>GEMINI</button>
                <button className="btn-outline" style={{ height: '32px', padding: '0 12px', fontSize: '0.7rem', backgroundColor: provider === 'openai' ? 'var(--accent-primary)' : 'transparent', color: provider === 'openai' ? 'var(--bg-primary)' : 'var(--text-primary)', borderColor: provider === 'openai' ? 'var(--accent-primary)' : 'var(--border-color)' }} onClick={() => setProvider('openai')}>OPENAI</button>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="icon-btn" onClick={handleCopy} title="Copy to clipboard">{copied ? <CheckSquare size={16} /> : <Copy size={16} />}</button>
                <button className="icon-btn" onClick={handleDownload} title={`Download JSON`}><Download size={16} /></button>
              </div>
            </div>
            <div className="preview-content" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', lineHeight: '1.5' }}>
              <SyntaxHighlighter content={schemaJson} isJson={true} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
