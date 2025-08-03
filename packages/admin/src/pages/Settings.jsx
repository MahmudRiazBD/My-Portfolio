import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../frontend/src/lib/supabaseClient';
import { Save } from 'lucide-react';

const Settings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('settings').select('*');
        if (error) {
            setError('Failed to load settings.');
            console.error(error);
        } else {
            // Convert array to a key-value object for easier state management
            const settingsObject = data.reduce((acc, setting) => {
                acc[setting.key] = {
                    value: setting.value?.value || '',
                    description: setting.description
                };
                return acc;
            }, {});
            setSettings(settingsObject);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleInputChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                value: value
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        // Create an array of update promises
        const updatePromises = Object.keys(settings).map(key =>
            supabase
                .from('settings')
                .update({ value: { value: settings[key].value } })
                .eq('key', key)
        );

        try {
            await Promise.all(updatePromises);
            setSuccess('Settings saved successfully!');
        } catch (err) {
            console.error('Error saving settings:', err);
            setError('An error occurred while saving. Please try again.');
        } finally {
            setSaving(false);
             // Hide success/error message after a few seconds
            setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
        }
    };
    
    const renderInput = (key) => {
        const setting = settings[key];
        return (
             <div key={key} className="mb-4">
                <label htmlFor={key} className="block text-sm font-bold mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
                <input
                    id={key}
                    type="text"
                    value={setting.value}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder={setting.description}
                />
                 <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
            </div>
        )
    }

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Site Settings</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:bg-blue-400"
                >
                    <Save size={18} className="mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
            
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            {success && <p className="text-green-500 bg-green-100 p-3 rounded-md mb-4">{success}</p>}

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-3 mb-4">General Settings</h2>
                {Object.keys(settings).filter(key => key.startsWith('site_') || key.startsWith('logo_')).map(renderInput)}

                <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-3 my-6">SEO Defaults</h2>
                 {Object.keys(settings).filter(key => key.startsWith('meta_')).map(renderInput)}
                
                 <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-3 my-6">Social Media Links</h2>
                 {Object.keys(settings).filter(key => key.startsWith('social_')).map(renderInput)}
            </div>
        </div>
    );
};

export default Settings;