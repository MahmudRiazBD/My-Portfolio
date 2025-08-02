import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { UploadCloud, Trash2, Copy, Eye, Search } from 'lucide-react';
import { format } from 'date-fns';

// A single file card component
const FileCard = ({ file, onDelete, onCopyUrl }) => (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="h-40 flex items-center justify-center bg-gray-200 dark:bg-gray-600">
            {file.mime_type?.startsWith('image/') ? (
                <img src={file.url} alt={file.file_name} className="h-full w-full object-cover" />
            ) : (
                <div className="text-center p-2">
                    <p className="text-gray-500 text-xs truncate">{file.mime_type}</p>
                </div>
            )}
        </div>
        <div className="p-4">
            <p className="font-semibold text-sm truncate" title={file.file_name}>{file.file_name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{(file.file_size / 1024).toFixed(2)} KB</p>
        </div>
        <div className="p-2 bg-gray-100 dark:bg-gray-800 flex justify-around">
            <button onClick={() => window.open(file.url, '_blank')} className="text-blue-500 hover:text-blue-700" title="Preview"><Eye size={18}/></button>
            <button onClick={() => onCopyUrl(file.url)} className="text-green-500 hover:text-green-700" title="Copy URL"><Copy size={18}/></button>
            <button onClick={() => onDelete(file.id, file.storage_path)} className="text-red-500 hover:text-red-700" title="Delete"><Trash2 size={18}/></button>
        </div>
    </div>
);


const MediaManager = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL;

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('media_files')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            setError('Failed to fetch files.');
            console.error(error);
        } else {
            const filesWithUrls = data.map(file => ({
                ...file,
                url: `${r2PublicUrl}/${file.storage_path}`
            }));
            setFiles(filesWithUrls);
        }
        setLoading(false);
    }, [r2PublicUrl]);

    useEffect(() => {
        if (!r2PublicUrl) {
            setError('R2 public URL is not configured. Please set VITE_R2_PUBLIC_URL in your .env file.');
        }
        fetchFiles();
    }, [fetchFiles, r2PublicUrl]);
    
    const handleFileUpload = async (e) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;
        setUploading(true);
        setError('');

        for (const file of selectedFiles) {
            try {
                // 1. Get pre-signed URL from our API
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileName: file.name, contentType: file.type }),
                });
                const { url, storagePath } = await response.json();

                // 2. Upload file to R2 using the pre-signed URL
                await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
                
                // 3. Save file metadata to Supabase
                const { data: { user } } = await supabase.auth.getUser();
                await supabase.from('media_files').insert({
                    file_name: file.name,
                    storage_path: storagePath,
                    mime_type: file.type,
                    file_size: file.size,
                    uploader_id: user.id
                });

            } catch (err) {
                console.error('Upload failed:', err);
                setError(`Failed to upload ${file.name}.`);
                break; // Stop on first error
            }
        }
        
        setUploading(false);
        await fetchFiles(); // Refresh the list
    };

    const handleDeleteFile = async (fileId, storagePath) => {
        if (!window.confirm('Are you sure you want to delete this file permanently?')) return;
        
        try {
            // 1. Delete file from R2 via our serverless function
            const response = await fetch('/api/delete-file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storagePath }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete file from storage.');
            }

            // 2. Delete file metadata from Supabase
            const { error: dbError } = await supabase.from('media_files').delete().eq('id', fileId);
            if (dbError) throw dbError;

            setFiles(files.filter(f => f.id !== fileId));

        } catch (err) {
            setError(err.message);
            console.error(err);
        }
    };
    
    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url).then(() => {
            alert('URL copied to clipboard!');
        });
    };
    
    const filteredFiles = files.filter(file => 
        file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Media Manager</h1>
                <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center cursor-pointer">
                    <UploadCloud size={20} className="mr-2" />
                    {uploading ? 'Uploading...' : 'Upload New File'}
                    <input type="file" multiple onChange={handleFileUpload} disabled={uploading} className="hidden" />
                </label>
            </div>

            <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center">
                 <Search size={20} className="text-gray-400 mr-3"/>
                 <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent focus:outline-none"
                />
            </div>

            {loading && <p>Loading files...</p>}
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredFiles.map(file => (
                    <FileCard key={file.id} file={file} onDelete={handleDeleteFile} onCopyUrl={copyToClipboard} />
                ))}
            </div>
        </div>
    );
};

export default MediaManager;