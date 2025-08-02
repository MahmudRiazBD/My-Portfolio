import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Edit, Trash2 } from 'lucide-react';

const BlogCategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('blog_categories').select('*').order('name');
        if (error) {
            setError('Failed to fetch categories.');
            console.error(error);
        } else {
            setCategories(data);
        }
        setLoading(false);
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        const { data, error } = await supabase
            .from('blog_categories')
            .insert({ name: newCategoryName })
            .select()
            .single();

        if (error) {
            setError(error.message);
        } else {
            setCategories([...categories, data]);
            setNewCategoryName('');
        }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        if (!editingCategory || !editingCategory.name.trim()) return;

        const { data, error } = await supabase
            .from('blog_categories')
            .update({ name: editingCategory.name })
            .eq('id', editingCategory.id)
            .select()
            .single();

        if (error) {
            setError(error.message);
        } else {
            setCategories(categories.map(cat => (cat.id === data.id ? data : cat)));
            setEditingCategory(null);
        }
    };
    
    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure? This might affect posts using this category.')) return;
        
        const { error } = await supabase.from('blog_categories').delete().eq('id', id);
        if (error) {
            setError('Failed to delete category. It might be in use.');
            console.error(error);
        } else {
            setCategories(categories.filter(cat => cat.id !== id));
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Manage Blog Categories</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Add Category Form */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
                    <form onSubmit={handleAddCategory} className="flex space-x-2">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="New category name"
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
                            required
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
                            <Plus size={16} className="mr-1" /> Add
                        </button>
                    </form>
                </div>

                {/* Edit Category Form */}
                {editingCategory && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                         <h2 className="text-xl font-semibold mb-4">Edit Category</h2>
                        <form onSubmit={handleUpdateCategory} className="flex space-x-2">
                            <input
                                type="text"
                                value={editingCategory.name}
                                onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
                                required
                            />
                            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
                            <button type="button" onClick={() => setEditingCategory(null)} className="bg-gray-500 text-white px-4 py-2 rounded-lg">Cancel</button>
                        </form>
                    </div>
                )}
            </div>

            {error && <p className="text-red-500 my-4">{error}</p>}

            {/* Categories List */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mt-8">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Name</th>
                            <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="2" className="text-center p-4">Loading...</td></tr>
                        ) : (
                            categories.map(cat => (
                                <tr key={cat.id} className="border-b dark:border-gray-700">
                                    <td className="px-5 py-4 text-sm font-semibold">{cat.name}</td>
                                    <td className="px-5 py-4 text-sm">
                                        <div className="flex space-x-3">
                                            <button onClick={() => setEditingCategory(cat)} className="text-yellow-500 hover:text-yellow-700"><Edit size={20} /></button>
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700"><Trash2 size={20} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BlogCategoryManager;