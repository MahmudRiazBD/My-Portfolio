import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import RichTextEditor from '../../components/RichTextEditor';
import Select from 'react-select';

const BlogForm = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('draft');
    const [categoryId, setCategoryId] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [featuredImageUrl, setFeaturedImageUrl] = useState('');
    
    const [categories, setCategories] = useState([]);
    const [allTags, setAllTags] = useState([]); // All available tags for the dropdown
    
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const { id } = useParams();

    // Fetch categories and tags
    useEffect(() => {
        const fetchData = async () => {
            const { data: catData } = await supabase.from('blog_categories').select('*');
            setCategories(catData || []);
            
            const { data: tagData } = await supabase.from('blog_tags').select('*');
            setAllTags(tagData.map(t => ({ value: t.id, label: t.name })) || []);
        };
        fetchData();
    }, []);

    // Fetch blog post data if editing
    useEffect(() => {
        if (id) {
            setLoading(true);
            const fetchPost = async () => {
                const { data, error } = await supabase.from('blogs').select('*, blog_post_tags(tag_id)').eq('id', id).single();
                if (error) {
                    setError('Could not fetch post data.');
                    console.error(error);
                } else if (data) {
                    setTitle(data.title);
                    setContent(data.content || '');
                    setStatus(data.status);
                    setCategoryId(data.category_id);
                    setFeaturedImageUrl(data.featured_image_url || '');
                    // Populate selected tags
                    const currentTags = data.blog_post_tags.map(t => allTags.find(tag => tag.value === t.tag_id)).filter(Boolean);
                    setSelectedTags(currentTags);
                }
                setLoading(false);
            };
             if (allTags.length > 0) fetchPost();
        }
    }, [id, allTags]);

    const handleImageUpload = async (e) => {
        // ... (Similar image upload logic as in PortfolioForm)
        // This should be implemented for featured images
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const { data: { user } } = await supabase.auth.getUser();

        const blogData = {
            title,
            content,
            status,
            category_id: categoryId,
            featured_image_url: featuredImageUrl,
            author_id: user.id,
            published_at: status === 'published' ? new Date().toISOString() : null,
        };

        // Upsert post
        const { data: postData, error: postError } = id
            ? await supabase.from('blogs').update(blogData).match({ id }).select().single()
            : await supabase.from('blogs').insert([blogData]).select().single();

        if (postError) {
            setError(postError.message);
            setLoading(false);
            return;
        }

        // Handle tags
        // 1. Remove existing tags for this post
        if (id) {
            const { error: deleteTagsError } = await supabase.from('blog_post_tags').delete().match({ post_id: id });
            if(deleteTagsError) console.error("Error clearing old tags", deleteTagsError);
        }

        // 2. Add new tags
        const tagLinks = selectedTags.map(tag => ({ post_id: postData.id, tag_id: tag.value }));
        if(tagLinks.length > 0) {
            const { error: insertTagsError } = await supabase.from('blog_post_tags').insert(tagLinks);
            if(insertTagsError) {
                 setError(insertTagsError.message);
                 setLoading(false);
                 return;
            }
        }
        
        setLoading(false);
        navigate('/admin/blog');
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{id ? 'Edit Post' : 'Add New Post'}</h1>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
                
                <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                    <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Content</label>
                    <RichTextEditor content={content} onChange={setContent} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
                        <select id="category" value={categoryId || ''} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                            <option value="">Select a category</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags</label>
                        <Select
                            isMulti
                            options={allTags}
                            value={selectedTags}
                            onChange={setSelectedTags}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>
                </div>

                 <div>
                    <label className="block text-sm font-medium mb-1">Featured Image</label>
                    <input type="file" onChange={handleImageUpload} disabled={uploading} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    {uploading && <p className="text-sm mt-2">Uploading...</p>}
                    {featuredImageUrl && <img src={featuredImageUrl} alt="Featured" className="w-48 h-auto object-cover rounded-md mt-4" />}
                </div>

                <div>
                    <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="scheduled">Scheduled</option>
                    </select>
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={() => navigate('/admin/blog')} className="text-gray-600 mr-4">Cancel</button>
                    <button type="submit" disabled={loading || uploading} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                        {loading || uploading ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BlogForm;
