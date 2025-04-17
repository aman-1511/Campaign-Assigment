import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createCampaign, getCampaign, updateCampaign } from '../api';
import { CampaignFormData, CampaignStatus } from '../types';
import './CampaignForm.css';

const CampaignForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    status: CampaignStatus.INACTIVE,
    leads: [],
    accountIDs: [],
  });

  // Check if we're in edit mode
  const isEditMode = !!id;

  // Fetch campaign data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchCampaign();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCampaign = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const campaign = await getCampaign(id);
      setFormData({
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        leads: campaign.leads,
        accountIDs: campaign.accountIDs,
      });
    } catch (err) {
      setError('Failed to fetch campaign details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle arrays (leads and accountIDs)
  const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: 'leads' | 'accountIDs') => {
    const values = e.target.value.split('\n').filter(item => item.trim() !== '');
    setFormData(prev => ({ ...prev, [field]: values }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEditMode && id) {
        await updateCampaign(id, formData);
      } else {
        await createCampaign(formData);
      }
      navigate('/');
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} campaign`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="loading">Loading campaign data...</div>;
  }

  return (
    <div className="campaign-form-container">
      <h1>{isEditMode ? 'Edit Campaign' : 'Create New Campaign'}</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form className="campaign-form card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Campaign Name</label>
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
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            className="form-control"
            value={formData.status}
            onChange={handleChange}
          >
            <option value={CampaignStatus.ACTIVE}>Active</option>
            <option value={CampaignStatus.INACTIVE}>Inactive</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="leads">LinkedIn Leads (one URL per line)</label>
          <textarea
            id="leads"
            name="leads"
            className="form-control"
            value={formData.leads.join('\n')}
            onChange={(e) => handleArrayChange(e, 'leads')}
            rows={4}
            placeholder="https://linkedin.com/in/profile-1&#10;https://linkedin.com/in/profile-2"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="accountIDs">Account IDs (one ID per line)</label>
          <textarea
            id="accountIDs"
            name="accountIDs"
            className="form-control"
            value={formData.accountIDs.join('\n')}
            onChange={(e) => handleArrayChange(e, 'accountIDs')}
            rows={4}
            placeholder="123&#10;456"
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn" 
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update Campaign' : 'Create Campaign')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignForm; 