import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGrammar } from '../context/GrammarContext';
import { convertToCNF, convertToGNF } from '../engine/cfgEngine';

export default function CNFConverterPage() {
  const { grammar } = useGrammar();
  const navigate = useNavigate();
  const [mode, setMode] = useState('CNF'); // 'CNF' | 'GNF'
  const [activeStep, setActiveStep] = useState(0);
  const [viewMode, setViewMode] = useState('diff'); // 'diff' | 'sideBySide' | 'raw'
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(2400); // ms per step
  const [selectedDemoRule, setSelectedDemoRule] = useState(null);
  const [demoAnimKey, setDemoAnimKey] = useState(0);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Compute CNF and GNF results
  const cnfResult = useMemo(() => {
    if (!grammar?.isValid) return null;
    try { return convertToCNF(grammar); } catch { return null; }
  }, [grammar]);

  const gnfResult = useMemo(() => {
    if (!cnfResult?.cnfGrammar) return null;
    try { return convertToGNF(cnfResult.cnfGrammar); } catch { return null; }
  }, [cnfResult]);

  const steps = mode === 'CNF' ? (cnfResult?.steps || []) : (gnfResult?.steps || []);
  const currentStep = steps[activeStep] || steps[0];

  // Auto-play timer
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playSpeed, steps.length]);

  // Reset demo animation when step changes
  useEffect(() => {
    setDemoAnimKey(k => k + 1);
    setSelectedDemoRule(null);
  }, [activeStep, mode]);

  const handleCopyGrammar = (text) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  if (!grammar?.isValid) {
    return (
      <div style={{ paddingTop: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--on-surface-variant)', marginBottom: 16 }}>transform</span>
        <h2 style={{ fontFamily: 'var(--font-hand)', fontSize: 28, color: 'var(--ink-primary)', marginBottom: 8 }}>No Grammar Loaded</h2>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--on-surface-variant)', marginBottom: 20 }}>
          Please define or select a grammar first before transforming into CNF or GNF.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/grammar')}>
          <span className="material-symbols-outlined">edit_note</span>
          Go to CFG Input
        </button>
      </div>
    );
  }

  // Find a representative rule to illustrate this step
  const representativeRule = (() => {
    if (!currentStep) return null;
    if (currentStep.diff?.added?.length > 0) return currentStep.diff.added[0];
    if (currentStep.diff?.removed?.length > 0) return currentStep.diff.removed[0];
    if (currentStep.diff?.retained?.length > 0) return currentStep.diff.retained[0];
    return null;
  })();

  const activeDemo = selectedDemoRule || representativeRule;

  return (
    <div style={{ paddingTop: 100 }}>
      <div className="notebook-lines" style={{ minHeight: 'calc(100vh - 100px)', padding: '1.5rem 1rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* ── Top Header & Mode Toggle ── */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            marginBottom: '1.25rem'
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-hand)', fontSize: 14, color: 'var(--ink-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Home</span>
                <span>›</span>
                <span style={{ fontWeight: 700, color: 'var(--ink-primary)' }}>CNF & GNF Laboratory</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-hand)', fontSize: 34, fontWeight: 700, color: 'var(--ink-primary)', margin: '4px 0 2px' }}>
                ⚗️ Grammar Normal Form Transformer
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--on-surface-variant)', maxWidth: 650 }}>
                Interactive step-by-step conversion pipeline. Watch rules transform, diffs animate, and learn the theoretical purpose behind every Chomsky Normal Form rule.
              </p>
            </div>

            {/* Mode Toggle & Grammar Tag */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <div style={{
                display: 'inline-flex',
                background: 'var(--surface-high)',
                padding: 4,
                borderRadius: 10,
                border: '2px solid var(--ink-primary)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <button
                  onClick={() => { setMode('CNF'); setActiveStep(0); setIsPlaying(false); }}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 6,
                    border: 'none',
                    background: mode === 'CNF' ? 'var(--ink-primary)' : 'transparent',
                    color: mode === 'CNF' ? '#fff' : 'var(--ink-primary)',
                    fontFamily: 'var(--font-display)',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}>
                  CNF (Chomsky)
                </button>
                <button
                  onClick={() => { setMode('GNF'); setActiveStep(0); setIsPlaying(false); }}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 6,
                    border: 'none',
                    background: mode === 'GNF' ? 'var(--ink-primary)' : 'transparent',
                    color: mode === 'GNF' ? '#fff' : 'var(--ink-primary)',
                    fontFamily: 'var(--font-display)',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}>
                  GNF (Greibach)
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-secondary)' }}>
                  Start: <strong>{grammar.startSymbol}</strong> | Variables: <strong>{grammar.nonTerminals?.length}</strong> | Terminals: <strong>{grammar.terminals?.length}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* ── Interactive Pipeline Stepper & Playback Controls ── */}
          <div style={{
            background: 'var(--ink-primary)',
            borderRadius: 14,
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-md)',
            border: '2px solid var(--ink-primary)'
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 12
            }}>
              {/* Stepper Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {steps.map((step, idx) => {
                  const isActive = idx === activeStep;
                  const isDone = idx < activeStep;
                  return (
                    <React.Fragment key={idx}>
                      <button
                        onClick={() => { setActiveStep(idx); setIsPlaying(false); }}
                        style={{
                          padding: '6px 14px',
                          background: isActive
                            ? 'var(--yellow)'
                            : isDone
                            ? 'rgba(39, 174, 96, 0.25)'
                            : 'rgba(255, 255, 255, 0.08)',
                          color: isActive
                            ? 'var(--ink-primary)'
                            : isDone
                            ? '#a3f7c4'
                            : 'rgba(255, 255, 255, 0.65)',
                          border: isActive
                            ? '2px solid var(--yellow)'
                            : isDone
                            ? '1.5px solid var(--sage)'
                            : '1.5px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: 8,
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.2s',
                          transform: isActive ? 'scale(1.04)' : 'none',
                          boxShadow: isActive ? '0 0 10px rgba(244, 200, 66, 0.5)' : 'none'
                        }}>
                        <span style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: isActive ? 'var(--ink-primary)' : isDone ? 'var(--sage)' : 'rgba(255,255,255,0.2)',
                          color: '#fff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 900
                        }}>
                          {isDone ? '✓' : idx + 1}
                        </span>
                        <span>{step.shortName || step.name}</span>
                      </button>
                      {idx < steps.length - 1 && (
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>→</span>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Final Target Badge */}
                <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>→</span>
                <span style={{
                  padding: '6px 12px',
                  background: activeStep === steps.length - 1 ? 'rgba(39, 174, 96, 0.4)' : 'rgba(255,255,255,0.08)',
                  border: `2px solid ${activeStep === steps.length - 1 ? 'var(--sage)' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: 8,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: activeStep === steps.length - 1 ? '#8fffca' : 'rgba(255,255,255,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>verified</span>
                  {mode} Ready
                </span>
              </div>

              {/* Playback Controls (Auto-Play & Speed) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => { setActiveStep(0); setIsPlaying(false); }}
                  title="Restart from step 1"
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#fff', padding: '4px 8px', borderColor: 'rgba(255,255,255,0.2)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>restart_alt</span>
                </button>

                <button
                  onClick={() => { setActiveStep(Math.max(0, activeStep - 1)); setIsPlaying(false); }}
                  disabled={activeStep === 0}
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#fff', padding: '4px 8px', borderColor: 'rgba(255,255,255,0.2)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>skip_previous</span>
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="btn btn-sm"
                  style={{
                    background: isPlaying ? 'var(--coral)' : 'var(--yellow)',
                    color: isPlaying ? '#fff' : 'var(--ink-primary)',
                    border: 'none',
                    fontWeight: 700,
                    padding: '5px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                  <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
                </button>

                <button
                  onClick={() => { setActiveStep(Math.min(steps.length - 1, activeStep + 1)); setIsPlaying(false); }}
                  disabled={activeStep === steps.length - 1}
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#fff', padding: '4px 8px', borderColor: 'rgba(255,255,255,0.2)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>skip_next</span>
                </button>

                {/* Speed selector */}
                <select
                  value={playSpeed}
                  onChange={(e) => setPlaySpeed(Number(e.target.value))}
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    color: '#fff',
                    border: '1.5px solid rgba(255,255,255,0.25)',
                    borderRadius: 6,
                    padding: '3px 6px',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer'
                  }}>
                  <option value={3500} style={{ color: '#000' }}>0.75x Slow</option>
                  <option value={2400} style={{ color: '#000' }}>1x Normal</option>
                  <option value={1400} style={{ color: '#000' }}>1.5x Fast</option>
                </select>
              </div>
            </div>

            {/* Stepper Progress bar */}
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${((activeStep + 1) / steps.length) * 100}%`,
                background: 'linear-gradient(90deg, var(--yellow), var(--sage))',
                transition: 'width 0.3s ease-out'
              }} />
            </div>
          </div>

          {/* ── Main 2-Column Split: Learning Card + Rule Workbench ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.25fr) minmax(340px, 1.75fr)', gap: '1.5rem', alignItems: 'start' }}>

            {/* ══════════════════════════════════════════════
                COLUMN 1: THE PROFESSOR'S NOTEBOOK (Educational Commentary)
               ══════════════════════════════════════════════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Animated Blackboard / Explanation Card */}
              <div
                key={`narration-${activeStep}-${mode}`}
                className="animate-pop-in"
                style={{
                  background: 'var(--surface-white)',
                  border: '2.5px solid var(--ink-primary)',
                  borderRadius: 14,
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-md)',
                  position: 'relative'
                }}>

                {/* Step badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 10px',
                    background: 'var(--yellow-light)',
                    border: '1.5px solid var(--yellow)',
                    borderRadius: 999,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--ink-primary)'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--ink-primary)' }}>school</span>
                    Step {activeStep + 1} of {steps.length}: {currentStep.name}
                  </span>

                  {/* Pulsing live tag */}
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--sage)',
                    fontWeight: 700
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sage)', display: 'inline-block' }} />
                    Active Step
                  </span>
                </div>

                {/* Concept Title & Rule Motto */}
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 17,
                  fontWeight: 700,
                  color: 'var(--ink-primary)',
                  marginBottom: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  {currentStep.conceptTitle || currentStep.name}
                </h3>

                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--on-surface-variant)',
                  marginBottom: 12,
                  background: 'var(--surface-low)',
                  padding: '10px 12px',
                  borderRadius: 8,
                  borderLeft: '4px solid var(--ink-chalk)'
                }}>
                  {currentStep.conceptDescription || currentStep.description}
                </p>

                {/* Plain-English Professor Narration with Typewriter styling */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(28,35,64,0.03) 0%, rgba(244,200,66,0.08) 100%)',
                  border: '1.5px dashed var(--ink-primary)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  marginBottom: 14
                }}>
                  <div style={{
                    fontFamily: 'var(--font-hand)',
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--ink-secondary)',
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--yellow)' }}>record_voice_over</span>
                    Professor's Walkthrough:
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 13.5,
                    lineHeight: 1.65,
                    color: 'var(--ink-primary)',
                    fontWeight: 500
                  }}>
                    {currentStep.plainNarration || currentStep.description}
                    <span className="cursor-blink" style={{ color: 'var(--coral)', fontWeight: 900, marginLeft: 3 }}>▍</span>
                  </div>
                </div>

                {/* Action details list */}
                {currentStep.actionDetails && currentStep.actionDetails.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>
                      Execution Checklist
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {currentStep.actionDetails.map((action, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          fontFamily: 'var(--font-body)',
                          fontSize: 12.5,
                          color: 'var(--on-surface)'
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--sage)', flexShrink: 0, marginTop: 1 }}>
                            check_circle
                          </span>
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step Rule Impact Stat Counters */}
                {currentStep.diff && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '1px solid rgba(28,35,64,0.1)'
                  }}>
                    <div style={{
                      background: 'rgba(39, 174, 96, 0.08)',
                      border: '1.5px solid var(--sage)',
                      borderRadius: 8,
                      padding: '8px 10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, color: 'var(--sage)' }}>
                        +{currentStep.diff.added?.length || 0}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-primary)' }}>
                        Rules Added
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(192, 57, 43, 0.08)',
                      border: '1.5px solid var(--coral)',
                      borderRadius: 8,
                      padding: '8px 10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, color: 'var(--coral)' }}>
                        -{currentStep.diff.removed?.length || 0}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-primary)' }}>
                        Rules Pruned
                      </div>
                    </div>

                    <div style={{
                      background: 'var(--surface-low)',
                      border: '1.5px solid var(--ink-chalk)',
                      borderRadius: 8,
                      padding: '8px 10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, color: 'var(--ink-primary)' }}>
                        {currentStep.diff.retained?.length || 0}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-primary)' }}>
                        Preserved
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── CNF 5-Criteria Compliance Scorecard ── */}
              {mode === 'CNF' && (
                <div style={{
                  background: 'var(--surface-low)',
                  border: '2px solid var(--ink-primary)',
                  borderRadius: 14,
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10
                  }}>
                    <div style={{ fontFamily: 'var(--font-hand)', fontSize: 17, fontWeight: 700, color: 'var(--ink-primary)' }}>
                      📜 CNF Compliance Scorecard
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: activeStep === 4 ? 'var(--sage)' : 'var(--ink-secondary)'
                    }}>
                      {activeStep === 4 ? '5 / 5 Satisfied' : `${activeStep + 1} / 5 Criteria`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { title: '1. Start symbol never occurs on RHS', done: activeStep >= 0 },
                      { title: '2. No ε-productions (empty transitions eliminated)', done: activeStep >= 1 },
                      { title: '3. No unit productions (A → B eliminated)', done: activeStep >= 2 },
                      { title: '4. No useless symbols (generating & reachable)', done: activeStep >= 3 },
                      { title: '5. Strictly binary (A → BC) or single terminal (A → a)', done: activeStep >= 4 },
                    ].map((crit, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: crit.done ? 'var(--sage-light)' : 'var(--surface-high)',
                        border: `1.5px solid ${crit.done ? 'var(--sage)' : 'rgba(28,35,64,0.15)'}`,
                        borderRadius: 6,
                        transition: 'all 0.2s'
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11.5,
                          fontWeight: crit.done ? 700 : 500,
                          color: crit.done ? 'var(--ink-primary)' : 'var(--on-surface-variant)'
                        }}>
                          {crit.title}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          fontWeight: 700,
                          color: crit.done ? 'var(--sage)' : 'var(--ink-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3
                        }}>
                          {crit.done ? '✓ OK' : '⏳ Pending'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {activeStep === 4 && (
                    <div style={{
                      marginTop: 12,
                      padding: 10,
                      background: 'rgba(39, 174, 96, 0.15)',
                      border: '2px solid var(--sage)',
                      borderRadius: 8,
                      textAlign: 'center'
                    }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--sage)', marginBottom: 6 }}>
                        🎉 Grammar is 100% CNF Compliant!
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => navigate('/cyk')}>
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>grid_on</span>
                        Test with CYK Parser
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════
                COLUMN 2: INTERACTIVE RULE WORKBENCH & ANIMATIONS
               ══════════════════════════════════════════════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* ── Interactive Transformation Animation Stage ── */}
              <div style={{
                background: 'var(--surface-white)',
                border: '2.5px solid var(--ink-primary)',
                borderRadius: 14,
                padding: '1.25rem',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--ink-lavender)' }}>
                      animation
                    </span>
                    <span style={{ fontFamily: 'var(--font-hand)', fontSize: 18, fontWeight: 700, color: 'var(--ink-primary)' }}>
                      Live Rule Transformation Visualizer
                    </span>
                  </div>
                  <button
                    onClick={() => setDemoAnimKey(k => k + 1)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11, padding: '3px 8px', borderColor: 'var(--ink-primary)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>replay</span>
                    Replay Animation
                  </button>
                </div>

                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--on-surface-variant)', marginBottom: 14 }}>
                  Watch how individual tokens behave during <strong>{currentStep.name}</strong>:
                </p>

                {/* Animated Transformation Showcase Box */}
                <div
                  key={`demo-anim-${demoAnimKey}`}
                  className="animate-token-fork"
                  style={{
                    background: 'var(--surface-low)',
                    border: '2px dashed var(--ink-primary)',
                    borderRadius: 10,
                    padding: '1.25rem',
                    textAlign: 'center'
                  }}>

                  {/* STEP 0 DEMO: Start Symbol Protection */}
                  {currentStep.stepKey === 'start_symbol' && (
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
                        Start Variable Wrapping
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{
                          padding: '8px 14px',
                          background: 'var(--surface-white)',
                          border: '2px solid var(--ink-primary)',
                          borderRadius: 8,
                          fontFamily: 'var(--font-mono)',
                          fontSize: 14,
                          fontWeight: 700
                        }}>
                          Original Start: <span style={{ color: 'var(--coral)' }}>{grammar.startSymbol}</span>
                        </div>
                        <span style={{ fontSize: 20, color: 'var(--ink-primary)', fontWeight: 900 }}>➔</span>
                        <div style={{
                          padding: '8px 14px',
                          background: 'var(--yellow-light)',
                          border: '2px solid var(--yellow)',
                          borderRadius: 8,
                          fontFamily: 'var(--font-mono)',
                          fontSize: 14,
                          fontWeight: 700,
                          boxShadow: 'var(--shadow-sm)'
                        }}>
                          Isolated Root: <span style={{ color: 'var(--ink-primary)' }}>S₀ → {grammar.startSymbol}</span>
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-hand)', fontSize: 14, color: 'var(--ink-secondary)', marginTop: 10 }}>
                        {grammar.productions[grammar.startSymbol]
                          ? `Guarantees the root entry point can never loop back into itself!`
                          : `Original start symbol is already clean!`}
                      </div>
                    </div>
                  )}

                  {/* STEP 1 DEMO: Nullable ε-Elimination */}
                  {currentStep.stepKey === 'eliminate_epsilon' && (
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
                        Nullable Permutation Splitting
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 10
                      }}>
                        {/* Parent rule */}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 14px',
                          background: 'var(--surface-white)',
                          border: '2px solid var(--ink-primary)',
                          borderRadius: 8,
                          fontFamily: 'var(--font-mono)',
                          fontSize: 14,
                          fontWeight: 700
                        }}>
                          <span>Parent Rule:</span>
                          <span style={{ color: 'var(--ink-primary)' }}>S →</span>
                          <span className="token-terminal">a</span>
                          <span className="token-epsilon" style={{ animation: 'pulse-glow 1.5s infinite' }}>S (Nullable)</span>
                          <span className="token-terminal">b</span>
                        </div>

                        {/* Split Arrows */}
                        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                          <span style={{ fontSize: 18, color: 'var(--sage)', fontWeight: 900 }}>↙ Keep S</span>
                          <span style={{ fontSize: 18, color: 'var(--coral)', fontWeight: 900 }}>↘ Drop S (S vanishes)</span>
                        </div>

                        {/* Resulting split rules */}
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                          <div style={{
                            padding: '6px 12px',
                            background: 'var(--sage-light)',
                            border: '1.5px solid var(--sage)',
                            borderRadius: 6,
                            fontFamily: 'var(--font-mono)',
                            fontSize: 13,
                            fontWeight: 700
                          }}>
                            S → a S b
                          </div>
                          <div style={{
                            padding: '6px 12px',
                            background: 'var(--yellow-light)',
                            border: '1.5px solid var(--yellow)',
                            borderRadius: 6,
                            fontFamily: 'var(--font-mono)',
                            fontSize: 13,
                            fontWeight: 700
                          }}>
                            S → a b <span style={{ color: 'var(--coral)', fontSize: 11 }}>(Simulates S evaporating into ε)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 DEMO: Unit Production Removal */}
                  {currentStep.stepKey === 'eliminate_unit' && (
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
                        Transitive Unit Production Inlining
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{
                          padding: '8px 12px',
                          background: 'rgba(192, 57, 43, 0.1)',
                          border: '1.5px dashed var(--coral)',
                          borderRadius: 8,
                          fontFamily: 'var(--font-mono)',
                          fontSize: 13,
                          textDecoration: 'line-through',
                          color: 'var(--coral)'
                        }}>
                          Unit Hop: A → B
                        </div>
                        <span style={{ fontSize: 18, color: 'var(--ink-primary)', fontWeight: 900 }}>+</span>
                        <div style={{
                          padding: '8px 12px',
                          background: 'var(--surface-white)',
                          border: '1.5px solid var(--ink-primary)',
                          borderRadius: 8,
                          fontFamily: 'var(--font-mono)',
                          fontSize: 13
                        }}>
                          Target: B → 0 | 1
                        </div>
                        <span style={{ fontSize: 20, color: 'var(--sage)', fontWeight: 900 }}>➔</span>
                        <div style={{
                          padding: '8px 14px',
                          background: 'var(--sage-light)',
                          border: '2px solid var(--sage)',
                          borderRadius: 8,
                          fontFamily: 'var(--font-mono)',
                          fontSize: 13,
                          fontWeight: 700,
                          color: 'var(--ink-primary)'
                        }}>
                          Inlined: A → 0 | 1
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-hand)', fontSize: 14, color: 'var(--ink-secondary)', marginTop: 8 }}>
                        Eliminated redundant intermediary variable hop!
                      </div>
                    </div>
                  )}

                  {/* STEP 3 DEMO: Useless Symbols */}
                  {currentStep.stepKey === 'eliminate_useless' && (
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
                        Generating & Reachable Symbol Filtering
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{
                          padding: '8px 14px',
                          background: 'var(--sage-light)',
                          border: '1.5px solid var(--sage)',
                          borderRadius: 8,
                          textAlign: 'left'
                        }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--sage)' }}>✓ Generating Set</div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--on-surface-variant)' }}>Can derive terminal strings</div>
                        </div>

                        <div style={{
                          padding: '8px 14px',
                          background: 'var(--sage-light)',
                          border: '1.5px solid var(--sage)',
                          borderRadius: 8,
                          textAlign: 'left'
                        }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--sage)' }}>✓ Reachable Set</div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--on-surface-variant)' }}>Accessible from start symbol</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4 DEMO: Binarize & Terminal Isolation */}
                  {currentStep.stepKey === 'binarize' && (
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
                        Two-Phase Binarization (TERM + BIN)
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                        {/* Phase A: Term */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--ink-secondary)' }}>Phase 1 (TERM):</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--surface-white)', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--ink-primary)' }}>
                            S → a S b
                          </span>
                          <span>➔</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--yellow-light)', padding: '3px 8px', borderRadius: 4, border: '1.5px solid var(--yellow)', fontWeight: 700 }}>
                            S → T₁ S T₂
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-secondary)' }}>(T₁ → a, T₂ → b)</span>
                        </div>

                        {/* Phase B: Bin */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--ink-secondary)' }}>Phase 2 (BIN):</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--yellow-light)', padding: '3px 8px', borderRadius: 4, border: '1.5px solid var(--yellow)' }}>
                            S → T₁ S T₂
                          </span>
                          <span>➔</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--sage-light)', padding: '3px 8px', borderRadius: 4, border: '1.5px solid var(--sage)', fontWeight: 700 }}>
                            S → T₁ B₁  &  B₁ → S T₂
                          </span>
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-hand)', fontSize: 14, color: 'var(--sage)', fontWeight: 700, marginTop: 10 }}>
                        ✓ Every rule now has strictly 2 variables or 1 terminal!
                      </div>
                    </div>
                  )}

                  {/* Fallback for other steps or GNF */}
                  {!['start_symbol', 'eliminate_epsilon', 'eliminate_unit', 'eliminate_useless', 'binarize'].includes(currentStep.stepKey) && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-primary)' }}>
                      {currentStep.description}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Rule Inspection & Diff Viewer ── */}
              <div style={{
                background: 'var(--surface-white)',
                border: '2.5px solid var(--ink-primary)',
                borderRadius: 14,
                padding: '1.25rem',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: 8
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-hand)', fontSize: 18, fontWeight: 700, color: 'var(--ink-primary)' }}>
                      Grammar State & Rule Diffs
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--on-surface-variant)' }}>
                      Review exact rule modifications produced by this step
                    </div>
                  </div>

                  {/* View Mode Toggle */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[
                      { key: 'diff', label: 'Visual Diff', icon: 'difference' },
                      { key: 'sideBySide', label: 'Side-by-Side', icon: 'view_column' },
                      { key: 'raw', label: 'Clean Code', icon: 'code' },
                    ].map(v => (
                      <button
                        key={v.key}
                        onClick={() => setViewMode(v.key)}
                        className={`btn btn-sm ${viewMode === v.key ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '4px 8px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{v.icon}</span>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* VIEW MODE 1: VISUAL DIFF */}
                {viewMode === 'diff' && currentStep.diff && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
                    {/* Added Rules */}
                    {currentStep.diff.added?.map((rule, idx) => (
                      <div
                        key={`added-${idx}`}
                        className="animate-pop-in animate-rule-flash"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: 'rgba(39, 174, 96, 0.08)',
                          border: '2px solid var(--sage)',
                          borderRadius: 8
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            padding: '2px 6px',
                            background: 'var(--sage)',
                            color: '#fff',
                            borderRadius: 4,
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            fontWeight: 900
                          }}>
                            + ADDED
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--ink-primary)' }}>
                            {rule.str}
                          </span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--sage)', fontWeight: 600 }}>
                          Synthesized in Step {activeStep + 1}
                        </span>
                      </div>
                    ))}

                    {/* Removed Rules */}
                    {currentStep.diff.removed?.map((rule, idx) => (
                      <div
                        key={`removed-${idx}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: 'rgba(192, 57, 43, 0.06)',
                          border: '1.5px dashed var(--coral)',
                          borderRadius: 8,
                          opacity: 0.85
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            padding: '2px 6px',
                            background: 'var(--coral)',
                            color: '#fff',
                            borderRadius: 4,
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            fontWeight: 900
                          }}>
                            - PRUNED
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 13,
                            color: 'var(--coral)',
                            textDecoration: 'line-through'
                          }}>
                            {rule.str}
                          </span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--coral)' }}>
                          Eliminated by Chomsky rule
                        </span>
                      </div>
                    ))}

                    {/* Retained Rules */}
                    {currentStep.diff.retained?.map((rule, idx) => (
                      <div
                        key={`retained-${idx}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 12px',
                          background: 'var(--surface-low)',
                          border: '1px solid rgba(28,35,64,0.15)',
                          borderRadius: 8
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            padding: '2px 6px',
                            background: 'var(--surface-dim)',
                            color: 'var(--ink-primary)',
                            borderRadius: 4,
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            fontWeight: 700
                          }}>
                            KEPT
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-primary)' }}>
                            {rule.str}
                          </span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--on-surface-variant)' }}>
                          Unchanged
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* VIEW MODE 2: SIDE-BY-SIDE */}
                {viewMode === 'sideBySide' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{
                      background: 'var(--surface-low)',
                      border: '1.5px solid rgba(28,35,64,0.2)',
                      borderRadius: 8,
                      padding: '10px 12px'
                    }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--ink-secondary)', marginBottom: 6 }}>
                        ← BEFORE STEP {activeStep + 1}
                      </div>
                      <pre style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12.5,
                        lineHeight: 1.8,
                        color: 'var(--ink-primary)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all'
                      }}>
                        {currentStep.before || 'None'}
                      </pre>
                    </div>

                    <div style={{
                      background: 'var(--surface-low)',
                      border: '2px solid var(--sage)',
                      borderRadius: 8,
                      padding: '10px 12px'
                    }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--sage)', marginBottom: 6 }}>
                        → AFTER STEP {activeStep + 1}
                      </div>
                      <pre style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12.5,
                        lineHeight: 1.8,
                        color: 'var(--ink-primary)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all'
                      }}>
                        {currentStep.after || 'None'}
                      </pre>
                    </div>
                  </div>
                )}

                {/* VIEW MODE 3: RAW CLEAN CODE */}
                {viewMode === 'raw' && (
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      background: 'var(--surface-high)',
                      border: '1.5px solid var(--ink-primary)',
                      borderRadius: 8,
                      padding: '12px 14px'
                    }}>
                      <pre style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        lineHeight: 1.85,
                        color: 'var(--ink-primary)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all'
                      }}>
                        {currentStep.after}
                      </pre>
                    </div>

                    <button
                      onClick={() => handleCopyGrammar(currentStep.after)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontSize: 11,
                        padding: '4px 8px'
                      }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                        {copyFeedback ? 'check' : 'content_copy'}
                      </span>
                      {copyFeedback ? 'Copied!' : 'Copy Rules'}
                    </button>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '1.25rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(28,35,64,0.1)'
                }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setActiveStep(Math.max(0, activeStep - 1)); setIsPlaying(false); }}
                    disabled={activeStep === 0}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_back</span>
                    Previous Step
                  </button>

                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-secondary)' }}>
                    Step {activeStep + 1} of {steps.length}
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => { setActiveStep(Math.min(steps.length - 1, activeStep + 1)); setIsPlaying(false); }}
                    disabled={activeStep === steps.length - 1}>
                    Next Step
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
