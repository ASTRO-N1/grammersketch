import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGrammar } from '../context/GrammarContext';
import { EXAMPLE_GRAMMARS } from '../engine/cfgEngine';

export default function CFGInputPage() {
  const { grammarText, grammar, updateGrammar, loadExample } = useGrammar();
  const [localText, setLocalText] = useState(grammarText);
  const [showExamples, setShowExamples] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setLocalText(e.target.value);
    updateGrammar(e.target.value);
  };

  const handleLoad = (name) => {
    const text = EXAMPLE_GRAMMARS[name].text;
    setLocalText(text);
    updateGrammar(text);
    setShowExamples(false);
  };

  const handleClear = () => { setLocalText(''); updateGrammar(''); };

  return (
    <div style={{ paddingTop: 110 }}>
      <div className="notebook-lines" style={{ minHeight: 'calc(100vh - 110px)', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: 13, color: 'var(--ink-secondary)', marginBottom: 4 }}>
              Home › CFG Input
            </div>
            <h1 style={{ fontFamily: 'var(--font-hand)', fontSize: 38, fontWeight: 700, color: 'var(--ink-primary)' }}>
              ✏️ Your Grammar Workspace
            </h1>
            <svg width="260" height="10" viewBox="0 0 260 10">
              <path d="M2 6 Q20 1,40 6 T80 6 T120 6 T160 6 T200 6 T240 6 T258 6" fill="none" stroke="var(--ink-secondary)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 6 }}>
              Define your Context-Free Grammar below. One rule per line. Use | for alternatives, ε for empty string.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

            {/* Left: Input Area */}
            <div>
              {/* Example buttons */}
              <div style={{ marginBottom: '1rem', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-hand)', fontSize: 15, color: 'var(--ink-secondary)', fontWeight: 700 }}>Or try an example →</span>
                <div style={{ position: 'relative' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowExamples(!showExamples)}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>folder_open</span>
                    Load Example
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{showExamples ? 'expand_less' : 'expand_more'}</span>
                  </button>
                  {showExamples && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, zIndex: 50,
                      background: 'var(--surface-low)',
                      border: '2px solid var(--ink-primary)',
                      borderRadius: 10,
                      boxShadow: '4px 4px 0px var(--ink-primary)',
                      minWidth: 260,
                      marginTop: 4,
                    }}>
                      {Object.entries(EXAMPLE_GRAMMARS).map(([name, ex]) => (
                        <button key={name} onClick={() => handleLoad(name)}
                          style={{
                            display: 'block', width: '100%', textAlign: 'left',
                            padding: '10px 14px', background: 'none', border: 'none',
                            borderBottom: '1px solid var(--surface-dim)',
                            cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13,
                            color: 'var(--on-surface)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-high)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <div style={{ fontWeight: 700, color: 'var(--ink-primary)' }}>{name}</div>
                          <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 2 }}>{ex.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="btn btn-danger btn-sm" onClick={handleClear}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                  Clear
                </button>
              </div>

              {/* Grammar textarea */}
              <div style={{ position: 'relative' }}>
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: 15, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 6 }}>
                  Grammar Productions:
                </div>
                <div style={{ display: 'flex', gap: 0 }}>
                  {/* Line numbers */}
                  <div style={{
                    background: 'var(--secondary-container)',
                    border: '2px solid var(--ink-primary)',
                    borderRight: 'none',
                    borderRadius: '4px 0 0 4px',
                    padding: '12px 8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: 'var(--ink-secondary)',
                    lineHeight: '28px',
                    minWidth: 32,
                    textAlign: 'right',
                    userSelect: 'none',
                  }}>
                    {localText.split('\n').map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <textarea
                    className="textarea-notebook"
                    value={localText}
                    onChange={handleChange}
                    rows={Math.max(6, localText.split('\n').length + 1)}
                    placeholder={"S -> a S b | ε\nA -> a A | a\nB -> b B | b"}
                    spellCheck={false}
                    style={{
                      borderRadius: '0 4px 4px 0',
                      borderLeft: '2px solid var(--ink-secondary)',
                      flex: 1,
                    }}
                  />
                </div>
                {/* Margin annotation */}
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>
                  * use | for alternatives, ε or e for empty string, → or -&gt; for arrow
                </div>
              </div>

              {/* Validation errors */}
              {grammar?.errors?.length > 0 && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--error-container)', border: '2px solid var(--error)', borderRadius: 10 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--error)', marginBottom: 4 }}>⚠ Grammar Errors:</div>
                  {grammar.errors.map((e, i) => (
                    <div key={i} style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--error)', lineHeight: 1.5 }}>• {e}</div>
                  ))}
                </div>
              )}

              {/* Start symbol input */}
              <div style={{ marginTop: '1.2rem', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  background: 'var(--yellow-light)', border: '2px solid var(--yellow)',
                  borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                  padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase' }}>Start Symbol:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--ink-primary)' }}>
                    {grammar?.startSymbol || '—'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-hand)', fontSize: 12, color: 'var(--ink-secondary)' }}>← usually S!</span>
                </div>
              </div>

              {/* Action buttons */}
              {grammar?.isValid && (
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary btn-lg" onClick={() => navigate('/analysis')}>
                    <span className="material-symbols-outlined">manage_search</span>
                    → Analyze Grammar
                  </button>
                  <button className="btn btn-yellow btn-lg" onClick={() => navigate('/converter')}>
                    <span className="material-symbols-outlined">transform</span>
                    → Convert to CNF/GNF
                  </button>
                </div>
              )}
            </div>

            {/* Right: Live Preview */}
            <div>
              <div style={{ fontFamily: 'var(--font-hand)', fontSize: 18, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '1rem' }}>
                Live Grammar Preview 👁️
              </div>

              {/* Terminals & Non-terminals */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
                <div className="sticky-note" style={{ transform: 'rotate(-1deg)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 6, textTransform: 'uppercase' }}>Terminals Σ:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {grammar?.terminals?.length > 0
                      ? grammar.terminals.map(t => <span key={t} className="token-terminal">{t}</span>)
                      : <span style={{ fontFamily: 'var(--font-hand)', fontSize: 13, color: 'var(--on-surface-variant)' }}>none yet</span>}
                  </div>
                </div>
                <div style={{ background: 'rgba(191,233,255,0.4)', border: '2px solid var(--ink-chalk)', borderRadius: 8, padding: '10px 12px', transform: 'rotate(1deg)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-chalk)', marginBottom: 6, textTransform: 'uppercase' }}>Non-Terminals V:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {grammar?.nonTerminals?.length > 0
                      ? grammar.nonTerminals.map(t => <span key={t} className="token-nonterminal">{t}</span>)
                      : <span style={{ fontFamily: 'var(--font-hand)', fontSize: 13, color: 'var(--on-surface-variant)' }}>none yet</span>}
                  </div>
                </div>
              </div>

              {/* Productions preview */}
              <div style={{ background: 'var(--surface-white)', border: '2px solid var(--ink-primary)', borderRadius: 10, padding: '1rem', boxShadow: 'var(--shadow-sm)', marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: 8 }}>Production Rules:</div>
                {grammar?.isValid
                  ? Object.entries(grammar.productions).map(([nt, rules]) => (
                    <div key={nt} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 8, padding: '6px 8px', background: 'var(--surface-low)', borderRadius: 6 }}>
                      <span className="token-nonterminal">{nt}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-secondary)' }}>→</span>
                      {rules.map((rule, ri) => (
                        <React.Fragment key={ri}>
                          {ri > 0 && <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--on-surface-variant)' }}>|</span>}
                          <span style={{ display: 'flex', gap: 4 }}>
                            {rule.map((sym, si) =>
                              sym === 'ε'
                                ? <span key={si} className="token-epsilon">ε</span>
                                : grammar.nonTerminals.includes(sym)
                                  ? <span key={si} className="token-nonterminal">{sym}</span>
                                  : <span key={si} className="token-terminal">{sym}</span>
                            )}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  ))
                  : <div style={{ fontFamily: 'var(--font-hand)', color: 'var(--on-surface-variant)', fontSize: 14 }}>
                      {grammar?.errors?.length > 0 ? 'Fix errors to see preview' : 'Start typing your grammar...'}
                    </div>
                }
              </div>

              {/* Validity checklist */}
              <div style={{ background: 'var(--surface-high)', border: '1.5px solid var(--surface-dim)', borderRadius: 10, padding: '1rem' }}>
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: 16, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 8 }}>Grammar Check 🔍</div>
                {[
                  { label: 'Has start symbol', ok: !!grammar?.startSymbol },
                  { label: 'All variables defined', ok: grammar?.isValid && grammar?.errors?.length === 0 },
                  { label: 'Syntax is valid', ok: grammar?.isValid },
                  { label: `${grammar?.nonTerminals?.length || 0} non-terminal(s) found`, ok: (grammar?.nonTerminals?.length || 0) > 0 },
                  { label: `${grammar?.terminals?.length || 0} terminal(s) found`, ok: (grammar?.terminals?.length || 0) > 0 },
                ].map(({ label, ok }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: ok ? 'var(--sage)' : 'var(--surface-dim)', fontVariationSettings: "'FILL' 1" }}>
                      {ok ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-hand)', fontSize: 14, color: ok ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
