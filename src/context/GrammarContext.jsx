import React, { createContext, useContext, useState, useCallback } from 'react';
import { parseGrammar, EXAMPLE_GRAMMARS } from '../engine/cfgEngine';

const GrammarContext = createContext(null);

const DEFAULT_GRAMMAR_TEXT = `S -> a S b | ε`;

export function GrammarProvider({ children }) {
  const [grammarText, setGrammarText] = useState(DEFAULT_GRAMMAR_TEXT);
  const [grammar, setGrammar] = useState(() => parseGrammar(DEFAULT_GRAMMAR_TEXT));
  const [testHistory, setTestHistory] = useState([]);

  const updateGrammar = useCallback((text) => {
    setGrammarText(text);
    const parsed = parseGrammar(text);
    setGrammar(parsed);
    return parsed;
  }, []);

  const loadExample = useCallback((name) => {
    const ex = EXAMPLE_GRAMMARS[name];
    if (ex) updateGrammar(ex.text);
  }, [updateGrammar]);

  const addToHistory = useCallback((entry) => {
    setTestHistory(prev => [entry, ...prev].slice(0, 50));
  }, []);

  return (
    <GrammarContext.Provider value={{
      grammarText, grammar, updateGrammar, loadExample,
      testHistory, addToHistory,
    }}>
      {children}
    </GrammarContext.Provider>
  );
}

export function useGrammar() {
  const ctx = useContext(GrammarContext);
  if (!ctx) throw new Error('useGrammar must be used within GrammarProvider');
  return ctx;
}
