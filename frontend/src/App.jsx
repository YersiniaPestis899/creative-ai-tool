import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StoryGenerator from './components/StoryGenerator';
import CharacterCreator from './components/CharacterCreator';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<StoryGenerator />} />
            <Route path="/characters" element={<CharacterCreator />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;