import React, { useState, useEffect } from 'react';
import { Moon, Sun, Sparkles, Terminal, ChevronRight, ArrowRight, Loader2, Users, ShieldCheck, Clock, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const THEME_COLORS = [
  { name: 'Orange', value: '#f97316' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Red', value: '#ef4444' },
];

interface HomeProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
}

export function Home({ theme, toggleTheme, themeColor, setThemeColor }: HomeProps) {
  const navigate = useNavigate();

  // Live Playground State
  const [demoKey, setDemoKey] = useState('user_query');
  const [demoType, setDemoType] = useState('string');
  const [demoReq, setDemoReq] = useState(true);

  // AI Playground State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Discord State
  const [discordData, setDiscordData] = useState<{ members: number, online: number } | null>(null);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  useEffect(() => {
    const fetchDiscordData = async () => {
      try {
        const res = await fetch('https://discord.com/api/v9/invites/W8wTjESM3t?with_counts=true');
        const data = await res.json();
        if (data.approximate_member_count) {
          setDiscordData({
            members: data.approximate_member_count,
            online: data.approximate_presence_count
          });
        }
      } catch (e) {
        console.error('Failed to fetch discord data', e);
      }
    };
    fetchDiscordData();
  }, []);

  // Terminal Simulation
  useEffect(() => {
    const lines = [
      '> unburn --version',
      'unburn-community v1.0.4',
      '> unburn --info',
      'status: active',
      'mission: "space for creative developers"',
      '> unburn --stats',
      'fetching real-time data...',
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < lines.length) {
        const nextLine = lines[current];
        if (nextLine) {
          setTerminalLines(prev => [...prev, nextLine]);
        }
        current++;
      } else {
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const aiExamples = [
    {
      prompt: 'A user profile with name, email, age, and bio.',
      schema: {
        schemaName: 'user_profile',
        parameters: [
          { key: 'name', type: 'string', required: true, description: 'User\'s full name' },
          { key: 'email', type: 'string', required: true, description: 'Valid email address' },
          { key: 'age', type: 'integer', required: false, description: 'Age in years' },
          { key: 'bio', type: 'string', required: false, description: 'Short biography' }
        ]
      }
    },
    {
      prompt: 'Product listing with title, price, and category.',
      schema: {
        schemaName: 'product',
        parameters: [
          { key: 'title', type: 'string', required: true, description: 'Product title' },
          { key: 'price', type: 'number', required: true, description: 'Price in USD' },
          { key: 'category', type: 'string', required: true, enumOptions: 'Electronics, Clothing, Home' }
        ]
      }
    }
  ];

  const handleFakeGenerate = () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setAiResult(null);

    // Simulate 2s delay
    setTimeout(() => {
      const match = aiExamples.find(ex => ex.prompt === aiPrompt) || aiExamples[0];
      setAiResult(match.schema);
      setIsGenerating(false);
    }, 2000);
  };


  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const GithubIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );

  const activeColor = THEME_COLORS.find(c => c.value === themeColor) || THEME_COLORS[0];

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* Background Effects Wrapper (fixed to avoid scroll issues) */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {/* Sunlight Glow from top */}
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

      {/* Navigation */}
      <nav style={{
        height: '64px',
        padding: isMobile ? '0 16px' : '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        borderTop: themeColor ? '2px solid var(--accent-primary)' : 'none',
        backgroundColor: 'transparent',
        backdropFilter: 'blur(12px)',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
          <div style={{ width: 24, height: 24, backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-primary)', fontSize: '0.65rem', borderRadius: '0px' }}>S</div>
          STRUCT
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
            href="https://github.com/kunalkandepatil/struct"
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
      </nav>

      {/* Hero Section */}
      <main style={{
        flex: 1,
        padding: isMobile ? '120px 20px 80px' : '180px 40px 120px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
        zIndex: 5
      }}>


        <h1 style={{
          fontSize: isMobile ? '2.5rem' : 'clamp(3rem, 8vw, 5.5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.04em',
          marginBottom: '24px',
          fontFamily: "'Inter', sans-serif"
        }}>
          Design schemas. <br />
          <span style={{
            background: `linear-gradient(135deg, color-mix(in srgb, var(--accent-primary), white 30%) 0%, color-mix(in srgb, var(--accent-primary), black 40%) 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Generate instantly.
          </span>
        </h1>

        <p style={{
          fontSize: isMobile ? '1.1rem' : '1.3rem',
          color: 'var(--text-secondary)',
          maxWidth: '700px',
          margin: '0 auto 56px',
          lineHeight: 1.6,
          fontWeight: 450
        }}>
          Build complex schemas visually, validate them in real-time, and export directly to JSON.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '16px',
          justifyContent: 'center',
          marginBottom: isMobile ? '60px' : '80px',
          padding: isMobile ? '0 20px' : '0'
        }}>
          <button
            onClick={() => navigate('/editor')}
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              border: 'none',
              padding: '0 32px',
              height: '56px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.1)'; }}
          >
            Start Building <ArrowRight size={16} />
          </button>
          <button
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              padding: '0 32px',
              height: '56px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => document.getElementById('interactive-demo')?.scrollIntoView({ behavior: 'smooth' })}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Try Interactive Demo
          </button>
        </div>

        {/* Live Playground - True Interactivity */}
        <div id="interactive-demo" style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(32px)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.15)',
          maxWidth: '1000px',
          margin: '0 auto 80px',
          textAlign: 'left'
        }}>
          {/* Mac window header */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'transparent', gap: '8px' }}>
            <div style={{ width: 12, height: 12, backgroundColor: '#ff5f56' }} />
            <div style={{ width: 12, height: 12, backgroundColor: '#ffbd2e' }} />
            <div style={{ width: 12, height: 12, backgroundColor: '#27c93f' }} />
            <div style={{ margin: '0 auto', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
              LIVE PLAYGROUND
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {/* Control Panel (Real Inputs) */}
            <div style={{ flex: '1 1 300px', padding: isMobile ? '20px' : '32px', borderRight: isMobile ? 'none' : '1px solid var(--border-color)', borderBottom: isMobile ? '1px solid var(--border-color)' : 'none', backgroundColor: 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                <Terminal size={18} /> Interactive Controls
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                Type below and watch the JSON schema generate instantly.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Field Key</label>
                  <input
                    type="text"
                    value={demoKey}
                    onChange={e => setDemoKey(e.target.value)}
                    style={{
                      width: '100%', height: '40px', padding: '0 12px',
                      border: '1px solid var(--border-color)', backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem'
                    }}
                    placeholder="e.g. user_query"
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Type</label>
                    <select
                      value={demoType}
                      onChange={e => setDemoType(e.target.value)}
                      style={{
                        width: '100%', height: '40px', padding: '0 12px',
                        border: '1px solid var(--border-color)', backgroundColor: theme === 'dark' ? 'var(--bg-secondary)' : 'rgba(0,0,0,0.05)',
                        color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem',
                        appearance: 'none', cursor: 'pointer'
                      }}
                    >
                      <option value="string" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>string</option>
                      <option value="number" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>number</option>
                      <option value="boolean" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>boolean</option>
                      <option value="array" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>array</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Required</label>
                    <button
                      onClick={() => setDemoReq(!demoReq)}
                      style={{
                        height: '40px', width: '60px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: demoReq ? 'var(--accent-primary)' : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                        color: demoReq ? 'var(--bg-primary)' : 'var(--text-primary)',
                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      {demoReq ? 'YES' : 'NO'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Output */}
            <div style={{ flex: '1 1 400px', backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.85)', padding: isMobile ? '24px' : '32px', color: '#e5e5e5', display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
              <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '16px', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Generated JSON Schema</div>
              <pre style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: isMobile ? '0.75rem' : '0.85rem', lineHeight: 1.6,
                backgroundColor: 'transparent', padding: 0, margin: 0, overflowX: 'auto'
              }}>
                <span style={{ color: '#569CD6' }}>{`{`}</span><br />
                {'  '}<span style={{ color: '#9CDCFE' }}>"type"</span>: <span style={{ color: '#CE9178' }}>"object"</span>,<br />
                {'  '}<span style={{ color: '#9CDCFE' }}>"properties"</span>: <span style={{ color: '#569CD6' }}>{`{`}</span><br />
                {'    '}<span style={{ color: '#9CDCFE' }}>"{demoKey || 'unnamed'}"</span>: <span style={{ color: '#569CD6' }}>{`{`}</span><br />
                {'      '}<span style={{ color: '#9CDCFE' }}>"type"</span>: <span style={{ color: '#CE9178' }}>"{demoType}"</span><br />
                {'    '}<span style={{ color: '#569CD6' }}>{`}`}</span><br />
                {'  '}<span style={{ color: '#569CD6' }}>{`}`}</span>{demoReq ? ',' : ''}<br />
                {demoReq && (
                  <>
                    {'  '}<span style={{ color: '#9CDCFE' }}>"required"</span>: <span style={{ color: '#569CD6' }}>[</span><br />
                    {'    '}<span style={{ color: '#CE9178' }}>"{demoKey || 'unnamed'}"</span><br />
                    {'  '}<span style={{ color: '#569CD6' }}>]</span><br />
                  </>
                )}
                <span style={{ color: '#569CD6' }}>{`}`}</span>
              </pre>
            </div>
          </div>
        </div>

        {/* AI Playground - Faked Generation Demo */}
        <div id="ai-playground" style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(32px)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.15)',
          maxWidth: '1000px',
          margin: '0 auto 120px',
          textAlign: 'left'
        }}>
          {/* Mac window header */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'transparent', gap: '8px' }}>
            <div style={{ width: 12, height: 12, backgroundColor: '#ff5f56' }} />
            <div style={{ width: 12, height: 12, backgroundColor: '#ffbd2e' }} />
            <div style={{ width: 12, height: 12, backgroundColor: '#27c93f' }} />
            <div style={{ margin: '0 auto', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
              AI SCHEMA GENERATOR (DEMO)
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {/* Control Panel */}
            <div style={{ flex: '1 1 300px', padding: isMobile ? '20px' : '32px', borderRight: isMobile ? 'none' : '1px solid var(--border-color)', borderBottom: isMobile ? '1px solid var(--border-color)' : 'none', backgroundColor: 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                <Sparkles size={18} /> Intelligent Generation
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                Describe your requirements and watch AI build the structure.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Describe your schema</label>
                  <textarea
                    value={aiPrompt}
                    readOnly={true}
                    style={{
                      width: '100%', height: '80px', padding: '12px',
                      border: '1px solid var(--border-color)', backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                      color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem',
                      resize: 'none', marginBottom: '12px', outline: 'none',
                      cursor: 'default'
                    }}
                    placeholder="Select an example below to see it in action..."
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '4px' }}>SELECT AN EXAMPLE</div>
                    {aiExamples.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => setAiPrompt(ex.prompt)}
                        style={{
                          textAlign: 'left', padding: '8px 12px', fontSize: '0.75rem',
                          backgroundColor: 'transparent', border: '1px solid var(--border-color)',
                          color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                      >
                        <ChevronRight size={12} style={{ color: 'var(--accent-primary)' }} />
                        {ex.prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleFakeGenerate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  style={{
                    width: '100%', height: '44px',
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--bg-primary)',
                    border: 'none', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    opacity: isGenerating || !aiPrompt.trim() ? 0.6 : 1,
                    fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em'
                  }}
                >
                  {isGenerating ? <Loader2 size={18} style={{ animation: 'spin 2s linear infinite' }} /> : <Sparkles size={18} />}
                  {isGenerating ? 'GENERATING...' : 'GENERATE SCHEMA'}
                </button>
              </div>
            </div>

            {/* Generated Output */}
            <div style={{ flex: '1 1 400px', backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.85)', padding: isMobile ? '24px' : '32px', color: '#e5e5e5', display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
              <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '16px', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isGenerating ? 'AI IS THINKING...' : (aiResult ? 'GENERATED SUCCESSFULLY' : 'AWAITING INPUT')}
              </div>

              <div style={{ flex: 1, overflow: 'auto' }}>
                {isGenerating ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ height: '20px', width: '80%', backgroundColor: 'rgba(255,255,255,0.1)', animation: 'pulse 1.5s infinite' }} />
                    <div style={{ height: '20px', width: '60%', backgroundColor: 'rgba(255,255,255,0.1)', animation: 'pulse 1.5s infinite' }} />
                    <div style={{ height: '20px', width: '90%', backgroundColor: 'rgba(255,255,255,0.1)', animation: 'pulse 1.5s infinite' }} />
                  </div>
                ) : aiResult ? (
                  <pre style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: isMobile ? '0.75rem' : '0.85rem', lineHeight: 1.6,
                    backgroundColor: 'transparent', padding: 0, margin: 0
                  }}>
                    <span style={{ color: '#569CD6' }}>{`{`}</span><br />
                    {'  '}<span style={{ color: '#9CDCFE' }}>"schemaName"</span>: <span style={{ color: '#CE9178' }}>"{aiResult.schemaName}"</span>,<br />
                    {'  '}<span style={{ color: '#9CDCFE' }}>"parameters"</span>: <span style={{ color: '#569CD6' }}>[</span><br />
                    {aiResult.parameters.map((p: any, idx: number) => (
                      <React.Fragment key={idx}>
                        {'    '}<span style={{ color: '#569CD6' }}>{`{`}</span><br />
                        {'      '}<span style={{ color: '#9CDCFE' }}>"key"</span>: <span style={{ color: '#CE9178' }}>"{p.key}"</span>,<br />
                        {'      '}<span style={{ color: '#9CDCFE' }}>"type"</span>: <span style={{ color: '#CE9178' }}>"{p.type}"</span>,<br />
                        {'      '}<span style={{ color: '#9CDCFE' }}>"required"</span>: <span style={{ color: '#569CD6' }}>{String(p.required)}</span><br />
                        {'    '}<span style={{ color: '#569CD6' }}>{`}`}</span>{idx < aiResult.parameters.length - 1 ? ',' : ''}<br />
                      </React.Fragment>
                    ))}
                    {'  '}<span style={{ color: '#569CD6' }}>]</span><br />
                    <span style={{ color: '#569CD6' }}>{`}`}</span>
                  </pre>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#555', gap: '16px' }}>
                    <Sparkles size={48} opacity={0.2} />
                    <p style={{ fontSize: '0.9rem' }}>Choose an example or type to start.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <style>{`
            @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
        </div>

        {/* Feature Highlights Grid */}
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto 120px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: '24px'
        }}>
          {[
            {
              icon: <Clock size={20} />,
              title: 'LOCAL HISTORY',
              desc: 'All your schemas are stored safely in your browser. No database, no tracking—just pure privacy.'
            },
            {
              icon: <Sparkles size={20} />,
              title: 'DYNAMIC THEMES',
              desc: 'Personalize your workspace with 5+ premium accent colors designed to match your setup.'
            },
            {
              icon: <Sun size={20} />,
              title: 'ADAPTIVE MODES',
              desc: 'Seamlessly switch between Dark and Light modes. Every component is optimized for visibility.'
            },
            {
              icon: <Download size={20} />,
              title: 'INSTANT EXPORT',
              desc: 'Ready to code? Export your schema as JSON with a single click.'
            }
          ].map((f, i) => (
            <div key={i} style={{
              padding: '32px',
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.4)',
              backdropFilter: 'blur(32px)',
              border: '1px solid var(--border-color)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800, fontSize: '0.85rem', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
                {f.icon} {f.title}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
        {/* Community Hub Block */}
        <div id="community-hub" style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(32px)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.15)',
          maxWidth: '1000px',
          margin: '0 auto 120px',
          textAlign: 'left'
        }}>
          {/* Mac window header */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'transparent', gap: '8px' }}>
            <div style={{ width: 12, height: 12, backgroundColor: '#ff5f56' }} />
            <div style={{ width: 12, height: 12, backgroundColor: '#ffbd2e' }} />
            <div style={{ width: 12, height: 12, backgroundColor: '#27c93f' }} />
            <div style={{ margin: '0 auto', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
              COMMUNITY HUB
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {/* Discord Info */}
            <div style={{ flex: '1 1 350px', padding: isMobile ? '24px' : '48px', borderRight: isMobile ? 'none' : '1px solid var(--border-color)', borderBottom: isMobile ? '1px solid var(--border-color)' : 'none', backgroundColor: 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--accent-primary)', fontWeight: 800, fontSize: '1.1rem' }}>
                Unburn Community
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                space for creative developers.
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
                Join the hub for creative builders. Share your schemas, get help with structured outputs, and connect with other AI developers.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <Users size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span>
                    <strong>{discordData ? discordData.online.toLocaleString() : '...'}</strong> members online
                    {discordData && <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>/ {discordData.members.toLocaleString()} total</span>}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span>Verified community of innovators</span>
                </div>
              </div>

              <a
                href="https://discord.gg/W8wTjESM3t"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  width: '100%', height: '44px',
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--bg-primary)',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                  fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.1)'; }}
              >
                JOIN COMMUNITY <ArrowRight size={18} />
              </a>
            </div>

            {/* Terminal Console Mockup */}
            <div style={{ flex: '1 1 450px', backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.85)', padding: isMobile ? '24px' : '40px', display: 'flex', flexDirection: 'column', minHeight: '400px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginBottom: '24px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                # Community_Terminal
              </div>

              <div style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#33ff33', lineHeight: 1.6, overflow: 'auto' }}>
                {terminalLines.map((line, i) => (
                  <div key={i} style={{
                    marginBottom: line?.startsWith('>') ? '4px' : '12px',
                    color: line?.startsWith('>') ? '#fff' : '#33ff33',
                    opacity: line?.startsWith('>') ? 0.9 : 0.7
                  }}>
                    {line}
                  </div>
                ))}
                {terminalLines.length >= 7 && discordData && (
                  <div style={{ color: '#5865F2', animation: 'fadeIn 0.5s ease forwards' }}>
                    [ONLINE] {discordData.online?.toLocaleString() || '0'}<br />
                    [TOTAL ] {discordData.members?.toLocaleString() || '0'}<br />
                    [READY ] connection_stable: true
                  </div>
                )}
                <div style={{ display: 'inline-block', width: '8px', height: '15px', backgroundColor: '#33ff33', marginLeft: '4px', verticalAlign: 'middle', animation: 'blink 1s step-end infinite' }} />
              </div>

              {/* Terminal scanline effect */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02))',
                backgroundSize: '100% 4px, 3px 100%',
                zIndex: 2
              }} />
            </div>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '80px 40px 40px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.02)',
        position: 'relative'
      }}>
        {/* Top Accent Line */}
        <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', width: '100px', height: '2px', backgroundColor: 'var(--accent-primary)' }} />
        
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '48px', marginBottom: '60px' }}>
            {/* Brand Column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', marginBottom: '20px' }}>
                <div style={{ width: 28, height: 28, backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-primary)', fontSize: '0.8rem', borderRadius: '0px' }}>S</div>
                STRUCT
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '300px' }}>
                The visual IDE for AI data structures. Build complex JSON schemas in seconds, validate instantly, and export to your agent.
              </p>
            </div>

            {/* Community Column */}
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>COMMUNITY</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="https://discord.gg/W8wTjESM3t" target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Discord Server</a>
                <a href="https://github.com/kunalkandepatil/struct" target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>GitHub Repo</a>
                <a href="https://x.com/kunalkandepatil" target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Twitter / X</a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ 
            paddingTop: '32px', 
            borderTop: '1px solid var(--border-color)', 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: '20px' 
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
              © 2026 STRUCT. ALL RIGHTS RESERVED.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Built by <a href="https://github.com/kunalkandepatil" target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>@kunalkandepatil</a>
              </div>
              <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-color)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e' }} />
                Systems Operational
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
