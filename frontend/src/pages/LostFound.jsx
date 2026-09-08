import React, { useEffect, useState } from 'react';
import { HelpCircle, MapPin, Phone, Plus, X, Trash2, Edit2 } from 'lucide-react';
import axios from 'axios';

export default function LostFound() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [formData, setFormData] = useState({
    itemName: '',
    status: 'lost',
    category: 'electronics',
    description: '',
    location: '',
    contactInfo: ''
  });
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await axios.get('/api/lost-found');
        setItems(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lost&found items:', error);
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateOrUpdateItem = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      if (editingItemId) {
        const { data } = await axios.put(`/api/lost-found/${editingItemId}`, formData, config);
        setItems(items.map(item => item._id === editingItemId ? data : item));
      } else {
        const { data } = await axios.post('/api/lost-found', formData, config);
        setItems([data, ...items]);
      }
      
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post item');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItemId(null);
    setFormData({ itemName: '', status: 'lost', category: 'electronics', description: '', location: '', contactInfo: '' });
  };

  const handleEditClick = (item) => {
    setFormData({
      itemName: item.itemName,
      status: item.status,
      category: item.category,
      description: item.description,
      location: item.location,
      contactInfo: item.contactInfo
    });
    setEditingItemId(item._id);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`/api/lost-found/${id}`, config);
      setItems(items.filter(item => item._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Lost & Found</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} /> Report Item
        </button>
      </div>
      
      {loading ? (
        <div className="empty-state">
          <div className="empty-icon"><HelpCircle size={32} /></div>
          <h3 className="empty-title">Loading...</h3>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><HelpCircle size={32} /></div>
          <h3 className="empty-title">No items reported</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {items.map(item => (
            <div key={item._id} style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', borderTop: `4px solid ${item.status === 'lost' ? '#ef4444' : item.status === 'found' ? '#22c55e' : '#64748b'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>

                <div>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: item.status === 'lost' ? '#ef4444' : item.status === 'found' ? '#22c55e' : '#64748b', backgroundColor: item.status === 'lost' ? '#fee2e2' : item.status === 'found' ? '#dcfce7' : '#f1f5f9', padding: '4px 8px', borderRadius: '4px', marginRight: '8px' }}>
                    {item.status}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                {userInfo && item.postedBy && (
                  userInfo._id === (item.postedBy._id || item.postedBy) || 
                  userInfo.role === 'admin'
                ) && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleEditClick(item)}
                      style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}
                      title="Edit item"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item._id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="Delete item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{item.itemName}</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '16px' }}>{item.description}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--text-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} /> {item.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={16} /> {item.contactInfo}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{editingItemId ? 'Edit Item' : 'Report Item'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateOrUpdateItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', border: `2px solid ${formData.status === 'lost' ? '#ef4444' : '#e2e8f0'}`, borderRadius: '8px', backgroundColor: formData.status === 'lost' ? '#fee2e2' : 'transparent' }}>
                  <input type="radio" name="status" value="lost" checked={formData.status === 'lost'} onChange={handleInputChange} style={{ display: 'none' }} />
                  <span style={{ fontWeight: 'bold', color: formData.status === 'lost' ? '#ef4444' : '#64748b' }}>I Lost Something</span>
                </label>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', border: `2px solid ${formData.status === 'found' ? '#22c55e' : '#e2e8f0'}`, borderRadius: '8px', backgroundColor: formData.status === 'found' ? '#dcfce7' : 'transparent' }}>
                  <input type="radio" name="status" value="found" checked={formData.status === 'found'} onChange={handleInputChange} style={{ display: 'none' }} />
                  <span style={{ fontWeight: 'bold', color: formData.status === 'found' ? '#22c55e' : '#64748b' }}>I Found Something</span>
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Item Name</label>
                <input type="text" name="itemName" required value={formData.itemName} onChange={handleInputChange} className="form-input" placeholder="e.g. Blue Water Bottle" />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="form-input">
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="documents">Documents/ID</option>
                  <option value="accessories">Accessories</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
                <textarea name="description" required value={formData.description} onChange={handleInputChange} className="form-input" rows="3" placeholder="Provide details like color, brand, condition..."></textarea>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Location (Where was it lost/found?)</label>
                <input type="text" name="location" required value={formData.location} onChange={handleInputChange} className="form-input" placeholder="e.g. Library 2nd Floor" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Your Contact Info</label>
                <input type="text" name="contactInfo" required value={formData.contactInfo} onChange={handleInputChange} className="form-input" placeholder="e.g. Phone number or Room number" />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}>
                {editingItemId ? 'Update Item' : 'Post Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
