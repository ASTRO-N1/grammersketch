import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGrammar } from '../context/GrammarContext';
import { buildPDAFromGrammar, simulatePDA } from '../engine/cfgEngine';

export default function PDASimulatorPage() {
  const { grammar } = useGrammar();
  const navigate = useNavigate();
  const [inputStr, setInputStr] = useState('aabb');
  const [simResult, setSimResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600); // ms per step
  const playRef = useRef(null);

  const pda = grammar?.isValid ? buildPDAFromGrammar(grammar) : null;

  const handleRun = () => {
    if (!pda) return;
    const res = simulatePDA(pda, inputStr.trim());
    setSimResult(res);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const step = simResult?.steps?.[currentStep];
  const totalSteps = simResult?.steps?.length || 0;

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => { setCurrentStep(0); setIsPlaying(false); };
  const handleNext = () => setCurrentStep(s => Math.min(s + 1, totalSteps - 1));
  const handlePrev = () => setCurrentStep(s => Math.max(s - 1, 0));

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= totalSteps - 1) { setIsPlaying(false); return; }
    playRef.current = setTimeout(() => setCurrentStep(s => s + 1), speed);
    return () => clearTimeout(playRef.current);
  }, [isPlaying, currentStep, totalSteps, speed]);

  const states = pda?.states || ['q₀', 'q₁', 'qₐ'];
  const currentState = step?.state || 'q₀';

  if (!grammar?.isValid) {
    return (
      <div style={{ paddingTop: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--on-surface-variant)', marginBottom: 16 }}>smart_toy</span>
        <h2 style={{ fontFamily: 'var(--font-hand)', fontSize: 28, color: 'var(--ink-primary)', marginBottom: 8 }}>No Grammar Loaded</h2>
        <button className="btn btn-primary" onClick={() => navigate('/grammar')}>Go to CFG Input</button>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 110 }}>
      <div className="notebook-lines" style={{ minHeight: 'calc(100vh - 110px)', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: 13, color: 'var(--ink-secondary)', marginBottom: 4 }}>Home › PDA Simulator</div>
            <h1 style={{ fontFamily: 'var(--font-hand)', fontSize: 36, fontWeight: 700, color: 'var(--ink-primary)' }}>🎭 PDA Simulator</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Watch your Pushdown Automaton come to life — step by step!
            </p>
          </div>

          {/* Input & Controls */}
          <div style={{
            background: 'var(--surface-low)',
            border: '2px solid var(--ink-primary)',
            borderRadius: 12, padding: '1.5rem',
            boxShadow: 'var(--shadow-md)', marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', marginBottom: '1rem' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontFamily: 'var(--font-hand)', fontSize: 16, fontWeight: 700, color: 'var(--ink-primary)', display: 'block', marginBottom: 6 }}>
                  Input String:
                </label>
                <input
                  value={inputStr}
                  onChange={e => { setInputStr(e.target.value); setSimResult(null); }}
                  placeholder="e.g. aabb"
                  onKeyDown={e => e.key === 'Enter' && handleRun()}
                  style={{
                    padding: '10px 14px', width: '100%',
                    background: 'var(--surface-white)',
                    border: '2px solid var(--ink-primary)',
                    borderRadius: 8, fontFamily: 'var(--font-mono)',
                    fontSize: 16, fontWeight: 700, color: 'var(--ink-primary)', outline: 'none',
                    letterSpacing: '0.1em',
                  }}
                />
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleRun}>
                <span className="material-symbols-outlined">play_circle</span>
                Load & Simulate
              </button>
            </div>

            {/* Step controls */}
            {simResult && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <button className="btn btn-ghost btn-sm" onClick={handleReset}>
                  <span className="material-symbols-outlined">first_page</span>
                </button>
                <button className="btn btn-ghost btn-sm" onClick={handlePrev} disabled={currentStep === 0}>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className={`btn btn-sm ${isPlaying ? 'btn-danger' : 'btn-primary'}`} onClick={isPlaying ? handlePause : handlePlay} disabled={currentStep >= totalSteps - 1}>
                  <span className="material-symbols-outlined">{isPlaying ? 'pause' : 'play_arrow'}</span>
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={handleNext} disabled={currentStep >= totalSteps - 1}>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>slow_motion_video</span>
                  <input type="range" min={100} max={1500} step={100} value={speed}
                    onChange={e => setSpeed(+e.target.value)}
                    style={{ width: 100, cursor: 'pointer' }} />
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>fast_forward</span>
                </div>
                <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--on-surface-variant)' }}>
                  Step {currentStep + 1} / {totalSteps}
                </div>
              </div>
            )}
          </div>

          {simResult && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

              {/* State Diagram */}
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: 18, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '1rem' }}>
                  PDA State Diagram
                </div>
                <div style={{
                  background: 'var(--surface-white)',
                  border: '2px solid var(--ink-primary)',
                  borderRadius: 12, padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex', justifyContent: 'center',
                }}>
                  <svg width="520" height="140" viewBox="0 0 520 140" fill="none" style={{ maxWidth: '100%' }}>
                    <defs>
                      <marker id="arrow-pda" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                        <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--ink-primary)" />
                      </marker>
                      <filter id="glow-pda">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    </defs>

                    {/* q₀ */}
                    {(() => {
                      const isActive = currentState === 'q₀';
                      return (
                        <>
                          <circle cx="80" cy="70" r="30"
                            fill={isActive ? 'var(--yellow-light)' : '#f8f3eb'}
                            stroke={isActive ? 'var(--yellow)' : 'var(--ink-primary)'}
                            strokeWidth={isActive ? 3 : 2.5}
                            filter={isActive ? 'url(#glow-pda)' : undefined} />
                          <text x="80" y="76" textAnchor="middle" fontFamily="Space Grotesk" fontSize="16" fontWeight="700" fill={isActive ? 'var(--ink-primary)' : 'var(--ink-primary)'}>q₀</text>
                          {/* Start arrow */}
                          <line x1="28" y1="70" x2="49" y2="70" stroke="var(--ink-primary)" strokeWidth="2.5" markerEnd="url(#arrow-pda)" />
                          <circle cx="24" cy="70" r="4" fill="var(--ink-primary)" />
                          {/* Self-loop */}
                          <path d="M 66 42 C 50 5, 110 5, 94 42" stroke="var(--ink-secondary)" strokeWidth="1.5" />
                          <polygon points="94,42 88,34 96,32" fill="var(--ink-secondary)" />
                          <text x="80" y="14" textAnchor="middle" fontFamily="Space Mono" fontSize="9" fontWeight="bold" fill="var(--ink-secondary)">ε,Z₀/SZ₀</text>
                        </>
                      );
                    })()}

                    {/* q₀ → q₁ arrow */}
                    <line x1="110" y1="70" x2="200" y2="70" stroke="var(--ink-primary)" strokeWidth={currentState === 'q₁' ? 3 : 2} strokeDasharray={currentState === 'q₁' ? "0" : "0"} markerEnd="url(#arrow-pda)" />
                    <text x="155" y="62" textAnchor="middle" fontFamily="Space Mono" fontSize="9" fontWeight="bold" fill="var(--ink-primary)">see rules</text>

                    {/* q₁ */}
                    {(() => {
                      const isActive = currentState === 'q₁';
                      return (
                        <>
                          <circle cx="230" cy="70" r="30"
                            fill={isActive ? 'var(--yellow-light)' : '#f8f3eb'}
                            stroke={isActive ? 'var(--yellow)' : 'var(--ink-primary)'}
                            strokeWidth={isActive ? 3 : 2.5}
                            filter={isActive ? 'url(#glow-pda)' : undefined} />
                          <text x="230" y="76" textAnchor="middle" fontFamily="Space Grotesk" fontSize="16" fontWeight="700" fill="var(--ink-primary)">q₁</text>
                          {/* Self-loops */}
                          <path d="M 216 42 C 200 5, 260 5, 244 42" stroke="var(--ink-secondary)" strokeWidth="1.5" />
                          <polygon points="244,42 238,34 246,32" fill="var(--ink-secondary)" />
                          <text x="230" y="14" textAnchor="middle" fontFamily="Space Mono" fontSize="9" fontWeight="bold" fill="var(--ink-secondary)">expand/match</text>
                        </>
                      );
                    })()}

                    {/* q₁ → qₐ */}
                    <line x1="260" y1="70" x2="360" y2="70" stroke="var(--ink-primary)" strokeWidth="2" markerEnd="url(#arrow-pda)" />
                    <text x="310" y="62" textAnchor="middle" fontFamily="Space Mono" fontSize="9" fontWeight="bold" fill="var(--ink-primary)">ε,Z₀/Z₀</text>

                    {/* qₐ accept */}
                    {(() => {
                      const isActive = currentState === 'qₐ';
                      return (
                        <>
                          <circle cx="390" cy="70" r="30"
                            fill={isActive ? 'rgba(39,174,96,0.15)' : '#dde1ff'}
                            stroke={isActive ? 'var(--sage)' : 'var(--ink-primary)'}
                            strokeWidth={isActive ? 3 : 2.5}
                            filter={isActive ? 'url(#glow-pda)' : undefined} />
                          <circle cx="390" cy="70" r="23" fill="none" stroke={isActive ? 'var(--sage)' : 'var(--ink-primary)'} strokeWidth="1.8" />
                          <text x="390" y="76" textAnchor="middle" fontFamily="Space Grotesk" fontSize="16" fontWeight="700" fill={isActive ? 'var(--sage)' : 'var(--primary)'}>qₐ</text>
                          <text x="390" y="114" textAnchor="middle" fontFamily="Space Mono" fontSize="10" fontWeight="bold" fill={isActive ? 'var(--sage)' : 'var(--primary)'}>[ACCEPT]</text>
                        </>
                      );
                    })()}
                  </svg>
                </div>

                {/* Input Tape */}
                <div style={{ marginTop: '1rem', background: 'var(--surface-high)', border: '2px solid var(--ink-primary)', borderRadius: 10, padding: '1rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>Input Tape</div>
                  <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4 }}>
                    {inputStr.split('').filter(c => c !== ' ').map((ch, i) => {
                      const consumed = step ? inputStr.length - step.remaining.join('').length : 0;
                      const isCurrent = i === consumed;
                      const isRead = i < consumed;
                      return (
                        <div key={i} style={{
                          minWidth: 36, height: 36,
                          border: `2px solid ${isCurrent ? 'var(--yellow)' : 'rgba(28,35,64,0.2)'}`,
                          borderRadius: 4,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700,
                          color: isRead ? 'var(--on-surface-variant)' : 'var(--ink-primary)',
                          background: isCurrent ? 'var(--yellow-light)' : isRead ? 'var(--surface-dim)' : 'var(--surface-white)',
                          opacity: isRead ? 0.5 : 1,
                          position: 'relative',
                          textDecoration: isRead ? 'line-through' : 'none',
                          boxShadow: isCurrent ? '2px 2px 0px var(--yellow)' : 'none',
                        }}>
                          {ch}
                          {isCurrent && (
                            <div style={{
                              position: 'absolute', top: -14,
                              width: 0, height: 0,
                              borderLeft: '6px solid transparent',
                              borderRight: '6px solid transparent',
                              borderTop: '8px solid var(--ink-primary)',
                            }} />
                          )}
                        </div>
                      );
                    })}
                    <div style={{
                      minWidth: 36, height: 36, border: '2px solid rgba(28,35,64,0.15)',
                      borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--on-surface-variant)',
                    }}>⊣</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-hand)', fontSize: 12, color: 'var(--ink-secondary)', marginTop: 4 }}>
                    ↑ Read head position
                  </div>
                </div>
              </div>

              {/* Stack */}
              <div>
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: 18, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '1rem' }}>
                  Stack 📚
                </div>
                <div style={{
                  background: 'var(--surface-white)',
                  border: '2px solid var(--ink-primary)',
                  borderRadius: 10, padding: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                  minHeight: 200,
                }}>
                  {step?.stack?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>
                        ← TOP
                      </div>
                      {step.stack.map((sym, i) => (
                        <div key={i} style={{
                          padding: '10px 16px',
                          background: i === 0 ? 'var(--secondary-container)' : 'var(--surface-high)',
                          border: `2px solid ${i === 0 ? 'var(--ink-secondary)' : 'rgba(28,35,64,0.2)'}`,
                          borderRadius: 8,
                          fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700,
                          color: 'var(--ink-primary)',
                          textAlign: 'center',
                          boxShadow: i === 0 ? 'var(--shadow-sm)' : 'none',
                          animation: 'stackPush 0.3s ease',
                        }}>
                          {sym}
                        </div>
                      ))}
                      <div style={{
                        padding: '6px 16px',
                        background: 'var(--surface-dim)',
                        border: '2px dashed rgba(28,35,64,0.3)',
                        borderRadius: 8,
                        fontFamily: 'var(--font-mono)', fontSize: 11,
                        color: 'var(--on-surface-variant)', textAlign: 'center',
                      }}>
                        ⊥ BOTTOM OF STACK
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontFamily: 'var(--font-hand)', fontSize: 15, color: 'var(--on-surface-variant)', textAlign: 'center', marginTop: '2rem' }}>
                      Stack is empty
                    </div>
                  )}
                </div>

                {/* Step details */}
                <div style={{ marginTop: '1rem', background: 'var(--surface-high)', border: '2px solid var(--ink-primary)', borderRadius: 10, padding: '1rem' }}>
                  <div style={{ fontFamily: 'var(--font-hand)', fontSize: 15, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 6 }}>
                    Current Action:
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--on-surface)', lineHeight: 1.6 }}>
                    {step?.action || 'Press Play to start simulation'}
                  </div>
                  {step?.rule && (
                    <div style={{ marginTop: 6, padding: '4px 10px', background: 'var(--yellow-light)', border: '1.5px solid var(--yellow)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--ink-primary)' }}>
                      Applied: {step.rule}
                    </div>
                  )}
                </div>

                {/* Final result */}
                {currentStep === totalSteps - 1 && step?.accepted !== null && (
                  <div style={{
                    marginTop: '1rem',
                    background: step.accepted ? 'rgba(39,174,96,0.1)' : 'var(--error-container)',
                    border: `2px solid ${step.accepted ? 'var(--sage)' : 'var(--error)'}`,
                    borderRadius: 12, padding: '1rem',
                    textAlign: 'center',
                    animation: 'stampIn 0.4s ease',
                  }}>
                    <div style={{ fontSize: 36, marginBottom: 4 }}>{step.accepted ? '🎉' : '😔'}</div>
                    <div style={{ fontFamily: 'var(--font-hand)', fontSize: 24, fontWeight: 700, color: step.accepted ? 'var(--sage)' : 'var(--error)' }}>
                      {step.accepted ? 'ACCEPTED!' : 'REJECTED!'}
                    </div>
                  </div>
                )}
              </div>

              {/* Step Log */}
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: 16, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 8 }}>
                  Configuration Trace
                </div>
                <div style={{
                  background: 'var(--surface-white)', border: '2px solid var(--ink-primary)',
                  borderRadius: 10, padding: '1rem',
                  maxHeight: 220, overflowY: 'auto',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-high)' }}>
                        {['Step', 'State', 'Remaining Input', 'Stack', 'Action'].map(h => (
                          <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, color: 'var(--on-surface-variant)', fontSize: 10, textTransform: 'uppercase', borderBottom: '1.5px solid var(--surface-dim)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {simResult.steps.slice(0, currentStep + 1).map((s, i) => (
                        <tr key={i} style={{
                          background: i === currentStep ? 'var(--yellow-light)' : i % 2 === 0 ? 'var(--surface)' : 'transparent',
                          borderBottom: '1px solid var(--surface-dim)',
                        }}>
                          <td style={{ padding: '6px 10px', fontWeight: 700, color: 'var(--ink-secondary)' }}>{s.stepNum}</td>
                          <td style={{ padding: '6px 10px' }}>
                            <span style={{ padding: '1px 8px', background: s.state === 'qₐ' ? 'rgba(39,174,96,0.2)' : 'var(--surface-high)', borderRadius: 4, fontWeight: 700 }}>{s.state}</span>
                          </td>
                          <td style={{ padding: '6px 10px', color: 'var(--ink-primary)' }}>{s.remaining.join('') || 'ε'}</td>
                          <td style={{ padding: '6px 10px', color: 'var(--ink-primary)' }}>{s.stack.join(' ') || '∅'}</td>
                          <td style={{ padding: '6px 10px', color: 'var(--on-surface-variant)', fontSize: 11 }}>{s.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!simResult && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 64, display: 'block', marginBottom: 16, opacity: 0.4 }}>smart_toy</span>
              <div style={{ fontFamily: 'var(--font-hand)', fontSize: 20, fontWeight: 700 }}>Enter a string and click "Load & Simulate"</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
