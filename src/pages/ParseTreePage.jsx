import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGrammar } from '../context/GrammarContext';
import { buildParseTree } from '../engine/cfgEngine';

// Layout the tree nodes in a top-down layout
function layoutTree(node, depth = 0, pos = { x: 0 }, spacingX = 60, spacingY = 70) {
  if (!node.children || node.children.length === 0) {
    node.x = pos.x * spacingX;
    node.y = depth * spacingY + 40;
    pos.x++;
    return;
  }
  const startPos = pos.x;
  for (const child of node.children) {
    layoutTree(child, depth + 1, pos, spacingX, spacingY);
  }
  const endPos = pos.x - 1;
  node.x = ((startPos + endPos) / 2) * spacingX;
  node.y = depth * spacingY + 40;
}

function getTreeDimensions(node, minX = Infinity, maxX = -Infinity, maxY = -Infinity) {
  if (node.x < minX) minX = node.x;
  if (node.x > maxX) maxX = node.x;
  if (node.y > maxY) maxY = node.y;
  for (const child of (node.children || [])) {
    [minX, maxX, maxY] = getTreeDimensions(child, minX, maxX, maxY);
  }
  return [minX, maxX, maxY];
}

function TreeEdges({ node }) {
  return (
    <>
      {(node.children || []).map((child) => (
        <React.Fragment key={child.id}>
          <line
            x1={node.x} y1={node.y + 18}
            x2={child.x} y2={child.y - 18}
            stroke="#3D2B1F" strokeWidth="2"
            strokeLinecap="round"
          />
          <TreeEdges node={child} />
        </React.Fragment>
      ))}
    </>
  );
}

function TreeNodes({ node, ntList, startSymbol }) {
  const isNT = ntList.includes(node.symbol);
  const isStart = node.symbol === startSymbol && node.children?.length > 0;
  return (
    <>
      <g>
        {isNT ? (
          <>
            <circle cx={node.x} cy={node.y} r="18"
              fill={isStart ? 'var(--ink-primary)' : 'var(--secondary-container)'}
              stroke={isStart ? 'var(--ink-primary)' : 'var(--ink-secondary)'}
              strokeWidth="2" />
            <text x={node.x} y={node.y + 5}
              textAnchor="middle"
              fontFamily="Space Grotesk, sans-serif"
              fontSize="13" fontWeight="700"
              fill={isStart ? '#fff' : 'var(--on-secondary)'}>{node.symbol}</text>
          </>
        ) : node.symbol === 'ε' ? (
          <>
            <ellipse cx={node.x} cy={node.y} rx="16" ry="14"
              fill="var(--ink-lavender)" stroke="var(--ink-lavender)" strokeWidth="1.5" />
            <text x={node.x} y={node.y + 5}
              textAnchor="middle"
              fontFamily="Space Mono, monospace"
              fontSize="12" fontWeight="700" fill="#fff">ε</text>
          </>
        ) : (
          <>
            <rect x={node.x - 14} y={node.y - 14} width="28" height="24"
              rx="4"
              fill="var(--surface-high)"
              stroke="var(--ink-primary)" strokeWidth="1.5" />
            <text x={node.x} y={node.y + 4}
              textAnchor="middle"
              fontFamily="Space Mono, monospace"
              fontSize="13" fontWeight="700" fill="var(--ink-primary)">{node.symbol}</text>
          </>
        )}
      </g>
      {(node.children || []).map(child => (
        <TreeNodes key={child.id} node={child} ntList={ntList} startSymbol={startSymbol} />
      ))}
    </>
  );
}

export default function ParseTreePage() {
  const { grammar } = useGrammar();
  const navigate = useNavigate();
  const [inputStr, setInputStr] = useState('aabb');
  const [treeResult, setTreeResult] = useState(null);
  const [zoom, setZoom] = useState(1);

  const handleBuild = () => {
    if (!grammar?.isValid) return;
    const result = buildParseTree(grammar, inputStr.trim());
    if (result.tree) {
      layoutTree(result.tree);
    }
    setTreeResult(result);
  };

  const svgInfo = useMemo(() => {
    if (!treeResult?.tree) return { width: 400, height: 200, offsetX: 20 };
    const [minX, maxX, maxY] = getTreeDimensions(treeResult.tree);
    const width = Math.max(maxX - minX + 100, 400);
    const height = maxY + 80;
    const offsetX = -minX + 50;
    return { width, height, offsetX };
  }, [treeResult]);

  if (!grammar?.isValid) {
    return (
      <div style={{ paddingTop: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--on-surface-variant)', marginBottom: 16 }}>account_tree</span>
        <h2 style={{ fontFamily: 'var(--font-hand)', fontSize: 28, color: 'var(--ink-primary)', marginBottom: 8 }}>No Grammar Loaded</h2>
        <button className="btn btn-primary" onClick={() => navigate('/grammar')}>Go to CFG Input</button>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 110 }}>
      <div className="graph-paper" style={{ minHeight: 'calc(100vh - 110px)', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: 13, color: 'var(--ink-secondary)', marginBottom: 4 }}>Home › Parse Tree Visualizer</div>
            <h1 style={{ fontFamily: 'var(--font-hand)', fontSize: 36, fontWeight: 700, color: 'var(--ink-primary)' }}>🌳 Parse Tree Visualizer</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              See how your string grows from the grammar — organic, hand-drawn derivation!
            </p>
          </div>

          {/* Controls */}
          <div style={{ background: 'var(--surface-low)', border: '2px solid var(--ink-primary)', borderRadius: 12, padding: '1.5rem', boxShadow: 'var(--shadow-md)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontFamily: 'var(--font-hand)', fontSize: 16, fontWeight: 700, color: 'var(--ink-primary)', display: 'block', marginBottom: 6 }}>
                  Input String:
                </label>
                <input
                  value={inputStr}
                  onChange={e => { setInputStr(e.target.value); setTreeResult(null); }}
                  onKeyDown={e => e.key === 'Enter' && handleBuild()}
                  placeholder="e.g. aabb"
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
              <button className="btn btn-primary btn-lg" onClick={handleBuild}>
                <span className="material-symbols-outlined">account_tree</span>
                Grow Tree
              </button>
              {treeResult && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>−</button>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, alignSelf: 'center', color: 'var(--on-surface-variant)' }}>{Math.round(zoom * 100)}%</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>+</button>
                </div>
              )}
            </div>
          </div>

          {/* Tree Canvas */}
          {treeResult && (
            <div>
              {/* Status */}
              <div style={{ marginBottom: '1rem', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={treeResult.success ? 'chip-accepted' : 'chip-rejected'}>
                  {treeResult.success ? `✓ Parse tree built for "${inputStr}"` : `✗ Cannot parse "${inputStr}" with this grammar`}
                </span>
                {treeResult.success && (
                  <span style={{ fontFamily: 'var(--font-hand)', fontSize: 14, color: 'var(--ink-secondary)' }}>
                    Leftmost derivation shown
                  </span>
                )}
              </div>

              {treeResult.success && treeResult.tree ? (
                <div style={{ background: 'var(--surface-white)', border: '2px solid var(--ink-primary)', borderRadius: 12, padding: '1rem', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
                  <svg
                    width={svgInfo.width * zoom}
                    height={svgInfo.height * zoom}
                    viewBox={`0 0 ${svgInfo.width} ${svgInfo.height}`}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ display: 'block', margin: '0 auto' }}
                  >
                    <g transform={`translate(${svgInfo.offsetX}, 0)`}>
                      <TreeEdges node={treeResult.tree} />
                      <TreeNodes node={treeResult.tree} ntList={grammar.nonTerminals} startSymbol={grammar.startSymbol} />
                    </g>

                    {/* Yield string at bottom */}
                    <g transform={`translate(${svgInfo.offsetX}, 0)`}>
                      {/* Dotted underline connecting leaves */}
                    </g>
                  </svg>

                  {/* Legend */}
                  <div style={{ display: 'flex', gap: 16, padding: '12px 16px', borderTop: '1px solid var(--surface-dim)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="24" height="24"><circle cx="12" cy="12" r="10" fill="var(--ink-primary)" /></svg>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--on-surface-variant)' }}>Start Symbol</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="24" height="24"><circle cx="12" cy="12" r="10" fill="var(--secondary-container)" stroke="var(--ink-secondary)" strokeWidth="2" /></svg>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--on-surface-variant)' }}>Non-terminal</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="24" height="24"><rect x="2" y="4" width="20" height="16" rx="3" fill="var(--surface-high)" stroke="var(--ink-primary)" strokeWidth="1.5" /></svg>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--on-surface-variant)' }}>Terminal (leaf)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="24" height="24"><ellipse cx="12" cy="12" rx="11" ry="10" fill="var(--ink-lavender)" /></svg>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--on-surface-variant)' }}>ε (empty)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center', padding: '3rem',
                  background: 'var(--error-container)',
                  border: '2px solid var(--error)',
                  borderRadius: 12,
                }}>
                  <span style={{ fontSize: 48 }}>❌</span>
                  <div style={{ fontFamily: 'var(--font-hand)', fontSize: 22, fontWeight: 700, color: 'var(--error)', marginTop: 8 }}>
                    Cannot build parse tree for "{inputStr}"
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 8 }}>
                    This string is not in the language L(G), or the parser couldn't find a derivation with this grammar.
                  </div>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/cyk')}>
                    Verify with CYK →
                  </button>
                </div>
              )}
            </div>
          )}

          {!treeResult && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 64, display: 'block', marginBottom: 16, opacity: 0.4 }}>account_tree</span>
              <div style={{ fontFamily: 'var(--font-hand)', fontSize: 20, fontWeight: 700 }}>Enter a string and click "Grow Tree"</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, marginTop: 8 }}>Try "aabb" or "ab" with the default grammar</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
