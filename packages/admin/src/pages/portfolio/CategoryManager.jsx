import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Edit, Trash2, Check, X } from 'lucide-react';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null); // { id, name }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('portfolio_categories').select('*').order('name');
      if (error) throw error;
      setCategories(data);
    } catch (err) {
      setError('Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    try {
      const { data, error } = await supabase.from('portfolio_categories').insert([{ name: newCategoryName.trim() }]).select();
      if (error) throw error;
      setCategories([...categories, data[0]]);
      setNewCategoryName('');
    } catch (err) {
      setError('Failed to add category. It might already exist.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure? Deleting a category will not delete the portfolio items, but they will become uncategorized.')) {
        try {
            const { error } = await supabase.from('portfolio_categories').delete().match({ id });
            if (error) throw error;
            setCategories(categories.filter(c => c.id !== id));
        } catch (err) {
            setError('Failed to delete category.');
        }
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    
    try {
        const { error } = await supabase.from('portfolio_categories').update({ name: editingCategory.name.trim() }).match({ id: editingCategory.id });
        if (error) throw error;
        fetchCategories(); // Refetch to show updated data
        setEditingCategory(null);
    } catch (err) {
        setError('Failed to update category.');
    }
  }

  if (loading) return <p>Loading categories...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Portfolio Categories</h1>
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
      
      {/* Add new category form */}
      <form onSubmit={handleAddCategory} className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md flex gap-4">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="New category name"
          className="flex-grow px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add Category</button>
      </form>

      {/* Category list */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {categories.map(cat => (
            <li key={cat.id} className="p-4 flex justify-between items-center">
              {editingCategory?.id === cat.id ? (
                <input 
                  type="text" 
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="px-2 py-1 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              ) : (
                <span>{cat.name}</span>
              )}
              
              <div className="flex gap-4">
                {editingCategory?.id === cat.id ? (
                    <>
                        <button onClick={handleUpdateCategory} className="text-green-500"><Check /></button>
                        <button onClick={() => setEditingCategory(null)} className="text-red-500"><X /></button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setEditingCategory({ id: cat.id, name: cat.name })} className="text-indigo-600"><Edit /></button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-600"><Trash2 /></button>
                    </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryManager;
