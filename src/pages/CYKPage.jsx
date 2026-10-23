import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGrammar } from '../context/GrammarContext';
import { convertToCNF, runCYK } from '../engine/cfgEngine';

export default function CYKPage() {
  const { grammar, addToHistory } = useGrammar();
  const navigate = useNavigate();
  const [inputStr, setInputStr] = useState('aabb');
  const [result, setResult] = useState(null);
  const [animStep, setAnimStep] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef(null);

  const cnfGrammar = useMemo(() => {
    if (!grammar?.isValid) return null;
    try { return convertToCNF(grammar).cnfGrammar; } catch { return null; }
  }, [grammar]);

  const handleRun = () => {
    if (!cnfGrammar) return;
    const res = runCYK(cnfGrammar, inputStr.trim());
    setResult(res);
    setAnimStep(-1);
  };

  const handleAnimate = () => {
    if (!result) return;
    setAnimStep(0);
    setIsAnimating(true);
  };

  useEffect(() => {
    if (!isAnimating || !result) return;
    if (animStep >= result.steps.length) {
      setIsAnimating(false);
      if (result) addToHistory({ string: inputStr, accepted: result.accepted, timestamp: new Date().toISOString() });
      return;
    }
    animRef.current = setTimeout(() => setAnimStep(s => s + 1), 250);
    return () => clearTimeout(animRef.current);
  }, [animStep, isAnimating, result]);

  const getCell = (i, j) => {
    if (!result?.table) return new Set();
    return result.table[i]?.[j] || new Set();
  };

  const isCellFilled = (i, j) => {
    if (!result || animStep < 0) return false;
    const stepIdx = result.steps.findIndex(s => s.i === i && s.j === j);
    return stepIdx !== -1 && stepIdx <= animStep;
  };

  const isCellActive = (i, j) => {
    if (!result || animStep < 0) return false;
    const step = result.steps[animStep];
    return step && step.i === i && step.j === j;
  };

  if (!grammar?.isValid) {
    return (
      <div style={{ paddingTop: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--on-surface-variant)', marginBottom: 16 }}>grid_on</span>
        <h2 style={{ fontFamily: 'var(--font-hand)', fontSize: 28, color: 'var(--ink-primary)', marginBottom: 8 }}>No Grammar Loaded</h2>
        <button className="btn btn-primary" onClick={() => navigate('/grammar')}>Go to CFG Input</button>
      </div>
    );
  }

  const tokens = inputStr.trim().split('').filter(c => c !== ' ');
  const n = tokens.length;
  const isRunning = animStep >= 0 && animStep < (result?.steps?.length || 0);
  const showFull = animStep < 0 || animStep >= (result?.steps?.length || 0);

  return (
    <div style={{ paddingTop: 110 }}>
      <div className="graph-paper" style={{ minHeight: 'calc(100vh - 110px)', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: 13, color: 'var(--ink-secondary)', marginBottom: 4 }}>Home › CYK Membership Test</div>
            <h1 style={{ fontFamily: 'var(--font-hand)', fontSize: 36, fontWeight: 700, color: 'var(--ink-primary)' }}>🧩 CYK Membership Test</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Is your string in the language? The CYK algorithm tells you — with proof!
            </p>
          </div>

          {/* Input area */}
          <div style={{
            background: 'var(--surface-low)',
            border: '2px solid var(--ink-primary)',
            borderRadius: 12,
            padding: '1.5rem',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontFamily: 'var(--font-hand)', fontSize: 16, fontWeight: 700, color: 'var(--ink-primary)', display: 'block', marginBottom: 6 }}>
                  Enter Test String:
                </label>
                <input
                  value={inputStr}
                  onChange={e => { setInputStr(e.target.value); setResult(null); setAnimStep(-1); }}
                  onKeyDown={e => e.key === 'Enter' && handleRun()}
                  placeholder="e.g. aabb"
                  style={{
                    padding: '10px 14px', width: '100%',
                    background: 'var(--surface-white)',
                    border: '2px solid var(--ink-primary)',
                    borderRadius: 8,
                    fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700,
                    color: 'var(--ink-primary)', outline: 'none',
                    letterSpacing: '0.1em',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-lg" onClick={handleRun} disabled={!cnfGrammar}>
                  <span className="material-symbols-outlined">search</span>
                  Run CYK
                </button>
                {result && (
                  <button className="btn btn-yellow" onClick={handleAnimate} disabled={isAnimating}>
                    <span className="material-symbols-outlined">{isAnimating ? 'pause' : 'play_arrow'}</span>
                    Animate
                  </button>
                )}
              </div>
            </div>

            {/* Scrabble tiles */}
            {tokens.length > 0 && (
              <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-hand)', fontSize: 14, color: 'var(--ink-secondary)' }}>Tokens:</span>
                {tokens.map((ch, i) => (
                  <div key={i} style={{
                    width: 36, height: 36,
                    background: 'var(--surface-white)',
                    border: '2px solid var(--ink-primary)',
                    borderRadius: 6,
                    boxShadow: '2px 2px 0px var(--ink-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700,
                    color: 'var(--ink-primary)',
                    position: 'relative',
                  }}>
                    {ch}
                    <span style={{ position: 'absolute', bottom: 1, right: 3, fontSize: 8, color: 'var(--on-surface-variant)', fontFamily: 'var(--font-mono)' }}>{i}</span>
                  </div>
                ))}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--on-surface-variant)', marginLeft: 4 }}>
                  |w| = {tokens.length}
                </span>
              </div>
            )}
          </div>

          {/* CYK Table */}
          {result && n > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: 18, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '1rem' }}>
                  CYK Table 📊
                </div>
                <div style={{
                  background: 'var(--surface-white)',
                  border: '2px solid var(--ink-primary)',
                  borderRadius: 10,
                  padding: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                  overflowX: 'auto',
                }}>
                  {/* Column headers = input chars */}
                  <table className="cyk-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--on-surface-variant)', paddingRight: 6 }}>len\pos</th>
                        {tokens.map((ch, i) => (
                          <th key={i} style={{ width: 52, padding: '0 2px', paddingBottom: 4 }}>
                            <div style={{
                              width: 36, height: 36, margin: '0 auto',
                              background: 'var(--ink-primary)', color: '#fff',
                              borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
                            }}>{ch}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--on-surface-variant)', textAlign: 'center' }}>{i}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: n }, (_, len) => n - len).map(len => (
                        <tr key={len}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--on-surface-variant)', paddingRight: 6, textAlign: 'right' }}>
                            {len}
                          </td>
                          {Array.from({ length: n }, (_, i) => i).map(i => {
                            const cell = showFull ? getCell(i, len) : (isCellFilled(i, len) ? getCell(i, len) : new Set());
                            const active = isCellActive(i, len);
                            const valid = i + len <= n;
                            const isResult = len === n && i === 0;
                            const hasStart = cell.has(grammar.startSymbol);
                            return (
                              <td key={i} className={`cyk-cell ${valid && cell.size > 0 ? 'filled' : ''} ${active ? 'active' : ''} ${isResult && hasStart ? 'accepted' : ''}`}
                                style={{ opacity: valid ? 1 : 0.2 }}>
                                {valid && cell.size > 0 && (
                                  <div style={{ fontSize: 11, lineHeight: 1.3 }}>
                                    {[...cell].map((nt, ni) => (
                                      <span key={ni} style={{
                                        display: 'block',
                                        fontWeight: 700,
                                        color: nt === grammar.startSymbol && isResult ? 'var(--sage)' : 'var(--ink-primary)',
                                      }}>{nt}</span>
                                    ))}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Result & explanation */}
              <div>
                {/* Result card */}
                {(showFull || animStep >= result.steps.length - 1) && (
                  <div style={{
                    background: result.accepted ? 'rgba(39,174,96,0.08)' : 'var(--error-container)',
                    border: `3px solid ${result.accepted ? 'var(--sage)' : 'var(--error)'}`,
                    borderRadius: 16,
                    padding: '1.5rem',
                    boxShadow: result.accepted ? '4px 4px 0px var(--sage)' : '4px 4px 0px var(--error)',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    animation: 'stampIn 0.4s ease forwards',
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>{result.accepted ? '✅' : '❌'}</div>
                    <div style={{ fontFamily: 'var(--font-hand)', fontSize: 32, fontWeight: 700, color: result.accepted ? 'var(--sage)' : 'var(--error)' }}>
                      {result.accepted ? 'ACCEPTED!' : 'REJECTED!'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 8 }}>
                      {result.accepted
                        ? `"${inputStr}" is in the language L(G) — ${grammar.startSymbol} appears in table[0][${n}]`
                        : `"${inputStr}" is NOT in L(G) — ${grammar.startSymbol} does not appear in table[0][${n}]`}
                    </div>
                  </div>
                )}

                {/* Step log */}
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: 16, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 8 }}>
                  Algorithm Steps
                </div>
                <div style={{
                  background: 'var(--surface-white)',
                  border: '2px solid var(--ink-primary)',
                  borderRadius: 10,
                  padding: '1rem',
                  maxHeight: 300,
                  overflowY: 'auto',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  {result.steps.slice(0, showFull ? undefined : animStep + 1).map((step, i) => (
                    <div key={i} style={{
                      padding: '6px 10px',
                      marginBottom: 4,
                      borderRadius: 6,
                      background: i === animStep ? 'var(--yellow-light)' : 'transparent',
                      borderLeft: `3px solid ${step.filled.length > 0 ? 'var(--sage)' : 'var(--surface-dim)'}`,
                      fontFamily: 'var(--font-mono)', fontSize: 11,
                    }}>
                      <span style={{ color: 'var(--ink-secondary)', fontWeight: 700 }}>Step {i + 1}:</span>{' '}
                      <span style={{ color: 'var(--ink-primary)' }}>{step.description}</span>
                    </div>
                  ))}
                  {result.steps.length === 0 && (
                    <div style={{ fontFamily: 'var(--font-hand)', fontSize: 14, color: 'var(--on-surface-variant)' }}>
                      {n === 0 ? 'Empty string — checking for ε-production...' : 'No steps generated.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CNF reference */}
          {cnfGrammar && (
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ fontFamily: 'var(--font-hand)', fontSize: 16, fontWeight: 700, color: 'var(--ink-secondary)', cursor: 'pointer', padding: '8px 0' }}>
                📋 Show CNF Grammar Used
              </summary>
              <div className="code-block" style={{ marginTop: 8 }}>
                {Object.entries(cnfGrammar.productions).map(([nt, rules]) => (
                  <div key={nt}>{nt} → {rules.map(r => r.join(' ')).join(' | ')}</div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
