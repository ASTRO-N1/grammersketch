import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useGrammar } from '../context/GrammarContext';

const TABS = [
  { path: '/',         label: 'Home',       icon: 'home' },
  { path: '/grammar',  label: 'CFG Input',  icon: 'edit_note' },
  { path: '/analysis', label: 'Analysis',   icon: 'manage_search' },
  { path: '/converter',label: 'CNF / GNF',  icon: 'transform' },
  { path: '/cyk',      label: 'CYK Test',   icon: 'grid_on' },
  { path: '/pda',      label: 'PDA Sim',    icon: 'smart_toy' },
  { path: '/parsetree',label: 'Parse Tree', icon: 'account_tree' },
];

export default function NavBar() {
  const { grammar } = useGrammar();
  const location = useLocation();

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(245,240,232,0.96)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 16px rgba(28,35,64,0.07)',
      borderBottom: '2px solid rgba(28,35,64,0.12)',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem', height: '60px',
      }}>
        {/* Logo */}
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--ink-primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-hand)', fontSize: 18, fontWeight: 700,
          }}>G</div>
          <div>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: 22, fontWeight: 700, color: 'var(--ink-primary)', lineHeight: 1 }}>
              GrammarSketch
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-secondary)', lineHeight: 1 }}>
              Master CFGs & PDAs — One derivation at a time ✏️
            </div>
          </div>
        </NavLink>

        {/* Active grammar badge */}
        {grammar?.isValid && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '4px 12px',
            background: 'var(--surface-high)',
            border: '1.5px solid var(--ink-primary)',
            borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
            boxShadow: 'var(--shadow-sm)',
            transform: 'rotate(-0.5deg)',
          }} className="hide-mobile">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-secondary)', fontWeight: 700 }}>
              Active Grammar:
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-primary)', fontWeight: 700 }}>
              {grammar.startSymbol} → {Object.values(grammar.productions)[0]?.map(r => r.join('')).join(' | ') || '?'}
            </span>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: grammar.isValid ? 'var(--sage)' : 'var(--coral)',
              flexShrink: 0,
            }} />
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <nav style={{
        display: 'flex', alignItems: 'flex-end', gap: 4,
        padding: '0 1.5rem 0',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        background: 'var(--surface-low)',
        borderTop: '1px solid rgba(28,35,64,0.08)',
      }}>
        {TABS.map((tab, i) => {
          const isActive = location.pathname === tab.path;
          const rotations = [-1, 0.8, -0.5, 1.2, -1, 0.7, -0.8];
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 14px',
                marginBottom: isActive ? 0 : 2,
                border: '2px solid var(--ink-primary)',
                borderBottom: isActive ? '2px solid var(--surface-low)' : '2px solid var(--ink-primary)',
                borderRadius: '8px 8px 0 0',
                background: isActive ? 'var(--ink-primary)' : 'var(--surface)',
                color: isActive ? '#fff' : 'var(--on-surface-variant)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.02em',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transform: `rotate(${rotations[i] || 0}deg) ${isActive ? 'translateY(-1px)' : ''}`,
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{tab.icon}</span>
              {tab.label}
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}
