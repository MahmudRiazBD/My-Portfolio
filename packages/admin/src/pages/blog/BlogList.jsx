import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { format } from 'date-fns';
import { PlusCircle, Eye, Edit, Trash2 } from 'lucide-react';

const BlogList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('blogs')
            .select(`
                id,
                title,
                status,
                published_at,
                users (full_name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            setError('Failed to fetch blog posts.');
            console.error('Error fetching posts:', error);
        } else {
            setPosts(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPosts();
    }, []);
    
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        const { error } = await supabase.from('blogs').delete().eq('id', id);

        if (error) {
            setError('Failed to delete post.');
            console.error('Error deleting post:', error);
        } else {
            setPosts(posts.filter(post => post.id !== id));
        }
    };
    
    const filteredPosts = useMemo(() => {
        return posts.filter(post =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [posts, searchTerm]);

    if (loading) return <div>Loading posts...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Blog Posts</h1>
                <div>
                    <button
                        onClick={() => navigate('/admin/blog/categories')}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 mr-4"
                    >
                        Manage Categories
                    </button>
                    <button
                        onClick={() => navigate('/admin/blog/new')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                        <PlusCircle size={20} className="mr-2" />
                        New Post
                    </button>
                </div>
            </div>

            <div className="mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <input
                    type="text"
                    placeholder="Search by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                         <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Title</th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Author</th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Status</th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Published Date</th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.map(post => (
                                <tr key={post.id} className="border-b dark:border-gray-700">
                                    <td className="px-5 py-5 text-sm">
                                        <p className="font-semibold">{post.title}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <p>{post.users?.full_name || 'N/A'}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${
                                            post.status === 'published' ? 'bg-green-200 text-green-900' :
                                            post.status === 'draft' ? 'bg-yellow-200 text-yellow-900' :
                                            'bg-gray-200 text-gray-900'
                                        }`}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <p>{post.published_at ? format(new Date(post.published_at), 'PPP') : 'Not Published'}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <div className="flex items-center space-x-3">
                                            <a href={`/blog/${post.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700" title="View Post">
                                                <Eye size={20} />
                                            </a>
                                            <button onClick={() => navigate(`/admin/blog/edit/${post.id}`)} className="text-yellow-500 hover:text-yellow-700" title="Edit Post">
                                                <Edit size={20} />
                                            </button>
                                            <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-700" title="Delete Post">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BlogList;