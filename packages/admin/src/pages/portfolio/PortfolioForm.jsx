import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import RichTextEditor from '../../components/RichTextEditor';

const PortfolioForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [images, setImages] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // Fetch categories for the dropdown
    const fetchCategories = async () => {
        const { data } = await supabase.from('portfolio_categories').select('*').order('name');
        setCategories(data || []);
    };
    
    fetchCategories();

    if (id) {
      setLoading(true);
      const fetchPortfolioItem = async () => {
        const { data, error } = await supabase
          .from('portfolios')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          setError('Could not fetch portfolio data.');
          console.error(error);
        } else if (data) {
          setTitle(data.title);
          setDescription(data.description || '');
          setStatus(data.status);
          setImages(data.images_urls || []);
          setCategoryId(data.category_id || '');
        }
        setLoading(false);
      };
      fetchPortfolioItem();
    }
  }, [id]);

  const handleImageUpload = async (e) => {
    // ... (image upload logic remains the same)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const portfolioData = {
      title,
      description,
      status,
      images_urls: images,
      category_id: categoryId || null, // Ensure it's null if empty
    };

    const { error } = id
      ? await supabase.from('portfolios').update(portfolioData).match({ id })
      : await supabase.from('portfolios').insert([portfolioData]);

    if (error) {
      setError(error.message);
    } else {
      navigate('/admin/portfolio');
    }

    setLoading(false);
  };

  if (loading && id) {
      return <div>Loading item details...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{id ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
        </div>

        <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
            <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                <option value="">Select a category</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <RichTextEditor content={description} onChange={setDescription} />
        </div>
        
        <div>
            <label className="block text-sm font-medium mb-1">Images</label>
            <input type="file" multiple onChange={handleImageUpload} disabled={uploading} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            {uploading && <p className="text-sm mt-2">Uploading...</p>}
            <div className="mt-4 grid grid-cols-3 gap-4">
                {images.map(url => <img key={url} src={url} alt="Uploaded" className="w-full h-auto object-cover rounded-md" />)}
            </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div className="flex justify-end pt-4">
          <button type="button" onClick={() => navigate('/admin/portfolio')} className="text-gray-600 mr-4">Cancel</button>
          <button type="submit" disabled={loading || uploading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
            {loading || uploading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioForm;
