import React, { useState } from 'react';
import { generatePersonalizedMessage } from '../api';
import { LinkedInProfile } from '../types';
import './MessageGenerator.css';

const MessageGenerator: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [formData, setFormData] = useState<LinkedInProfile>({
    name: 'John Doe',
    job_title: 'Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    summary: 'Experienced in AI & ML with 5+ years of experience in developing scalable applications.'
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!formData.name || !formData.job_title || !formData.company) {
        setError('Name, job title, and company are required');
        return;
      }
      
      const response = await generatePersonalizedMessage(formData);
      setMessage(response.message);
    } catch (err) {
      setError('Failed to generate personalized message');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Copy message to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message)
      .then(() => {
        alert('Message copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy message: ', err);
      });
  };

  return (
    <div className="message-generator-container">
      <h1>LinkedIn Personalized Message Generator</h1>
      <p className="description">
        Generate personalized outreach messages based on LinkedIn profiles.
      </p>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row">
        <div className="column">
          <div className="card">
            <h2>LinkedIn Profile Data</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="job_title">Job Title*</label>
                <input
                  type="text"
                  id="job_title"
                  name="job_title"
                  className="form-control"
                  value={formData.job_title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="company">Company*</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="form-control"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="summary">Profile Summary</label>
                <textarea
                  id="summary"
                  name="summary"
                  className="form-control"
                  value={formData.summary}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Message'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="column">
          <div className="card">
            <h2>Generated Message</h2>
            {!message && !loading && (
              <div className="no-message">
                <p>Fill out the form and click "Generate Message" to create a personalized outreach message.</p>
              </div>
            )}
            
            {loading && (
              <div className="loading">Generating your personalized message...</div>
            )}
            
            {message && !loading && (
              <div className="message-result">
                <div className="message-content">
                  {message}
                </div>
                <button 
                  className="btn"
                  onClick={copyToClipboard}
                >
                  Copy to Clipboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageGenerator; 