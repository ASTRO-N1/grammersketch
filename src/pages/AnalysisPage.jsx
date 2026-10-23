import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGrammar } from '../context/GrammarContext';
import { getLeftmostDerivation, convertToCNF, runCYK } from '../engine/cfgEngine';

export default function AnalysisPage() {
  const { grammar } = useGrammar();
  const navigate = useNavigate();
  const [testStr, setTestStr] = useState('aabb');
  const [derivStep, setDerivStep] = useState(0);
  const [testResult, setTestResult] = useState(null);

  const derivation = useMemo(() => {
    if (!grammar?.isValid) return [];
    return getLeftmostDerivation(grammar, testStr);
  }, [grammar, testStr]);

  const handleTest = () => {
    if (!grammar?.isValid) return;
    try {
      const { cnfGrammar } = convertToCNF(grammar);
      const res = runCYK(cnfGrammar, testStr.trim());
      setTestResult(res.accepted);
    } catch { setTestResult(false); }
  };

  if (!grammar?.isValid) {
    return (
      <div style={{ paddingTop: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--on-surface-variant)', marginBottom: 16 }}>manage_search</span>
        <h2 style={{ fontFamily: 'var(--font-hand)', fontSize: 28, color: 'var(--ink-primary)', marginBottom: 8 }}>No Grammar Loaded</h2>
        <button className="btn btn-primary" onClick={() => navigate('/grammar')}>Go to CFG Input</button>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 110 }}>
      <div className="notebook-lines" style={{ minHeight: 'calc(100vh - 110px)', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: 13, color: 'var(--ink-secondary)', marginBottom: 4 }}>Home › Analysis</div>
            <h1 style={{ fontFamily: 'var(--font-hand)', fontSize: 36, fontWeight: 700, color: 'var(--ink-primary)' }}>🔍 Grammar Analysis</h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

            {/* Productions */}
            <div style={{ background: 'var(--surface-low)', border: '2px solid var(--ink-primary)', borderRadius: 12, padding: '1.5rem', boxShadow: 'var(--shadow-md)', transform: 'rotate(-0.5deg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--ink-primary)' }}>assignment</span>
                <h2 style={{ fontFamily: 'var(--font-hand)', fontSize: 20, fontWeight: 700, color: 'var(--ink-primary)' }}>Grammar Productions</h2>
              </div>
              {Object.entries(grammar.productions).map(([nt, rules]) => (
                <div key={nt} style={{ marginBottom: 10, padding: '8px 12px', background: 'var(--surface-white)', borderRadius: 8, border: '1.5px solid rgba(28,35,64,0.12)' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    <span className="token-nonterminal" style={{ fontSize: 15 }}>{nt}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink-secondary)' }}>→</span>
                    {rules.map((rule, ri) => (
                      <React.Fragment key={ri}>
                        {ri > 0 && <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--on-surface-variant)', fontSize: 14 }}>|</span>}
                        <span style={{ display: 'flex', gap: 3 }}>
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
                </div>
              ))}
            </div>

            {/* Derivation */}
            <div style={{ background: 'var(--surface-low)', border: '2px solid var(--ink-primary)', borderRadius: 12, padding: '1.5rem', boxShadow: 'var(--shadow-md)', transform: 'rotate(0.5deg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--ink-primary)' }}>menu_book</span>
                <h2 style={{ fontFamily: 'var(--font-hand)', fontSize: 20, fontWeight: 700, color: 'var(--ink-primary)' }}>Step-by-Step Derivation</h2>
              </div>
              {/* String input */}
              <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
                <input
                  value={testStr}
                  onChange={e => { setTestStr(e.target.value); setDerivStep(0); setTestResult(null); }}
                  placeholder="Test string..."
                  style={{ flex: 1, padding: '8px 12px', border: '2px solid var(--ink-primary)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, outline: 'none' }}
                />
                <button className="btn btn-primary btn-sm" onClick={handleTest}>
                  Test
                </button>
              </div>
              {testResult !== null && (
                <div style={{ marginBottom: 10 }}>
                  <span className={testResult ? 'chip-accepted' : 'chip-rejected'}>
                    {testResult ? '✓ ACCEPTED' : '✗ REJECTED'}
                  </span>
                </div>
              )}
              {/* Derivation steps */}
              {derivation.length > 0 ? (
                <>
                  <div style={{ marginBottom: 8 }}>
                    {derivation.slice(0, derivStep + 1).map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        {i > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-secondary)', minWidth: 20 }}>⇒</span>}
                        <div style={{
                          padding: '4px 10px',
                          background: i === derivStep ? 'var(--yellow-light)' : 'var(--surface-white)',
                          border: `1.5px solid ${i === derivStep ? 'var(--yellow)' : 'rgba(28,35,64,0.12)'}`,
                          borderRadius: 6,
                          fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
                        }}>
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setDerivStep(s => Math.max(0, s - 1))} disabled={derivStep === 0}>← Prev</button>
                    <button className="btn btn-primary btn-sm" onClick={() => setDerivStep(s => Math.min(derivation.length - 1, s + 1))} disabled={derivStep >= derivation.length - 1}>Next →</button>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--on-surface-variant)', alignSelf: 'center' }}>
                      {derivStep + 1} / {derivation.length}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: 14, color: 'var(--on-surface-variant)' }}>
                  Type a string to see its derivation
                </div>
              )}
            </div>

            {/* Properties */}
            <div style={{ background: 'var(--surface-low)', border: '2px solid var(--ink-primary)', borderRadius: 12, padding: '1.5rem', boxShadow: 'var(--shadow-md)', transform: 'rotate(-1deg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--ink-primary)' }}>fact_check</span>
                <h2 style={{ fontFamily: 'var(--font-hand)', fontSize: 20, fontWeight: 700, color: 'var(--ink-primary)' }}>Properties Detected</h2>
              </div>
              {[
                { label: `Start Symbol: ${grammar.startSymbol}`, ok: true },
                { label: `${grammar.nonTerminals.length} Non-Terminal(s): ${grammar.nonTerminals.join(', ')}`, ok: true },
                { label: `${grammar.terminals.length} Terminal(s): ${grammar.terminals.join(', ')}`, ok: true },
                { label: 'Has ε-productions', ok: Object.values(grammar.productions).some(rules => rules.some(r => r[0] === 'ε')) },
                { label: 'Has unit productions (A → B)', ok: Object.values(grammar.productions).some(rules => rules.some(r => r.length === 1 && grammar.nonTerminals.includes(r[0]))) },
              ].map(({ label, ok }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8, padding: '6px 10px', background: 'var(--surface-white)', borderRadius: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: ok ? 'var(--sage)' : 'var(--on-surface-variant)', fontVariationSettings: "'FILL' 1", flexShrink: 0, marginTop: 2 }}>
                    {ok ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--on-surface)', lineHeight: 1.4 }}>{label}</span>
                </div>
              ))}
              <div style={{ marginTop: '1rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/converter')}>Convert to CNF →</button>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/cyk')}>CYK Test →</button>
              </div>
            </div>

            {/* Quick reference sticky notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="sticky-note">
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 4 }}>💡 REMINDER:</div>
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: 14, color: 'var(--ink-primary)' }}>
                  A CFG generates a Context-Free Language (Type-2 in Chomsky hierarchy). Every regular language is also context-free.
                </div>
              </div>
              <div style={{ background: 'rgba(91,143,168,0.15)', border: '1.5px solid var(--ink-chalk)', borderRadius: 8, padding: 12, transform: 'rotate(1deg)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--ink-chalk)', marginBottom: 4 }}>NOTATION:</div>
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: 13, color: 'var(--ink-primary)', lineHeight: 1.6 }}>
                  ε = empty string<br />
                  → = produces<br />
                  ⇒* = derives in 0+ steps<br />
                  L(G) = language of G
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
