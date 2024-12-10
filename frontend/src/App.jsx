import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StoryGenerator from './components/StoryGenerator';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<StoryGenerator />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;