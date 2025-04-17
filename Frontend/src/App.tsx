import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CampaignForm from './pages/CampaignForm';
import MessageGenerator from './pages/MessageGenerator';
import ScraperPage from './pages/ScraperPage';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Navbar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/campaign/new" element={<CampaignForm />} />
          <Route path="/campaign/edit/:id" element={<CampaignForm />} />
          <Route path="/message-generator" element={<MessageGenerator />} />
          <Route path="/scraper" element={<ScraperPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App; 