import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Edit, Trash2 } from 'lucide-react';

const BlogTagManager = () => {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newTagName, setNewTagName] = useState('');
    const [editingTag, setEditingTag] = useState(null);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('blog_tags').select('*').order('name');
        if (error) {
            setError('Failed to fetch tags.');
            console.error(error);
        } else {
            setTags(data);
        }
        setLoading(false);
    };

    const handleAddTag = async (e) => {
        e.preventDefault();
        if (!newTagName.trim()) return;

        const { data, error } = await supabase
            .from('blog_tags')
            .insert({ name: newTagName })
            .select()
            .single();

        if (error) {
            setError(error.message);
        } else {
            setTags([...tags, data]);
            setNewTagName('');
        }
    };

    const handleUpdateTag = async (e) => {
        e.preventDefault();
        if (!editingTag || !editingTag.name.trim()) return;

        const { data, error } = await supabase
            .from('blog_tags')
            .update({ name: editingTag.name })
            .eq('id', editingTag.id)
            .select()
            .single();

        if (error) {
            setError(error.message);
        } else {
            setTags(tags.map(tag => (tag.id === data.id ? data : tag)));
            setEditingTag(null);
        }
    };
    
    const handleDeleteTag = async (id) => {
        if (!window.confirm('Are you sure? Removing this tag will also remove it from all associated posts.')) return;
        
        // Note: The relation in `blog_post_tags` should have ON DELETE CASCADE
        // for this to work smoothly without manually cleaning up relations.
        const { error } = await supabase.from('blog_tags').delete().eq('id', id);
        if (error) {
            setError('Failed to delete tag.');
            console.error(error);
        } else {
            setTags(tags.filter(tag => tag.id !== id));
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Manage Blog Tags</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Add New Tag</h2>
                    <form onSubmit={handleAddTag} className="flex space-x-2">
                        <input
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="New tag name"
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
                            required
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
                            <Plus size={16} className="mr-1" /> Add
                        </button>
                    </form>
                </div>

                {editingTag && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                         <h2 className="text-xl font-semibold mb-4">Edit Tag</h2>
                        <form onSubmit={handleUpdateTag} className="flex space-x-2">
                            <input
                                type="text"
                                value={editingTag.name}
                                onChange={(e) => setEditingTag({...editingTag, name: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
                                required
                            />
                            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
                            <button type="button" onClick={() => setEditingTag(null)} className="bg-gray-500 text-white px-4 py-2 rounded-lg">Cancel</button>
                        </form>
                    </div>
                )}
            </div>

            {error && <p className="text-red-500 my-4">{error}</p>}

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
                            tags.map(tag => (
                                <tr key={tag.id} className="border-b dark:border-gray-700">
                                    <td className="px-5 py-4 text-sm font-semibold">{tag.name}</td>
                                    <td className="px-5 py-4 text-sm">
                                        <div className="flex space-x-3">
                                            <button onClick={() => setEditingTag(tag)} className="text-yellow-500 hover:text-yellow-700"><Edit size={20} /></button>
                                            <button onClick={() => handleDeleteTag(tag.id)} className="text-red-500 hover:text-red-700"><Trash2 size={20} /></button>
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

export default BlogTagManager;