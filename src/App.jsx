import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GrammarProvider } from './context/GrammarContext';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import CFGInputPage from './pages/CFGInputPage';
import AnalysisPage from './pages/AnalysisPage';
import CNFConverterPage from './pages/CNFConverterPage';
import CYKPage from './pages/CYKPage';
import PDASimulatorPage from './pages/PDASimulatorPage';
import ParseTreePage from './pages/ParseTreePage';

export default function App() {
  return (
    <GrammarProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/"           element={<HomePage />} />
          <Route path="/grammar"    element={<CFGInputPage />} />
          <Route path="/analysis"   element={<AnalysisPage />} />
          <Route path="/converter"  element={<CNFConverterPage />} />
          <Route path="/cyk"        element={<CYKPage />} />
          <Route path="/pda"        element={<PDASimulatorPage />} />
          <Route path="/parsetree"  element={<ParseTreePage />} />
          <Route path="*"           element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </GrammarProvider>
  );
}
