import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import { getScrapedLeads, getSourceUrls, getLeadsBySource, startScraping } from '../api';
import './ScraperPage.css';

const ScraperPage: React.FC = () => {
  const [searchUrl, setSearchUrl] = useState<string>('https://www.linkedin.com/search/results/people/?geoUrn=%5B%22103644278%22%5D&industry=%5B%221594%22%2C%221862%22%2C%2280%22%5D&keywords=%22lead%20generation%20agency%22&origin=GLOBAL_SEARCH_HEADER&sid=z%40k&titleFreeText=Founder'); // Default example URL
  const [linkedinEmail, setLinkedinEmail] = useState<string>('');
  const [linkedinPassword, setLinkedinPassword] = useState<string>('');
  const [maxProfiles, setMaxProfiles] = useState<number>(5);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapeStatus, setScrapeStatus] = useState<string | null>(null);
  const [sourceUrls, setSourceUrls] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);

  // Fetch existing leads on component mount
  useEffect(() => {
    fetchSourceUrls();
    fetchLeads();
  }, []);

  // Fetch lead sources when the component mounts
  const fetchSourceUrls = async () => {
    try {
      const data = await getSourceUrls();
      setSourceUrls(data);
      // Set the first source as selected by default if available
      if (data.length > 0 && !selectedSource) {
        setSelectedSource(data[0]);
      }
    } catch (err) {
      console.error('Error fetching source URLs:', err);
    }
  };

  const fetchLeads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data: Lead[];
      
      // If a specific source is selected, fetch leads only from that source
      if (selectedSource) {
        data = await getLeadsBySource(selectedSource);
      } else {
        data = await getScrapedLeads();
      }
      
      setLeads(data);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to fetch leads. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSource) {
      fetchLeads();
    }
  }, [selectedSource]);

  const handleScrape = async () => {
    setIsScraping(true);
    setError(null);
    setScrapeStatus(null);
    try {
      // Basic validation
      if (!searchUrl || !searchUrl.includes('linkedin.com/search/results/people/')) {
         setError('Please enter a valid LinkedIn People Search URL.');
         setIsScraping(false);
         return;
      }
      
      if (!linkedinEmail) {
        setError('Please enter your LinkedIn email.');
        setIsScraping(false);
        return;
      }
      
      if (!linkedinPassword) {
        setError('Please enter your LinkedIn password.');
        setIsScraping(false);
        return;
      }
      
      const response = await startScraping(
        searchUrl, 
        linkedinEmail, 
        linkedinPassword,
        maxProfiles
      );
      
      setScrapeStatus(response.message || 'Scraping started... Check back later for results.');
      
      // Update the selected source to the current search URL
      setSelectedSource(searchUrl);
      
      // Refresh the source URLs list
      setTimeout(() => {
        fetchSourceUrls();
        fetchLeads();
      }, 30000); // Refresh leads after 30 seconds (adjust as needed)
    } catch (err: any) {
      console.error('Error starting scrape:', err);
      const errMsg = err.response?.data?.message || 'Failed to start scraping process.';
      setError(errMsg);
      setScrapeStatus(null);
    } finally {
      setIsScraping(false);
    }
  };

  // Helper to generate initials from name for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Default avatar placeholder if no image available
  const renderAvatar = (lead: Lead) => {
    // Check if profile image exists
    if (lead.profileImage) {
      return (
        <div className="avatar-circle">
          <img 
            src={lead.profileImage} 
            alt={`${lead.fullName}'s profile`} 
            className="profile-image" 
          />
        </div>
      );
    }
    
    // Fallback to initials if no image
    return (
      <div className="avatar-circle">
        {getInitials(lead.fullName)}
      </div>
    );
  };

  // New helper function to get first 5 words
  const getFirst5Words = (text: string): string => {
    if (!text) return '/';
    
    // Split the text by spaces and take first 5 words
    const words = text.split(' ').slice(0, 5);
    
    // Join them back with spaces and add ellipsis
    return words.join(' ') + '...';
  };

  return (
    <div className="scraper-page content">
      <div className="card scraper-controls">
        <h2>LinkedIn Lead Scraper</h2>
        <p>Enter a LinkedIn search results URL and your LinkedIn credentials to scrape profiles. The scraping runs in the background.</p>
        
        <div className="form-group">
          <label htmlFor="searchUrl">LinkedIn Search URL:</label>
          <input
            type="url"
            id="searchUrl"
            className="form-control"
            value={searchUrl}
            onChange={(e) => setSearchUrl(e.target.value)}
            placeholder="e.g., https://www.linkedin.com/search/results/people/..."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="linkedinEmail">LinkedIn Email:</label>
          <input
            type="email"
            id="linkedinEmail"
            className="form-control"
            value={linkedinEmail}
            onChange={(e) => setLinkedinEmail(e.target.value)}
            placeholder="Your LinkedIn account email"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="linkedinPassword">LinkedIn Password:</label>
          <input
            type="password"
            id="linkedinPassword"
            className="form-control"
            value={linkedinPassword}
            onChange={(e) => setLinkedinPassword(e.target.value)}
            placeholder="Your LinkedIn account password"
            required
          />
          <small className="form-text text-muted">
            Your credentials are only used for scraping and never stored.
          </small>
        </div>
        
        <div className="advanced-options">
          <div className="advanced-toggle" onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
            {showAdvancedOptions ? '▼ Hide Advanced Options' : '► Show Advanced Options'}
          </div>
          
          {showAdvancedOptions && (
            <div className="advanced-controls">
              <div className="form-group">
                <label htmlFor="maxProfiles">Max Profiles to Scrape:</label>
                <input
                  type="number"
                  id="maxProfiles"
                  className="form-control"
                  value={maxProfiles}
                  onChange={(e) => setMaxProfiles(Number(e.target.value))}
                  min="1"
                  max="100"
                />
              </div>
            </div>
          )}
        </div>
        
        <button 
          className="btn" 
          onClick={handleScrape} 
          disabled={isScraping || !searchUrl || !linkedinEmail || !linkedinPassword}
        >
          {isScraping ? 'Scraping Initiated...' : 'Start Scraping'}
        </button>
        
        {scrapeStatus && <div className="alert alert-success mt-3">{scrapeStatus}</div>}
        {error && !scrapeStatus && <div className="alert alert-danger mt-3">{error}</div>}
      </div>

      <div className="card leads-container">
        <div className="leads-header">
          <h3>Scraped Leads ({leads.length})</h3>
          <div className="leads-actions">
            {sourceUrls.length > 0 && (
              <div className="source-selector">
                <label htmlFor="sourceUrlSelect">Source URL:</label>
                <select 
                  id="sourceUrlSelect" 
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="form-control"
                >
                  {sourceUrls.map((url, index) => (
                    <option key={index} value={url}>
                      {url.length > 60 ? url.substring(0, 60) + '...' : url}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button className="btn btn-secondary" onClick={fetchLeads} disabled={isLoading}>
              {isLoading ? 'Refreshing...' : 'Refresh List'}
            </button>
          </div>
        </div>
        
        {isLoading && leads.length === 0 && <div className="loading">Loading leads...</div>}
        {!isLoading && error && leads.length === 0 && <div className="alert alert-danger">Error loading leads.</div>} 
        {!isLoading && !error && leads.length === 0 && (
            <div className="no-leads">No leads found. Start scraping or check back later.</div>
        )}
        
        {leads.length > 0 && (
          <div className="leads-table-wrapper">
            <table className="leads-table">
              <thead>
                <tr>
                  <th className="th-avatar"></th>
                  <th className="th-name">Full Name</th>
                  <th className="th-headline">Headline</th>
                  <th className="th-job">Job Title</th>
                  <th className="th-company">Company</th>
                  <th className="th-location">Location</th>
                  <th className="th-linkedin">LinkedIn URL</th>
                  <th className="th-about">About</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id}>
                    <td className="td-avatar">{renderAvatar(lead)}</td>
                    <td>{lead.fullName}</td>
                    <td>{lead.headline || '/'}</td>
                    <td>{lead.jobTitle || '/'}</td>
                    <td>{lead.companyName || '/'}</td>
                    <td>{lead.location || '/'}</td>
                    <td className="td-linkedin">
                      <a 
                        href={lead.profileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="linkedin-link"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#0077B5">
                          <path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8.339 18.337H5.667v-8.59h2.672v8.59zM7.003 8.574a1.548 1.548 0 1 1 0-3.096 1.548 1.548 0 0 1 0 3.096zm11.335 9.763h-2.669V14.16c0-.996-.018-2.277-1.388-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248h-2.667v-8.59h2.56v1.174h.037c.355-.675 1.227-1.387 2.524-1.387 2.704 0 3.203 1.778 3.203 4.092v4.71z"/>
                        </svg>
                      </a>
                    </td>
                    <td title={lead.summary || '/'}>
                      {getFirst5Words(lead.summary || '')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScraperPage;