import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGrammar } from '../context/GrammarContext';
import { runCYK, convertToCNF } from '../engine/cfgEngine';
import { EXAMPLE_GRAMMARS } from '../engine/cfgEngine';

export default function HomePage() {
  const { grammar, loadExample } = useGrammar();
  const navigate = useNavigate();
  const [quickString, setQuickString] = useState('aabb');
  const [quickResult, setQuickResult] = useState(null);

  const handleQuickTest = () => {
    if (!grammar?.isValid) { setQuickResult({ error: 'No valid grammar loaded. Go to CFG Input first.' }); return; }
    try {
      const { cnfGrammar } = convertToCNF(grammar);
      const result = runCYK(cnfGrammar, quickString);
      setQuickResult({ accepted: result.accepted, string: quickString });
    } catch (e) {
      setQuickResult({ error: e.message });
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 100px)', paddingTop: 100 }}>
      {/* Margin notes */}
      <div className="hide-mobile" style={{
        position: 'fixed', top: 120, left: 12, width: 170,
        padding: '10px 12px',
        background: 'var(--secondary-container)',
        border: '2px solid var(--ink-primary)',
        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
        boxShadow: 'var(--shadow-sm)',
        transform: 'rotate(-2deg)',
        zIndex: 50, pointerEvents: 'none',
      }}>
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: 14, fontWeight: 700, color: 'var(--ink-secondary)' }}>Margin Note:</div>
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: 13, color: 'var(--on-secondary)', lineHeight: 1.4, marginTop: 4 }}>
          L = {'{'}a^n b^n | n ≥ 0{'}'} is non-regular but context-free!
        </div>
      </div>

      <main className="notebook-lines" style={{ minHeight: 'calc(100vh - 100px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

          {/* ── Hero Section ── */}
          <section style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}>

            {/* Stamp badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 18px',
              background: 'var(--yellow-light)',
              border: '2px solid var(--yellow)',
              borderRadius: 999,
              boxShadow: '2px 2px 0px var(--ink-secondary)',
              transform: 'rotate(-1deg)',
              marginBottom: '1rem',
            }}>
              <span className="material-symbols-outlined" style={{ color: '#b07d10', fontSize: 18, fontVariationSettings: "'FILL' 1" }}>star</span>
              <span style={{ fontFamily: 'var(--font-hand)', fontSize: 16, fontWeight: 700, color: 'var(--ink-primary)' }}>
                Interactive Formal Languages Workbook
              </span>
              <span className="material-symbols-outlined" style={{ color: '#b07d10', fontSize: 18, fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: 'var(--font-hand)', fontSize: 'clamp(48px, 8vw, 88px)',
              fontWeight: 700, lineHeight: 1, color: 'var(--ink-primary)',
              marginBottom: 8,
              textShadow: '3px 3px 0px rgba(248,218,200,0.8)',
            }}>
              GrammarSketch
            </h1>

            {/* Wavy underline SVG */}
            <svg width="100%" height="16" viewBox="0 0 400 16" preserveAspectRatio="none" style={{ maxWidth: 500, display: 'block', margin: '0 auto 12px', opacity: 0.7 }}>
              <path d="M2 10 Q 20 2, 40 10 T 80 10 T 120 10 T 160 10 T 200 10 T 240 10 T 280 10 T 320 10 T 360 10 T 398 10"
                fill="none" stroke="var(--ink-secondary)" strokeWidth="3" strokeLinecap="round" />
            </svg>

            <p style={{
              fontFamily: 'var(--font-hand)', fontSize: 22, fontWeight: 600,
              color: 'var(--ink-secondary)', marginBottom: '1.5rem',
            }}>
              Master CFGs and PDAs — One derivation at a time ✏️
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/grammar')}>
                <span className="material-symbols-outlined">menu_book</span>
                Open Today's Lecture Notebook
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => { loadExample("Equal a's and b's"); navigate('/grammar'); }}>
                <span className="material-symbols-outlined">auto_fix_high</span>
                Try Example: aⁿbⁿ
              </button>
            </div>
          </section>

          {/* ── Open Notebook Spread ── */}
          <section style={{ marginBottom: '3rem' }}>
            <div style={{
              background: '#f6f1e8',
              borderRadius: 16,
              boxShadow: '6px 8px 0px var(--ink-primary)',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              position: 'relative',
              border: '2px solid var(--ink-primary)',
            }}>
              {/* Tape */}
              <div style={{ position: 'absolute', top: -10, left: '20%', width: 100, height: 24, background: 'rgba(251,220,168,0.7)', transform: 'rotate(-3deg)', borderRadius: 2, zIndex: 3 }} />
              <div style={{ position: 'absolute', top: -10, right: '20%', width: 100, height: 24, background: 'rgba(251,220,168,0.7)', transform: 'rotate(2deg)', borderRadius: 2, zIndex: 3 }} />

              {/* Left page: Grammar */}
              <div className="notebook-lines" style={{ padding: '1.5rem', background: 'var(--surface-low)', borderRight: '2px solid rgba(61,43,31,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(61,43,31,0.15)', paddingBottom: 8, marginBottom: 16 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase' }}>Grammar Rule Set • ⟨G⟩</span>
                  <span style={{ fontFamily: 'var(--font-hand)', fontSize: 16, fontWeight: 700, color: 'var(--ink-secondary)' }}>p. 01</span>
                </div>

                {/* Sticky */}
                <div className="sticky-note" style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 4 }}>📌 NOTEBOOK AXIOM:</div>
                  <div style={{ fontFamily: 'var(--font-hand)', fontSize: 14, fontWeight: 700, color: 'var(--ink-primary)' }}>G = (V, Σ, R, S)</div>
                </div>

                {/* Productions */}
                <div style={{ background: 'var(--surface-container)', borderRadius: 10, padding: '1rem', marginBottom: 12 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: 8, textTransform: 'uppercase' }}>Production Rules:</div>
                  {grammar?.isValid && Object.entries(grammar.productions).map(([nt, rules]) => (
                    <div key={nt} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', background: 'var(--surface)', borderRadius: 6, marginBottom: 4 }}>
                      <span style={{ padding: '2px 8px', background: 'var(--tertiary-fixed)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700 }}>{nt}</span>
                      <span style={{ color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)' }}>→</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--ink-primary)' }}>
                        {rules.map(r => r.join(' ')).join(' | ')}
                      </span>
                    </div>
                  ))}
                  {!grammar?.isValid && (
                    <div style={{ fontFamily: 'var(--font-hand)', color: 'var(--ink-secondary)', fontSize: 14 }}>
                      No grammar loaded. Go to CFG Input →
                    </div>
                  )}
                </div>

                {/* Derivation trace */}
                <div style={{ background: 'var(--surface-highest)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Stepwise Leftmost Derivation:
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-primary)', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, textDecoration: 'underline', textDecorationColor: 'var(--ink-secondary)' }}>S</span>
                    <span>⇒</span>
                    <span>a<span style={{ fontWeight: 700, textDecoration: 'underline', textDecorationColor: 'var(--ink-secondary)' }}>S</span>b</span>
                    <span>⇒</span>
                    <span>aa<span style={{ fontWeight: 700, textDecoration: 'underline', textDecorationColor: 'var(--ink-secondary)' }}>S</span>bb</span>
                    <span>⇒</span>
                    <span>aa<span style={{ color: 'var(--ink-secondary)', fontWeight: 700 }}>ε</span>bb</span>
                    <span>=</span>
                    <span style={{ background: 'var(--ink-primary)', color: '#fff', padding: '1px 8px', borderRadius: 4, fontWeight: 700 }}>aabb</span>
                    <span className="material-symbols-outlined" style={{ color: 'var(--sage)', fontSize: 18, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                </div>

                <div style={{ fontFamily: 'var(--font-hand)', fontSize: 15, color: 'var(--ink-secondary)', fontWeight: 700, marginTop: 12 }}>
                  L(G) = {'{'} aⁿbⁿ | n ≥ 0 {'}'}
                </div>
              </div>

              {/* Right page: PDA Diagram */}
              <div style={{ padding: '1.5rem', background: 'var(--surface-container)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(61,43,31,0.15)', paddingBottom: 8, marginBottom: 16 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--ink-primary)', textTransform: 'uppercase' }}>Automaton M = (Q, Σ, Γ, δ, q₀, Z₀, F)</span>
                  <span style={{ fontFamily: 'var(--font-hand)', fontSize: 16, fontWeight: 700, color: 'var(--ink-primary)' }}>p. 02</span>
                </div>

                {/* PDA SVG */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <svg width="100%" height="130" viewBox="0 0 460 140" fill="none" style={{ maxWidth: 460 }}>
                    <defs>
                      <marker id="arrow-home" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                        <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--ink-primary)" />
                      </marker>
                    </defs>
                    {/* q0 */}
                    <circle cx="70" cy="70" r="28" fill="#f8f3eb" stroke="var(--ink-primary)" strokeWidth="2.5" />
                    <text x="70" y="76" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="16" fontWeight="700" fill="var(--ink-primary)">q₀</text>
                    {/* Start arrow */}
                    <line x1="20" y1="70" x2="41" y2="70" stroke="var(--ink-primary)" strokeWidth="2.5" markerEnd="url(#arrow-home)" />
                    <circle cx="20" cy="70" r="3" fill="var(--ink-primary)" />
                    {/* Self-loop q0 */}
                    <path d="M 58 44 C 45 10, 95 10, 82 44" stroke="var(--ink-secondary)" strokeWidth="2" />
                    <text x="70" y="16" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="10" fontWeight="bold" fill="var(--ink-secondary)">a,Z₀→aZ₀</text>
                    {/* q0→q1 */}
                    <line x1="98" y1="70" x2="180" y2="70" stroke="var(--ink-primary)" strokeWidth="2.5" markerEnd="url(#arrow-home)" />
                    <text x="140" y="62" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="10" fontWeight="bold" fill="var(--ink-primary)">b,a→ε</text>
                    {/* q1 */}
                    <circle cx="210" cy="70" r="28" fill="#f8f3eb" stroke="var(--ink-primary)" strokeWidth="2.5" />
                    <text x="210" y="76" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="16" fontWeight="700" fill="var(--ink-primary)">q₁</text>
                    {/* Self-loop q1 */}
                    <path d="M 198 44 C 185 10, 235 10, 222 44" stroke="var(--ink-secondary)" strokeWidth="2" />
                    <text x="210" y="16" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="10" fontWeight="bold" fill="var(--ink-secondary)">b,a→ε</text>
                    {/* q1→q2 */}
                    <line x1="238" y1="70" x2="320" y2="70" stroke="var(--ink-primary)" strokeWidth="2.5" markerEnd="url(#arrow-home)" />
                    <text x="280" y="62" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="10" fontWeight="bold" fill="var(--ink-primary)">ε,Z₀→Z₀</text>
                    {/* q2 accept */}
                    <circle cx="350" cy="70" r="28" fill="#dde1ff" stroke="var(--ink-primary)" strokeWidth="2.5" />
                    <circle cx="350" cy="70" r="22" fill="none" stroke="var(--ink-primary)" strokeWidth="1.8" />
                    <text x="350" y="76" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="16" fontWeight="700" fill="var(--primary)">q₂</text>
                    <text x="350" y="112" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="10" fontWeight="bold" fill="var(--primary)">[ACCEPT]</text>
                  </svg>
                </div>

                {/* Tape & Stack */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: 'var(--surface-high)', padding: 10, borderRadius: 8 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Input Tape</div>
                    <div style={{ display: 'flex', gap: 4, fontFamily: 'var(--font-mono)' }}>
                      {['a','a','b','b'].map((ch, i) => (
                        <div key={i} style={{
                          width: 30, height: 30, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 14,
                          background: i === 2 ? 'var(--ink-primary)' : 'var(--surface)',
                          color: i === 2 ? '#fff' : 'var(--on-surface)',
                          opacity: i < 2 ? 0.4 : 1,
                          transform: i === 2 ? 'scale(1.1)' : 'none',
                          border: '1px solid rgba(28,35,64,0.2)',
                        }}>{ch}</div>
                      ))}
                    </div>
                    <div style={{ fontFamily: 'var(--font-hand)', fontSize: 12, color: 'var(--ink-secondary)', marginTop: 4 }}>↑ Head at index [2]</div>
                  </div>
                  <div style={{ background: 'var(--surface-high)', padding: 10, borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase' }}>Stack (LIFO)</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-primary)' }}>Top ↓</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <div style={{ padding: '4px 10px', background: 'var(--secondary-container)', color: 'var(--on-secondary)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>a</div>
                      <div style={{ padding: '4px 10px', background: 'var(--surface-highest)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>Z₀</div>
                      <span style={{ fontFamily: 'var(--font-hand)', fontSize: 12, color: 'var(--ink-secondary)', marginLeft: 'auto' }}>Popping 'a'</span>
                    </div>
                  </div>
                </div>

                {/* Pencil deco */}
                <div className="hide-mobile" style={{
                  position: 'absolute', bottom: -12, right: 48,
                  transform: 'rotate(-8deg)',
                  display: 'flex', alignItems: 'center',
                  borderRadius: 999, overflow: 'hidden',
                  boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  pointerEvents: 'none',
                }}>
                  <div style={{ width: 8, height: 12, background: '#374151', borderRadius: '2px 0 0 2px' }} />
                  <div style={{ width: 120, height: 12, background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 7, color: '#78350f', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>HB No.2</span>
                  </div>
                  <div style={{ width: 12, height: 12, background: '#FCA5A5', borderRadius: '0 2px 2px 0' }} />
                </div>
              </div>
            </div>
          </section>

          {/* ── Module Cards ── */}
          <section style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: '1.5rem', borderBottom: '2px solid rgba(28,35,64,0.12)', paddingBottom: 8 }}>
              <div style={{ width: 32, height: 32, background: 'var(--ink-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700 }}>¶</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink-primary)' }}>Interactive Study Benches</h2>
              <span className="hide-mobile" style={{ fontFamily: 'var(--font-hand)', fontSize: 18, color: 'var(--ink-secondary)', fontWeight: 700 }}>Select a workbench card below ↓</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {[
                { icon: 'edit_note', label: 'Grammar Workshop', title: 'Enter Your CFG', desc: 'Type custom productions with non-terminals, union pipes, and epsilon. Instant grammar syntax validation.', path: '/grammar', rotate: -1, preview: 'S → a S b | ε\nA → 0 A 1 | #' },
                { icon: 'transform', label: 'Transformation Lab', title: 'CNF & GNF Converter', desc: 'Step through Epsilon removal, Unit rule elimination, and Chomsky / Greibach Normal Form reductions.', path: '/converter', rotate: 1.2, preview: 'CFG → −ε → Unit → CNF → GNF' },
                { icon: 'account_tree', label: 'Botanical Derivations', title: 'Parse Tree Viz', desc: 'Render dynamic syntactic parse trees. Detect grammar ambiguity with branching derivations.', path: '/parsetree', rotate: -1.3, isTree: true },
                { icon: 'smart_toy', label: 'State Machine Stage', title: 'PDA Simulator', desc: 'Execute step-by-step pushdown automata. Watch stack contents rise and fall in real-time.', path: '/pda', rotate: 0.8, preview: 'q₀ → q₁ → qₐ (ACCEPT)' },
              ].map((card) => (
                <div key={card.path} onClick={() => navigate(card.path)} style={{
                  background: '#f7f2ea',
                  border: '2px solid var(--ink-primary)',
                  borderRadius: 16,
                  padding: '1.25rem',
                  boxShadow: '4px 4px 0px var(--ink-primary)',
                  transform: `rotate(${card.rotate}deg)`,
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  minHeight: 240,
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'rotate(0deg) translateY(-4px)'; e.currentTarget.style.boxShadow = '6px 6px 0px var(--ink-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${card.rotate}deg)`; e.currentTarget.style.boxShadow = '4px 4px 0px var(--ink-primary)'; }}
                >
                  {/* Tape decoration */}
                  <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%) rotate(1deg)', width: 70, height: 20, background: 'rgba(251,220,168,0.8)', borderRadius: 2 }} />

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ width: 36, height: 36, background: 'var(--surface-high)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--ink-primary)' }}>{card.icon}</span>
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', background: 'var(--secondary-container)', padding: '2px 8px', borderRadius: 4 }}>
                        Module 0{['/grammar','/converter','/parsetree','/pda'].indexOf(card.path)+1}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-hand)', fontSize: 16, fontWeight: 700, color: 'var(--ink-secondary)', marginBottom: 2 }}>{card.label}</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 8 }}>{card.title}</h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.5, marginBottom: 12 }}>{card.desc}</p>

                    {card.preview && (
                      <div style={{ background: 'var(--surface-container)', borderRadius: 8, padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-primary)', marginBottom: 12, whiteSpace: 'pre-line' }}>
                        {card.preview}
                      </div>
                    )}
                    {card.isTree && (
                      <div style={{ background: 'var(--surface-container)', borderRadius: 8, padding: 8, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                        <svg width="100" height="55" viewBox="0 0 120 60" fill="none">
                          <circle cx="60" cy="12" r="8" fill="var(--ink-primary)" />
                          <text x="60" y="16" textAnchor="middle" fontFamily="Space Grotesk" fontSize="9" fontWeight="bold" fill="#fff">S</text>
                          <line x1="54" y1="18" x2="25" y2="45" stroke="var(--ink-secondary)" strokeWidth="1.5" />
                          <line x1="60" y1="20" x2="60" y2="42" stroke="var(--ink-secondary)" strokeWidth="1.5" />
                          <line x1="66" y1="18" x2="95" y2="45" stroke="var(--ink-secondary)" strokeWidth="1.5" />
                          <rect x="18" y="45" width="14" height="12" rx="2" fill="var(--surface-high)" stroke="var(--ink-primary)" strokeWidth="1" />
                          <text x="25" y="54" textAnchor="middle" fontFamily="Space Mono" fontSize="8" fontWeight="bold" fill="var(--primary)">a</text>
                          <circle cx="60" cy="48" r="6" fill="var(--secondary-container)" stroke="var(--ink-secondary)" strokeWidth="1" />
                          <text x="60" y="51" textAnchor="middle" fontFamily="Space Grotesk" fontSize="7" fontWeight="bold" fill="var(--on-secondary)">S</text>
                          <rect x="88" y="45" width="14" height="12" rx="2" fill="var(--surface-high)" stroke="var(--ink-primary)" strokeWidth="1" />
                          <text x="95" y="54" textAnchor="middle" fontFamily="Space Mono" fontSize="8" fontWeight="bold" fill="var(--primary)">b</text>
                        </svg>
                      </div>
                    )}
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    {card.title === 'Enter Your CFG' ? 'Start Writing' : card.title === 'CNF & GNF Converter' ? 'Transform' : card.title === 'Parse Tree Viz' ? 'Grow Tree' : 'Run Tape'}
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ── Quick CYK Test Banner ── */}
          <section>
            <div style={{
              background: 'var(--surface-high)',
              border: '2px solid var(--ink-primary)',
              borderRadius: 16,
              padding: '1.5rem 2rem',
              boxShadow: '4px 4px 0px var(--ink-primary)',
              display: 'flex', flexWrap: 'wrap', gap: '1.5rem',
              alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--surface-container)', padding: '2px 10px', borderRadius: 4, marginBottom: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ink-primary)', animation: 'ping 1s ease-in-out infinite', display: 'inline-block' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--ink-primary)', textTransform: 'uppercase' }}>Quick CYK Membership Test</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 4 }}>Test a String Right Now</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--on-surface-variant)' }}>
                  Verify against active grammar: <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-primary)' }}>
                    {grammar?.startSymbol || 'S'} → {Object.values(grammar?.productions || {})[0]?.map(r => r.join('')).join(' | ') || '?'}
                  </code>
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  value={quickString}
                  onChange={e => setQuickString(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleQuickTest()}
                  placeholder="e.g. aabb, aaabbb"
                  style={{
                    padding: '10px 14px',
                    background: 'var(--surface-white)',
                    border: '2px solid var(--ink-primary)',
                    borderRadius: 10,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 14, fontWeight: 700,
                    color: 'var(--ink-primary)',
                    outline: 'none',
                    width: 200,
                  }}
                />
                <button className="btn btn-primary" onClick={handleQuickTest}>
                  <span className="material-symbols-outlined">rule</span>
                  Verify Derivation
                </button>
              </div>

              {quickResult && (
                <div style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: quickResult.error ? 'var(--error-container)' : quickResult.accepted ? 'rgba(39,174,96,0.12)' : 'var(--error-container)',
                  border: `2px solid ${quickResult.error ? 'var(--error)' : quickResult.accepted ? 'var(--sage)' : 'var(--error)'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700 }}>
                    <span className="material-symbols-outlined" style={{ color: quickResult.error ? 'var(--error)' : quickResult.accepted ? 'var(--sage)' : 'var(--error)', fontVariationSettings: "'FILL' 1" }}>
                      {quickResult.error ? 'error' : quickResult.accepted ? 'task_alt' : 'cancel'}
                    </span>
                    {quickResult.error
                      ? quickResult.error
                      : quickResult.accepted
                        ? `✓ String '${quickResult.string}' is ACCEPTED by the grammar!`
                        : `✗ String '${quickResult.string}' is REJECTED — not in the language.`}
                  </div>
                  <button onClick={() => setQuickResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>close</span>
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: 'var(--surface-high)', padding: '1rem 1.5rem', borderTop: '2px solid rgba(28,35,64,0.1)', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-hand)', fontSize: 16, fontWeight: 700, color: 'var(--ink-secondary)' }}>GrammarSketch v1.0</span>
          <span style={{ color: 'var(--on-surface-variant)', fontSize: 13 }}>•</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--on-surface-variant)' }}>Formal Languages & Pushdown Automata Lab</span>
        </div>
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: 14, color: 'var(--ink-secondary)', fontStyle: 'italic' }}>
          "A grammar without ambiguity is a thought neatly framed."
        </div>
      </footer>
    </div>
  );
}
