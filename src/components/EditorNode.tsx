import { useState, useEffect } from 'react';
import { Trash2, ArrowUp, ArrowDown, Settings2 } from 'lucide-react';
import { type Parameter, type ParamType, createParameter } from '../types';

interface ParamBlockProps {
  param: Parameter;
  index: number;
  onUpdate: (id: string, updates: Partial<Parameter>) => void;
  onRemove: (id: string) => void;
  onAddChild: (parentId: string, child: Parameter) => void;
  onRemoveChild: (parentId: string, childId: string) => void;
  onUpdateChild: (parentId: string, childId: string, updates: Partial<Parameter>) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

export const EditorNode = ({
  param,
  index,
  onUpdate,
  onRemove,
  onAddChild,
  onRemoveChild,
  onUpdateChild,
  onMove
}: ParamBlockProps) => {
  const numPrefix = String(index + 1).padStart(2, '0');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="param-block">
      <div className="param-header" style={{ 
        flexDirection: isMobile ? 'column' : 'row', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        gap: isMobile ? '12px' : '0' 
      }}>
        <div className="param-title-group" style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
            <span className="param-number">{numPrefix}</span>
            <span className="param-name" style={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
              {param.key || 'NEW_PARAM'}
              {param.required && <span className="required-asterisk">*</span>}
            </span>
            <span className="param-type-badge">{param.type}</span>
          </div>
          {isMobile && (
            <button className="icon-btn" onClick={() => onRemove(param.id)} style={{ color: '#ef4444' }}>
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="param-actions" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '12px' : '16px', 
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          borderTop: isMobile ? '1px solid var(--border-color)' : 'none',
          paddingTop: isMobile ? '12px' : '0',
          marginTop: isMobile ? '4px' : '0'
        }}>
          <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px' }}>
            <div className="req-checkbox-header" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => onUpdate(param.id, { required: !param.required })}>
              <button
                type="button"
                style={{
                  width: '28px', height: '16px', padding: '2px', cursor: 'pointer',
                  backgroundColor: param.required ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  border: '1px solid', borderColor: param.required ? 'var(--accent-primary)' : 'var(--border-color)',
                  display: 'flex', alignItems: 'center'
                }}
              >
                <div style={{
                  width: '10px', height: '10px', backgroundColor: param.required ? 'var(--bg-primary)' : 'var(--text-muted)',
                  transform: param.required ? 'translateX(12px)' : 'translateX(0)', transition: 'transform 0.15s ease-in-out'
                }} />
              </button>
              <span className="req-label" style={{ fontSize: '0.7rem', margin: 0, userSelect: 'none' }}>REQ</span>
            </div>
            <div className="req-checkbox-header" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => onUpdate(param.id, { nullable: !param.nullable })}>
              <button
                type="button"
                style={{
                  width: '28px', height: '16px', padding: '2px', cursor: 'pointer',
                  backgroundColor: param.nullable ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  border: '1px solid', borderColor: param.nullable ? 'var(--accent-primary)' : 'var(--border-color)',
                  display: 'flex', alignItems: 'center'
                }}
              >
                <div style={{
                  width: '10px', height: '10px', backgroundColor: param.nullable ? 'var(--bg-primary)' : 'var(--text-muted)',
                  transform: param.nullable ? 'translateX(12px)' : 'translateX(0)', transition: 'transform 0.15s ease-in-out'
                }} />
              </button>
              <span className="req-label" style={{ fontSize: '0.7rem', margin: 0, userSelect: 'none' }}>NULL</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isMobile && <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />}
            <button className="icon-btn" onClick={() => onMove(param.id, 'up')} title="Move Up">
              <ArrowUp size={16} />
            </button>
            <button className="icon-btn" onClick={() => onMove(param.id, 'down')} title="Move Down">
              <ArrowDown size={16} />
            </button>
            {!isMobile && (
              <button className="icon-btn" onClick={() => onRemove(param.id)} title="Remove Parameter" style={{ color: '#ef4444' }}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="param-body">
        <div className="param-grid">
          <div className="form-group" style={{ gridColumn: '1 / 2' }}>
            <label className="form-label">Key <span className="required-asterisk">*</span></label>
            <input
              type="text"
              className="form-input"
              value={param.key}
              onChange={(e) => onUpdate(param.id, { key: e.target.value })}
              placeholder="e.g. genre"
            />
          </div>
          <div className="form-group" style={{ gridColumn: '2 / 3' }}>
            <label className="form-label">Type</label>
            <select
              className="form-input form-select"
              value={param.type}
              onChange={(e) => {
                const newType = e.target.value as ParamType;
                onUpdate(param.id, { 
                  type: newType,
                  children: newType === 'object' ? param.children || [] : undefined,
                  itemType: newType === 'array' ? param.itemType || 'string' : undefined
                });
              }}
            >
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="integer">integer</option>
              <option value="boolean">boolean</option>
              <option value="object">object</option>
              <option value="array">array</option>
            </select>
          </div>
        </div>

        <div className="param-row">
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              value={param.description || ''}
              onChange={(e) => onUpdate(param.id, { description: e.target.value })}
              placeholder="A detailed description of this property to guide the model..."
            />
          </div>
        </div>

        {param.type === 'array' && (
          <div className="param-row">
            <div className="form-group">
              <label className="form-label">Item Type</label>
              <select
                className="form-input form-select"
                value={param.itemType || 'string'}
                onChange={(e) => onUpdate(param.id, { itemType: e.target.value as ParamType })}
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="integer">integer</option>
                <option value="boolean">boolean</option>
                <option value="object">object</option>
              </select>
            </div>
          </div>
        )}

        {(param.type === 'string' || param.type === 'number' || param.type === 'integer' || param.type === 'array' || param.type === 'object') && (
          <div className="param-row" style={{ marginTop: '12px' }}>
            <button 
              onClick={() => onUpdate(param.id, { showAdvanced: !param.showAdvanced })}
              className="btn-outline" 
              style={{ fontSize: '0.75rem', padding: '10px', borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}
            >
              <Settings2 size={14} />
              {param.showAdvanced ? 'HIDE ADVANCED RULES' : 'ADVANCED RULES'}
            </button>
          </div>
        )}

        {param.showAdvanced && (param.type === 'string' || param.type === 'number' || param.type === 'integer' || param.type === 'array' || param.type === 'object') && (
          <div className="param-grid advanced-rules-container" style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-color)' }}>
            
            {(param.type === 'string' || param.type === 'number' || param.type === 'integer') && (() => {
              const enumValues = (param.enumOptions || '').split(',').map(s => s.trim()).filter(s => s);
              return (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Enum Options</label>
                  <div 
                    className="form-input" 
                    style={{ 
                      display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '6px 12px', 
                      minHeight: '40px', alignItems: 'center', cursor: 'text' 
                    }}
                    onClick={(e) => {
                      const target = e.currentTarget.querySelector('input');
                      if (target) target.focus();
                    }}
                  >
                    {enumValues.map((val, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          backgroundColor: 'var(--accent-primary)', 
                          color: 'var(--bg-primary)', 
                          padding: '4px 8px', 
                          fontSize: '0.75rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          fontFamily: "'JetBrains Mono', monospace"
                        }}
                      >
                        {val}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const newVals = [...enumValues];
                            newVals.splice(idx, 1);
                            onUpdate(param.id, { enumOptions: newVals.join(', ') });
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--bg-primary)', cursor: 'pointer', opacity: 0.7, padding: 0, fontSize: '1rem', lineHeight: 1 }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      placeholder={enumValues.length === 0 ? "Type option and press comma..." : ""}
                      style={{ 
                        border: 'none', background: 'transparent', outline: 'none', 
                        flex: 1, minWidth: '120px', color: 'var(--text-primary)', 
                        fontSize: '0.85rem', fontFamily: 'inherit' 
                      }}
                      onKeyDown={(e) => {
                        if (e.key === ',' || e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (val) {
                            const newVals = [...enumValues, val];
                            onUpdate(param.id, { enumOptions: newVals.join(', ') });
                            e.currentTarget.value = '';
                          }
                        } else if (e.key === 'Backspace' && e.currentTarget.value === '' && enumValues.length > 0) {
                          e.preventDefault();
                          const newVals = [...enumValues];
                          newVals.pop();
                          onUpdate(param.id, { enumOptions: newVals.join(', ') });
                        }
                      }}
                      onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (val) {
                          const newVals = [...enumValues, val];
                          onUpdate(param.id, { enumOptions: newVals.join(', ') });
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              );
            })()}

            {param.type === 'string' && (
              <div className="form-group">
                <label className="form-label">Format</label>
                <select className="form-input form-select" value={param.format || ''} onChange={(e) => onUpdate(param.id, { format: e.target.value as any })}>
                  <option value="">None</option>
                  <option value="date-time">date-time</option>
                  <option value="date">date</option>
                  <option value="time">time</option>
                </select>
              </div>
            )}

            {(param.type === 'number' || param.type === 'integer') && (
              <>
                <div className="form-group">
                  <label className="form-label">Minimum</label>
                  <input type="number" className="form-input" value={param.minimum ?? ''} onChange={(e) => onUpdate(param.id, { minimum: e.target.value === '' ? '' : parseFloat(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Maximum</label>
                  <input type="number" className="form-input" value={param.maximum ?? ''} onChange={(e) => onUpdate(param.id, { maximum: e.target.value === '' ? '' : parseFloat(e.target.value) })} />
                </div>
              </>
            )}

            {param.type === 'array' && (
              <>
                <div className="form-group">
                  <label className="form-label">Min Items</label>
                  <input type="number" className="form-input" value={param.minItems ?? ''} onChange={(e) => onUpdate(param.id, { minItems: e.target.value === '' ? '' : parseInt(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Items</label>
                  <input type="number" className="form-input" value={param.maxItems ?? ''} onChange={(e) => onUpdate(param.id, { maxItems: e.target.value === '' ? '' : parseInt(e.target.value) })} />
                </div>
              </>
            )}

            {param.type === 'object' && (
              <div className="form-group req-checkbox-header" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', gridColumn: '1 / -1', cursor: 'pointer' }} onClick={() => onUpdate(param.id, { additionalProperties: param.additionalProperties === false ? true : false })}>
                <button
                  type="button"
                  style={{
                    width: '32px', height: '18px', padding: '2px', cursor: 'pointer',
                    backgroundColor: param.additionalProperties !== false ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    border: '1px solid', borderColor: param.additionalProperties !== false ? 'var(--accent-primary)' : 'var(--border-color)',
                    display: 'flex', alignItems: 'center'
                  }}
                >
                  <div style={{
                    width: '12px', height: '12px', backgroundColor: param.additionalProperties !== false ? 'var(--bg-primary)' : 'var(--text-muted)',
                    transform: param.additionalProperties !== false ? 'translateX(14px)' : 'translateX(0)', transition: 'transform 0.15s ease-in-out'
                  }} />
                </button>
                <span className="req-label" style={{ fontSize: '0.8rem', margin: 0, textTransform: 'uppercase', userSelect: 'none' }}>Allow Additional Properties</span>
              </div>
            )}
          </div>
        )}

        {param.type === 'object' && (
          <div className="nested-params">
            <div className="parameters-header" style={{ marginBottom: 16, paddingTop: 8 }}>
              <span className="parameters-title">PROPERTIES</span>
              <button 
                className="btn-outline" 
                style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                onClick={() => onAddChild(param.id, createParameter())}
              >
                ADD_PROP
              </button>
            </div>
            
            {(param.children || []).map((child, childIdx) => (
              <EditorNode
                key={child.id}
                param={child}
                index={childIdx}
                onUpdate={(id, updates) => onUpdateChild(param.id, id, updates)}
                onRemove={(id) => onRemoveChild(param.id, id)}
                onAddChild={onAddChild} // would need a deeper recursion handler
                onRemoveChild={onRemoveChild}
                onUpdateChild={onUpdateChild}
                onMove={onMove}
              />
            ))}
            
            {(!param.children || param.children.length === 0) && (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                No properties added yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
