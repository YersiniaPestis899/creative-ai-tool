import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StoryGenerator from './components/StoryGenerator';
import CharacterCreator from './components/CharacterCreator';
import CharacterDetail from './components/CharacterDetail';
import Navigation from './components/Navigation';
import { CharacterProvider } from './contexts/CharacterContext';

function App() {
  return (
    <CharacterProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navigation />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<StoryGenerator />} />
              <Route path="/characters" element={<CharacterCreator />} />
              <Route path="/characters/:id" element={<CharacterDetail />} />
            </Routes>
          </div>
        </div>
      </Router>
    </CharacterProvider>
  );
}

export default App;