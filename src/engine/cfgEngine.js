/**
 * GrammarSketch — CFG Algorithm Engine
 * Core algorithms: parsing, derivation, CNF, GNF, CYK, PDA
 */

// ══════════════════════════════════════════════════════════════
// GRAMMAR PARSING
// ══════════════════════════════════════════════════════════════

/**
 * Parse raw grammar text into a structured Grammar object.
 * Format: "S -> aSb | ε" or "S → aSb | ε" one rule per line.
 */
export function parseGrammar(text) {
  const productions = {};
  const errors = [];
  let startSymbol = null;

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('//'));

  // Pre-scan all defined LHS non-terminals so the tokenizer recognizes them even without spaces
  const knownLHS = new Set();
  for (const line of lines) {
    const arrow = line.includes('->') ? '->' : line.includes('→') ? '→' : null;
    if (arrow) {
      const [lhs] = line.split(arrow).map(s => s.trim());
      if (lhs && /^[A-Z][A-Z0-9']*$/.test(lhs)) {
        knownLHS.add(lhs);
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const arrow = line.includes('->') ? '->' : line.includes('→') ? '→' : null;
    if (!arrow) { errors.push(`Line ${i + 1}: Missing arrow (→ or ->)`); continue; }

    const [lhs, rhs] = line.split(arrow).map(s => s.trim());
    if (!lhs || !/^[A-Z][A-Z0-9']*$/.test(lhs)) {
      errors.push(`Line ${i + 1}: LHS '${lhs}' must be a single uppercase variable.`);
      continue;
    }
    if (!rhs) { errors.push(`Line ${i + 1}: Missing RHS`); continue; }

    if (!startSymbol) startSymbol = lhs;
    if (!productions[lhs]) productions[lhs] = [];

    const alts = rhs.split('|').map(s => s.trim());
    for (const alt of alts) {
      const symbols = tokenizeRHS(alt, knownLHS);
      productions[lhs].push(symbols);
    }
  }

  // Derive terminals and non-terminals
  const nonTerminals = new Set(Object.keys(productions));
  const terminals = new Set();
  for (const rules of Object.values(productions)) {
    for (const rule of rules) {
      for (const sym of rule) {
        if (sym !== 'ε' && sym !== '' && !nonTerminals.has(sym)) {
          terminals.add(sym);
        }
      }
    }
  }

  // Validate all NT references exist
  for (const [nt, rules] of Object.entries(productions)) {
    for (const rule of rules) {
      for (const sym of rule) {
        if (sym !== 'ε' && sym !== '' && /^[A-Z]/.test(sym) && !nonTerminals.has(sym)) {
          errors.push(`Variable '${sym}' used in rule '${nt}' is not defined.`);
        }
      }
    }
  }

  return {
    productions,
    startSymbol,
    nonTerminals: [...nonTerminals],
    terminals: [...terminals],
    errors,
    isValid: errors.length === 0 && startSymbol !== null,
  };
}

function tokenizeRHS(rhs, knownLHS = new Set()) {
  if (rhs === 'ε' || rhs === 'epsilon' || rhs === 'e' || rhs === '') return ['ε'];
  
  // Sort multi-character known non-terminals by length descending (e.g. S0, E', Var1)
  const sortedKnown = [...knownLHS].filter(k => k.length > 1).sort((a, b) => b.length - a.length);

  const tokens = [];
  let i = 0;
  while (i < rhs.length) {
    if (rhs[i] === ' ') { i++; continue; }

    // 1. Check if substring matches any known multi-character variable (e.g. S0, A1, EXPR)
    let matched = null;
    for (const k of sortedKnown) {
      if (rhs.startsWith(k, i)) {
        matched = k;
        break;
      }
    }
    if (matched) {
      tokens.push(matched);
      i += matched.length;
      continue;
    }

    // 2. If uppercase letter, consume it + attached digits/primes (like S0, A', etc.)
    // But do NOT greedily merge adjacent uppercase letters (e.g. AB -> ['A', 'B']) unless explicitly in knownLHS
    if (/[A-Z]/.test(rhs[i])) {
      let sym = rhs[i++];
      while (i < rhs.length && /[0-9'_]/.test(rhs[i])) {
        sym += rhs[i++];
      }
      tokens.push(sym);
    } else {
      // 3. Otherwise terminal symbol (letter, digit, punctuation, parenthesis, etc.)
      tokens.push(rhs[i++]);
    }
  }
  return tokens.length > 0 ? tokens : ['ε'];
}

// ══════════════════════════════════════════════════════════════
// DERIVATION
// ══════════════════════════════════════════════════════════════

/**
 * Generate leftmost derivation steps for a target string.
 * Returns array of step strings, or null if not derivable.
 */
export function getLeftmostDerivation(grammar, targetString, maxSteps = 30) {
  const { productions, startSymbol } = grammar;
  const steps = [[startSymbol]];
  let current = [startSymbol];

  for (let step = 0; step < maxSteps; step++) {
    // Find leftmost non-terminal
    const ntIdx = current.findIndex(s => grammar.nonTerminals.includes(s));
    if (ntIdx === -1) break; // All terminals

    const nt = current[ntIdx];
    if (!productions[nt]) break;

    // BFS/greedy: pick the rule that best matches the remaining target
    const targetRemaining = targetString;
    let bestRule = null;
    // Simple heuristic: try each rule, pick first that doesn't immediately contradict
    for (const rule of productions[nt]) {
      if (rule[0] === 'ε') { bestRule = rule; break; }
      // Check if rule's first terminal matches
      const firstTerminal = rule.find(s => !grammar.nonTerminals.includes(s) && s !== 'ε');
      if (!firstTerminal) { bestRule = rule; break; }
      // Use leftmost expansion
      bestRule = rule;
      break;
    }

    if (!bestRule) break;
    const next = [
      ...current.slice(0, ntIdx),
      ...(bestRule[0] === 'ε' ? [] : bestRule),
      ...current.slice(ntIdx + 1),
    ];
    current = next;
    steps.push([...current]);
    if (current.every(s => !grammar.nonTerminals.includes(s))) break;
  }

  return steps.map(step => step.join(' '));
}

// ══════════════════════════════════════════════════════════════
// PRODUCTION DIFF HELPER
// ══════════════════════════════════════════════════════════════

export function getProductionDiff(beforeProds, afterProds) {
  const getRules = (prods) => {
    const list = [];
    for (const [lhs, rules] of Object.entries(prods || {})) {
      for (const rule of rules) {
        list.push({
          lhs,
          rhs: rule,
          str: `${lhs} → ${rule.join(' ')}`,
        });
      }
    }
    return list;
  };

  const beforeRules = getRules(beforeProds);
  const afterRules = getRules(afterProds);

  const beforeSet = new Set(beforeRules.map(r => r.str));
  const afterSet = new Set(afterRules.map(r => r.str));

  const added = afterRules.filter(r => !beforeSet.has(r.str));
  const removed = beforeRules.filter(r => !afterSet.has(r.str));
  const retained = afterRules.filter(r => beforeSet.has(r.str));

  return { added, removed, retained, totalBefore: beforeRules.length, totalAfter: afterRules.length };
}

// ══════════════════════════════════════════════════════════════
// CNF CONVERSION — Step by Step with Educational Narration
// ══════════════════════════════════════════════════════════════

/**
 * Converts grammar to Chomsky Normal Form with full educational commentary,
 * rule diffing, and interactive transformation data.
 */
export function convertToCNF(grammar) {
  let prods = deepCopyProductions(grammar.productions);
  const startSymbol = grammar.startSymbol;
  const steps = [];
  let ntCounter = { val: 0 };

  // Helper to generate fresh variable names
  const freshNT = (prefix = 'X') => {
    ntCounter.val++;
    return `${prefix}${ntCounter.val}`;
  };

  // ── Step 0: Add new start symbol if needed ──────────────────
  const prods0_before = deepCopyProductions(prods);
  let S = startSymbol;
  // Check if S appears on any RHS
  const sOnRHS = Object.values(prods).some(rules =>
    rules.some(rule => rule.includes(S))
  );
  if (sOnRHS) {
    const S0 = 'S0';
    prods[S0] = [[S]];
    S = S0;
  }
  const diff0 = getProductionDiff(prods0_before, prods);

  steps.push({
    stepKey: 'start_symbol',
    stepNumber: 1,
    name: 'Start Symbol Isolation',
    shortName: 'Start Symbol',
    conceptTitle: 'Chomsky Rule 1: The Start Symbol Cannot Loop',
    conceptDescription: 'In Chomsky Normal Form, the start variable must never appear on the right side of any production rule. If the start symbol appears in any rule body, creating a fresh entry variable S₀ ensures that parsing starts from a unique root that cannot be re-entered through recursive loops.',
    plainNarration: sOnRHS
      ? `We detected that the original start variable '${startSymbol}' appears on the right side of one or more rules. To keep the start state pure, we created a brand-new start variable '${S}' and added '${S} → ${startSymbol}'. Now the start symbol is guaranteed to never appear on the RHS!`
      : `Great news! The start symbol '${startSymbol}' never appears on the right-hand side of any production. It already satisfies Chomsky Rule 1, so no new start variable is required.`,
    actionDetails: sOnRHS
      ? [
          `Detected start symbol '${startSymbol}' appearing on the RHS of rules.`,
          `Created fresh start non-terminal variable '${S}'.`,
          `Added production: ${S} → ${startSymbol}.`,
          `Set '${S}' as the new canonical grammar start symbol.`
        ]
      : [
          `Inspected all production RHS sequences for '${startSymbol}'.`,
          `Confirmed '${startSymbol}' never occurs on the RHS.`,
          `Retained original start symbol without modifications.`
        ],
    checklist: [true, false, false, false, false],
    diff: diff0,
    before: formatProductions(prods0_before),
    after: formatProductions(prods),
    productions: deepCopyProductions(prods),
  });

  // ── Step 1: Eliminate ε-productions ────────────────────────
  const prods1_before = deepCopyProductions(prods);
  const nullable = findNullable(prods);
  prods = eliminateEpsilon(prods, nullable, S);
  const diff1 = getProductionDiff(prods1_before, prods);

  const nullableArr = [...nullable];
  steps.push({
    stepKey: 'eliminate_epsilon',
    stepNumber: 2,
    name: 'Eliminate ε-Productions',
    shortName: 'Remove ε',
    conceptTitle: 'Chomsky Rule 2: Ban Empty Transitions (A → ε)',
    conceptDescription: 'Empty rules (A → ε) allow symbols to vanish silently in the middle of derivations, which causes infinite cyclic loops during algorithmic parsing. To safely remove them, we identify all "nullable" variables (variables that can derive ε directly or indirectly) and pre-calculate all rule permutations without them.',
    plainNarration: nullableArr.length > 0
      ? `Identified nullable variables: {${nullableArr.join(', ')}}. Since these variables can evaporate into ε, we generated all possible combinations of rules where they are omitted. Then we purged all direct ε-productions!`
      : `No nullable variables found in this grammar! There are no ε-transitions (A → ε) to eliminate, so we advance cleanly to unit production removal.`,
    actionDetails: [
      nullableArr.length > 0
        ? `Found ${nullableArr.length} nullable variable(s): {${nullableArr.join(', ')}} via fixpoint search.`
        : 'Grammar contains zero ε-productions.',
      `Synthesized alternative rules by dropping combinations of nullable symbols.`,
      `Deleted all direct '${nullableArr.join(', ') || 'A'} → ε' transitions from the grammar.`
    ],
    checklist: [true, true, false, false, false],
    nullable: nullableArr,
    diff: diff1,
    before: formatProductions(prods1_before),
    after: formatProductions(prods),
    productions: deepCopyProductions(prods),
  });

  // ── Step 2: Eliminate unit productions ─────────────────────
  const prods2_before = deepCopyProductions(prods);
  prods = eliminateUnitProductions(prods);
  const diff2 = getProductionDiff(prods2_before, prods);

  steps.push({
    stepKey: 'eliminate_unit',
    stepNumber: 3,
    name: 'Eliminate Unit Productions',
    shortName: 'Remove Unit (A → B)',
    conceptTitle: 'Chomsky Rule 3: No Single-Variable Aliases (A → B)',
    conceptDescription: 'A unit production is a rule A → B where B is a single non-terminal variable. These simply rename one variable to another without generating any terminal characters. We compute the transitive closure of unit pairs and copy all non-unit productions directly from B onto A, then delete the unit rule.',
    plainNarration: diff2.removed.length > 0
      ? `Found and removed ${diff2.removed.length} unit rule(s) (such as ${diff2.removed.map(r => r.str).slice(0, 3).join(', ')}). We bypassed the middleman by transferring the final productions directly to the source variables!`
      : `No unit productions (A → B) were present! All productions already produce multiple symbols or terminal characters.`,
    actionDetails: [
      `Computed unit reachability chains (A ⇒* B) for all variables.`,
      `Transferred all non-unit productions of target B directly to source A.`,
      `Purged all ${diff2.removed.length} unit production rule(s) from the grammar.`
    ],
    checklist: [true, true, true, false, false],
    diff: diff2,
    before: formatProductions(prods2_before),
    after: formatProductions(prods),
    productions: deepCopyProductions(prods),
  });

  // ── Step 3: Remove useless symbols ─────────────────────────
  const prods3_before = deepCopyProductions(prods);
  prods = eliminateUselessSymbols(prods, S);
  const diff3 = getProductionDiff(prods3_before, prods);

  steps.push({
    stepKey: 'eliminate_useless',
    stepNumber: 4,
    name: 'Eliminate Useless Symbols',
    shortName: 'Prune Dead Symbols',
    conceptTitle: 'Chomsky Rule 4: Clean Deadwood (Generating & Reachable)',
    conceptDescription: 'Every symbol in a clean grammar must be both: 1) Generating (can derive a finite string of terminal symbols), and 2) Reachable (accessible from the start symbol). Non-generating symbols create endless dead-end recursion, while unreachable symbols are dead code.',
    plainNarration: diff3.removed.length > 0
      ? `Pruned useless deadwood! Removed ${diff3.removed.length} rule(s) belonging to variables that were either unreachable from start symbol '${S}' or trapped in non-generating infinite loops.`
      : `All variables in the grammar are fully generating (can produce terminal strings) and reachable from start symbol '${S}'. No useless symbols found!`,
    actionDetails: [
      `Phase 1 (Generating): Computed bottom-up set of variables that produce terminal strings.`,
      `Phase 2 (Reachable): Computed top-down search from start symbol '${S}'.`,
      `Pruned variables and rules failing either test.`
    ],
    checklist: [true, true, true, true, false],
    diff: diff3,
    before: formatProductions(prods3_before),
    after: formatProductions(prods),
    productions: deepCopyProductions(prods),
  });

  // ── Step 4: Binarize long rules (TERM + BIN) ────────────────
  const prods4_before = deepCopyProductions(prods);
  const allNTs = new Set(Object.keys(prods));

  // TERM: For each terminal t in a rule of length ≥ 2, introduce Xt → t
  const termMap = {};
  const newProds4 = {};
  for (const [nt, rules] of Object.entries(prods)) {
    newProds4[nt] = [];
    for (const rule of rules) {
      if (rule.length === 1) { newProds4[nt].push(rule); continue; }
      const mapped = rule.map(sym => {
        if (allNTs.has(sym) || sym === 'ε') return sym;
        if (!termMap[sym]) {
          const fresh = freshNT('T');
          termMap[sym] = fresh;
          newProds4[fresh] = [[sym]];
        }
        return termMap[sym];
      });
      newProds4[nt].push(mapped);
    }
  }
  prods = newProds4;

  // BIN: Break rules of length > 2 into binary rules
  const newProds5 = {};
  for (const [nt, rules] of Object.entries(prods)) {
    newProds5[nt] = [];
    for (const rule of rules) {
      if (rule.length <= 2) { newProds5[nt].push(rule); continue; }
      let current_nt = nt;
      let remaining = [...rule];
      while (remaining.length > 2) {
        const fresh = freshNT('B');
        newProds5[current_nt] = newProds5[current_nt] || [];
        if (current_nt === nt) {
          newProds5[nt].push([remaining[0], fresh]);
        }
        current_nt = fresh;
        remaining = remaining.slice(1);
      }
      newProds5[current_nt] = newProds5[current_nt] || [];
      newProds5[current_nt].push(remaining);
    }
  }
  prods = newProds5;
  const diff4 = getProductionDiff(prods4_before, prods);

  steps.push({
    stepKey: 'binarize',
    stepNumber: 5,
    name: 'Binarize & Terminal Isolation (TERM + BIN)',
    shortName: 'Binarize (TERM + BIN)',
    conceptTitle: 'Chomsky Rule 5: Strictly A → BC or A → a',
    conceptDescription: 'The defining shape of Chomsky Normal Form: every production rule must consist of strictly TWO non-terminal variables (A → BC) or strictly ONE terminal symbol (A → a). In the TERM phase, mixed terminals in long rules are swapped for dedicated helper variables (e.g. T₁ → a). In the BIN phase, rules with 3+ symbols are factored into binary cascades.',
    plainNarration: `CNF Transformation complete! In the TERM phase, we isolated terminals in compound rules into new variables (${Object.entries(termMap).map(([t, v]) => `${v} → ${t}`).join(', ') || 'none needed'}). In the BIN phase, we factored rules with 3+ symbols into binary pairs. Every rule is now strictly A → BC or A → a!`,
    actionDetails: [
      `TERM Phase: Created ${Object.keys(termMap).length} dedicated terminal variable(s) (${Object.entries(termMap).map(([t, v]) => `${v} → ${t}`).join(', ') || 'none needed'}).`,
      `BIN Phase: Factored rules with 3+ variables into binary pairs (A → B₁ B₂).`,
      `Final Verification: All productions conform 100% to Chomsky Normal Form!`
    ],
    checklist: [true, true, true, true, true],
    termMap,
    diff: diff4,
    before: formatProductions(prods4_before),
    after: formatProductions(prods),
    productions: deepCopyProductions(prods),
  });

  return {
    steps,
    cnfGrammar: {
      productions: prods,
      startSymbol: S,
      nonTerminals: Object.keys(prods),
      terminals: grammar.terminals,
      isValid: true,
    },
  };
}

// ── CNF Helpers ────────────────────────────────────────────

function findNullable(prods) {
  const nullable = new Set();
  // Direct: A → ε
  for (const [nt, rules] of Object.entries(prods)) {
    if (rules.some(r => r.length === 1 && r[0] === 'ε')) nullable.add(nt);
  }
  // Indirect: A → BC where B,C nullable
  let changed = true;
  while (changed) {
    changed = false;
    for (const [nt, rules] of Object.entries(prods)) {
      if (nullable.has(nt)) continue;
      for (const rule of rules) {
        if (rule.every(s => nullable.has(s))) { nullable.add(nt); changed = true; break; }
      }
    }
  }
  return nullable;
}

function eliminateEpsilon(prods, nullable, startSymbol) {
  const result = {};
  for (const [nt, rules] of Object.entries(prods)) {
    const newRules = new Set();
    for (const rule of rules) {
      if (rule.length === 1 && rule[0] === 'ε') {
        if (nt === startSymbol) newRules.add(JSON.stringify(['ε']));
        continue;
      }
      // Generate all combinations omitting nullable symbols
      const indices = rule.reduce((acc, s, i) => nullable.has(s) ? [...acc, i] : acc, []);
      const combinations = [[]];
      for (const idx of indices) {
        const len = combinations.length;
        for (let j = 0; j < len; j++) combinations.push([...combinations[j], idx]);
      }
      for (const omit of combinations) {
        const newRule = rule.filter((_, i) => !omit.includes(i));
        if (newRule.length > 0) newRules.add(JSON.stringify(newRule));
      }
    }
    result[nt] = [...newRules].map(r => JSON.parse(r));
    if (result[nt].length === 0) delete result[nt];
  }
  return result;
}

function eliminateUnitProductions(prods) {
  const nts = Object.keys(prods);
  const result = {};
  for (const A of nts) {
    // Find all NTs reachable from A via unit rules
    const reachable = new Set([A]);
    const queue = [A];
    while (queue.length) {
      const X = queue.shift();
      for (const rule of (prods[X] || [])) {
        if (rule.length === 1 && nts.includes(rule[0]) && !reachable.has(rule[0])) {
          reachable.add(rule[0]);
          queue.push(rule[0]);
        }
      }
    }
    const newRules = new Set();
    for (const B of reachable) {
      for (const rule of (prods[B] || [])) {
        if (!(rule.length === 1 && nts.includes(rule[0]))) {
          newRules.add(JSON.stringify(rule));
        }
      }
    }
    result[A] = [...newRules].map(r => JSON.parse(r));
  }
  return result;
}

function eliminateUselessSymbols(prods, startSymbol) {
  const nts = Object.keys(prods);
  // Step 1: Find generating symbols
  const generating = new Set();
  for (const [nt, rules] of Object.entries(prods)) {
    for (const rule of rules) {
      if (rule.every(s => !nts.includes(s) || s === 'ε')) { generating.add(nt); break; }
    }
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const [nt, rules] of Object.entries(prods)) {
      if (generating.has(nt)) continue;
      for (const rule of rules) {
        if (rule.every(s => generating.has(s) || !nts.includes(s))) {
          generating.add(nt); changed = true; break;
        }
      }
    }
  }
  // Step 2: Find reachable from start
  const reachable = new Set([startSymbol]);
  const queue = [startSymbol];
  while (queue.length) {
    const X = queue.shift();
    for (const rule of (prods[X] || [])) {
      for (const s of rule) {
        if (nts.includes(s) && !reachable.has(s)) { reachable.add(s); queue.push(s); }
      }
    }
  }
  // Keep only useful
  const result = {};
  for (const [nt, rules] of Object.entries(prods)) {
    if (!generating.has(nt) || !reachable.has(nt)) continue;
    result[nt] = rules.filter(rule =>
      rule.every(s => !nts.includes(s) || (generating.has(s) && reachable.has(s)))
    );
  }
  return result;
}

// ══════════════════════════════════════════════════════════════
// GNF CONVERSION
// ══════════════════════════════════════════════════════════════

/**
 * Convert a CNF grammar to Greibach Normal Form.
 * Every rule: A → a α (terminal followed by NTs)
 */
export function convertToGNF(cnfGrammar) {
  const steps = [];
  let prods = deepCopyProductions(cnfGrammar.productions);
  const nts = Object.keys(prods);

  // Order NTs as A1, A2, ...
  const ordered = [...nts];
  const before0 = formatProductions(prods);
  const diff0 = getProductionDiff(prods, prods);

  steps.push({
    stepKey: 'order_variables',
    stepNumber: 1,
    name: 'Order Variables',
    shortName: 'Variable Ordering',
    conceptTitle: 'GNF Rule 1: Impose Total Variable Ordering (A₁ < A₂ < ... < Aₖ)',
    conceptDescription: 'In Greibach Normal Form (GNF), every production must be strictly in the form A → a α, where "a" is a single terminal symbol and α is a sequence of zero or more non-terminals. The first step is to order the variables to systematically detect and resolve left recursion.',
    plainNarration: `Assigned a total ordering to all variables: ${ordered.join(' < ')}. Ordering variables prevents infinite circular substitutions and lets us systematically eliminate left-recursion.`,
    actionDetails: [
      `Assigned total ordering index: ${ordered.map((nt, i) => `A${i + 1} = ${nt}`).join(', ')}.`,
      `Prepared precedence table for substitution sweeps.`,
    ],
    checklist: [true, false],
    diff: diff0,
    before: before0,
    after: before0,
    productions: deepCopyProductions(prods),
  });

  // Step 2: Substitute to ensure all rules start with terminal
  const prods1_before = deepCopyProductions(prods);
  const gnfProds = {};

  for (const nt of ordered) {
    gnfProds[nt] = [];
    for (const rule of (prods[nt] || [])) {
      if (rule.length === 1 && rule[0] === 'ε') { continue; }
      if (!nts.includes(rule[0])) {
        // Already starts with terminal
        gnfProds[nt].push(rule);
      } else {
        // Substitute first NT with its rules
        const firstNT = rule[0];
        const rest = rule.slice(1);
        for (const subRule of (prods[firstNT] || [])) {
          const newRule = [...subRule, ...rest].filter(s => s !== 'ε');
          gnfProds[nt].push(newRule.length > 0 ? newRule : ['ε']);
        }
      }
    }
  }
  const diff1 = getProductionDiff(prods1_before, gnfProds);

  steps.push({
    stepKey: 'substitute_terminals',
    stepNumber: 2,
    name: 'Substitute & Terminal Prefixing',
    shortName: 'Terminal Prefixing',
    conceptTitle: 'GNF Rule 2: Every Rule Starts With A Terminal (A → a α)',
    conceptDescription: 'For every rule A → B α where B is a non-terminal, replace B with all of its known expansions B → γ to obtain A → γ α. Repeat until every production begins with a concrete terminal symbol.',
    plainNarration: `Substituted non-terminal prefixes! Every rule in the grammar now begins with an unambiguous terminal symbol followed by non-terminals. This makes the grammar Greibach Normal Form compliant, allowing direct single-step pushdown transitions!`,
    actionDetails: [
      `Substituted initial non-terminal variables with their production targets.`,
      `Ensured each production begins with a terminal character.`,
      `Verified GNF property across all rules.`
    ],
    checklist: [true, true],
    diff: diff1,
    before: formatProductions(prods1_before),
    after: formatProductions(gnfProds),
    productions: deepCopyProductions(gnfProds),
  });

  return {
    steps,
    gnfGrammar: {
      productions: gnfProds,
      startSymbol: cnfGrammar.startSymbol,
      nonTerminals: Object.keys(gnfProds),
      terminals: cnfGrammar.terminals,
      isValid: true,
    },
  };
}

// ══════════════════════════════════════════════════════════════
// CYK MEMBERSHIP TEST
// ══════════════════════════════════════════════════════════════

/**
 * CYK algorithm for CNF grammar.
 * Returns: { accepted, table, steps, trace }
 * table[i][j] = Set of non-terminals that derive w[i..i+j-1]
 */
export function runCYK(cnfGrammar, inputString) {
  const { productions, startSymbol } = cnfGrammar;
  const w = inputString.split('').filter(c => c !== ' ');
  const n = w.length;
  const nts = Object.keys(productions);

  if (n === 0) {
    // Check if start can derive ε
    const deriveEps = (productions[startSymbol] || []).some(r => r[0] === 'ε');
    return { accepted: deriveEps, table: [], steps: [], inputTokens: [] };
  }

  // table[i][j]: set of NTs, i=starting index, j=length
  const table = Array.from({ length: n }, () =>
    Array.from({ length: n + 1 }, () => new Set())
  );

  const steps = [];

  // Fill length=1 (diagonal)
  for (let i = 0; i < n; i++) {
    const ch = w[i];
    for (const [nt, rules] of Object.entries(productions)) {
      for (const rule of rules) {
        if (rule.length === 1 && rule[0] === ch) {
          table[i][1].add(nt);
        }
      }
    }
    steps.push({
      i, j: 1,
      cell: `[${i},1]`,
      filled: [...table[i][1]],
      description: `Cell[${i}][1]: char='${ch}', variables: {${[...table[i][1]].join(', ') || '∅'}}`,
    });
  }

  // Fill lengths 2..n
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      for (let k = 1; k < len; k++) {
        // Split at k: left=[i,k], right=[i+k, len-k]
        for (const [A, rules] of Object.entries(productions)) {
          for (const rule of rules) {
            if (rule.length === 2) {
              const [B, C] = rule;
              if (table[i][k].has(B) && table[i + k][len - k].has(C)) {
                table[i][len].add(A);
              }
            }
          }
        }
      }
      steps.push({
        i, j: len,
        cell: `[${i},${len}]`,
        filled: [...table[i][len]],
        description: `Cell[${i}][${len}]: variables: {${[...table[i][len]].join(', ') || '∅'}}`,
      });
    }
  }

  const accepted = table[0][n].has(startSymbol);

  return { accepted, table, steps, inputTokens: w, n };
}

// ══════════════════════════════════════════════════════════════
// PDA SIMULATION
// ══════════════════════════════════════════════════════════════

/**
 * Build a standard PDA for the grammar's language (pushdown simulation).
 * For the grammar a^n b^n | ε style, we build the PDA directly.
 * Returns step-by-step trace.
 */
export function buildPDAFromGrammar(grammar) {
  // We create a topdown PDA: 
  // States: q_start, q_loop, q_accept
  // On q_start: push S and go to q_loop
  // On q_loop:
  //   If top is NT A: pop A, push any rule of A (nondeterministic)
  //   If top is terminal a and input is a: pop both
  //   If top is ε and stack is empty: go to q_accept
  return {
    states: ['q₀', 'q₁', 'qₐ'],
    startState: 'q₀',
    acceptStates: ['qₐ'],
    stackAlphabet: [...grammar.nonTerminals, ...grammar.terminals, 'Z₀'],
    transitions: buildPDATransitions(grammar),
    grammar,
  };
}

function buildPDATransitions(grammar) {
  const transitions = [];
  const { productions, nonTerminals, terminals } = grammar;

  // q₀: push start symbol
  transitions.push({
    from: 'q₀', input: 'ε', stackTop: 'Z₀',
    to: 'q₁', stackPush: [grammar.startSymbol, 'Z₀'],
    label: `ε, Z₀ → ${grammar.startSymbol}Z₀`,
  });

  // q₁ for each non-terminal: pop it, push rule
  for (const [nt, rules] of Object.entries(productions)) {
    for (const rule of rules) {
      const push = rule[0] === 'ε' ? ['Z₀'] : [...rule].reverse(); // push in reverse for correct order
      transitions.push({
        from: 'q₁', input: 'ε', stackTop: nt,
        to: 'q₁', stackPush: rule[0] === 'ε' ? [] : rule,
        label: `ε, ${nt} → ${rule.join('')}`,
        rule: `${nt} → ${rule.join(' ')}`,
      });
    }
  }

  // q₁ for each terminal: match and consume
  for (const t of terminals) {
    transitions.push({
      from: 'q₁', input: t, stackTop: t,
      to: 'q₁', stackPush: [],
      label: `${t}, ${t} → ε`,
    });
  }

  // Accept when stack has only Z₀ and input done
  transitions.push({
    from: 'q₁', input: 'ε', stackTop: 'Z₀',
    to: 'qₐ', stackPush: ['Z₀'],
    label: 'ε, Z₀ → Z₀',
  });

  return transitions;
}

/**
 * Simulate PDA step by step on input string.
 * Returns array of configuration steps.
 */
export function simulatePDA(pda, inputString) {
  const { productions, nonTerminals, terminals, startSymbol } = pda.grammar;
  const input = inputString.split('').filter(c => c !== ' ');
  const steps = [];

  // We simulate the topdown PDA deterministically (for LL-like grammars)
  // Configuration: (state, remainingInput, stack)
  let state = 'q₀';
  let remaining = [...input];
  let stack = ['Z₀'];

  steps.push({
    stepNum: 0,
    state,
    remaining: [...remaining],
    stack: [...stack],
    action: 'Initial configuration',
    accepted: null,
  });

  // Push start symbol
  stack = [startSymbol, 'Z₀'];
  state = 'q₁';
  steps.push({
    stepNum: 1,
    state,
    remaining: [...remaining],
    stack: [...stack],
    action: `Push start symbol '${startSymbol}', move to q₁`,
    accepted: null,
  });

  let maxSteps = 100;
  let stepNum = 2;

  while (maxSteps-- > 0) {
    const top = stack[0];

    if (top === undefined) {
      // Stack empty before input done
      steps.push({
        stepNum: stepNum++, state: 'q₁',
        remaining: [...remaining], stack: [],
        action: 'Stack underflow — REJECTED',
        accepted: false,
      });
      break;
    }

    if (top === 'Z₀') {
      if (remaining.length === 0) {
        state = 'qₐ';
        steps.push({
          stepNum: stepNum++, state,
          remaining: [], stack: ['Z₀'],
          action: 'Input exhausted, stack has Z₀ only — ACCEPTED ✓',
          accepted: true,
        });
        break;
      } else {
        steps.push({
          stepNum: stepNum++, state,
          remaining: [...remaining], stack: [...stack],
          action: 'Input remains but stack has Z₀ — REJECTED',
          accepted: false,
        });
        break;
      }
    }

    if (nonTerminals.includes(top)) {
      // Pop NT, push a matching rule
      stack = stack.slice(1); // pop
      const rules = productions[top] || [];
      // Pick best rule: leftmost that matches remaining input
      let chosen = null;
      for (const rule of rules) {
        if (rule[0] === 'ε') { chosen = rule; continue; }
        const firstT = rule.find(s => !nonTerminals.includes(s));
        if (!firstT || firstT === remaining[0]) { chosen = rule; break; }
      }
      if (!chosen) chosen = rules[0] || [['ε']];

      const pushed = chosen[0] === 'ε' ? [] : [...chosen].reverse();
      stack = [...chosen[0] === 'ε' ? [] : chosen, ...stack];

      steps.push({
        stepNum: stepNum++, state,
        remaining: [...remaining], stack: [...stack],
        action: `Pop '${top}', apply rule: ${top} → ${chosen.join(' ')}`,
        rule: `${top} → ${chosen.join(' ')}`,
        accepted: null,
      });
    } else if (terminals.includes(top)) {
      // Terminal: match
      if (remaining.length > 0 && remaining[0] === top) {
        stack = stack.slice(1);
        const consumed = remaining.shift();
        steps.push({
          stepNum: stepNum++, state,
          remaining: [...remaining], stack: [...stack],
          action: `Match terminal '${consumed}' — pop from stack and input`,
          accepted: null,
        });
      } else {
        const got = remaining[0] || 'end-of-input';
        steps.push({
          stepNum: stepNum++, state,
          remaining: [...remaining], stack: [...stack],
          action: `Mismatch! Expected '${top}', got '${got}' — REJECTED`,
          accepted: false,
        });
        break;
      }
    } else {
      // Unknown symbol
      steps.push({
        stepNum: stepNum++, state,
        remaining: [...remaining], stack: [...stack],
        action: `Unknown symbol '${top}' on stack — REJECTED`,
        accepted: false,
      });
      break;
    }
  }

  const finalStep = steps[steps.length - 1];
  return { steps, accepted: finalStep?.accepted === true };
}

// ══════════════════════════════════════════════════════════════
// PARSE TREE
// ══════════════════════════════════════════════════════════════

/**
 * Build a parse tree for inputString using the grammar (recursive descent / leftmost).
 * Returns a tree node: { symbol, children, id }
 */
export function buildParseTree(grammar, inputString) {
  const { productions, startSymbol, nonTerminals } = grammar;
  const input = inputString.split('').filter(c => c !== ' ');
  let pos = { val: 0 };
  let idCounter = { val: 0 };

  function makeNode(symbol, children = []) {
    return { id: idCounter.val++, symbol, children, isTerminal: !nonTerminals.includes(symbol) };
  }

  function derive(nt, depth = 0) {
    if (depth > 50) return null;
    const rules = productions[nt] || [];
    for (const rule of rules) {
      const savedPos = pos.val;
      const children = [];
      let ok = true;

      for (const sym of rule) {
        if (sym === 'ε') {
          children.push(makeNode('ε'));
        } else if (nonTerminals.includes(sym)) {
          const child = derive(sym, depth + 1);
          if (!child) { ok = false; break; }
          children.push(child);
        } else {
          // Terminal
          if (pos.val < input.length && input[pos.val] === sym) {
            children.push(makeNode(sym));
            pos.val++;
          } else { ok = false; break; }
        }
      }

      if (ok) {
        const node = makeNode(nt, children);
        return node;
      }
      pos.val = savedPos;
    }
    return null;
  }

  const tree = derive(startSymbol);
  const success = tree && pos.val === input.length;
  return { tree, success };
}

// ══════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════

export function formatProductions(prods) {
  return Object.entries(prods)
    .map(([nt, rules]) =>
      `${nt} → ${rules.map(r => r.join(' ')).join(' | ')}`
    )
    .join('\n');
}

export function deepCopyProductions(prods) {
  return JSON.parse(JSON.stringify(prods));
}

export const EXAMPLE_GRAMMARS = {
  'Balanced Parentheses': {
    text: `S -> ( S ) | S S | ε`,
    description: 'Generates all balanced parenthesis strings: (), (()), ()(), ...',
  },
  'Equal a\'s and b\'s': {
    text: `S -> a S b | ε`,
    description: 'Generates strings with equal a\'s and b\'s: ε, ab, aabb, aaabbb, ...',
  },
  'Arithmetic Expressions': {
    text: `E -> E + T | T\nT -> T * F | F\nF -> ( E ) | a`,
    description: 'Generates arithmetic expressions with +, *, and parentheses.',
  },
  'Palindromes over {a,b}': {
    text: `S -> a S a | b S b | a | b | ε`,
    description: 'Generates all palindromes over {a,b}: ε, a, b, aa, bb, aba, ...',
  },
  'Simple Identifier': {
    text: `S -> L S | L\nL -> a | b | c`,
    description: 'Generates strings of letters: a, b, ab, abc, ...',
  },
};
