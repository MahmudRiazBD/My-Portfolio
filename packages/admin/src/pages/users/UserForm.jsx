import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const UserForm = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({ full_name: '', avatar_url: '' });
    const [clientData, setClientData] = useState({ company_name: '', website: '', phone_number: '', address: '' });
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            // Fetch user profile and role
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*, roles(name)')
                .eq('id', id)
                .single();

            if (userError) {
                setError('Could not fetch user data.');
                console.error(userError);
                setLoading(false);
                return;
            }

            setUser(userData);
            setProfile({ full_name: userData.full_name || '', avatar_url: userData.avatar_url || '' });
            
            // Check if the user is a client and fetch client data
            if (userData.roles.name === 'client') {
                setIsClient(true);
                const { data: clientInfo, error: clientError } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (clientError && clientError.code !== 'PGRST116') { // Ignore 'no rows found' error
                    console.error("Error fetching client details:", clientError);
                } else if(clientInfo) {
                    setClientData(clientInfo);
                }
            }
            setLoading(false);
        };

        if (id) {
            fetchUserData();
        }
    }, [id]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };
    
    const handleClientDataChange = (e) => {
        const { name, value } = e.target;
        setClientData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Update public.users table
        const { error: profileError } = await supabase
            .from('users')
            .update(profile)
            .eq('id', id);

        if (profileError) {
            setError(profileError.message);
            setLoading(false);
            return;
        }

        // If client, update public.clients table
        if (isClient) {
            const { error: clientError } = await supabase
                .from('clients')
                .update(clientData)
                .eq('id', id);

            if (clientError) {
                setError(clientError.message);
                setLoading(false);
                return;
            }
        }

        setLoading(false);
        navigate('/admin/users');
    };
    
    if (loading) return <div>Loading user profile...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Edit User Profile</h1>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto space-y-6">
                
                <h2 className="text-xl font-semibold border-b pb-2">General Information</h2>
                <div>
                    <label htmlFor="full_name" className="block text-sm font-medium mb-1">Full Name</label>
                    <input id="full_name" name="full_name" type="text" value={profile.full_name} onChange={handleProfileChange} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                    <label htmlFor="avatar_url" className="block text-sm font-medium mb-1">Avatar URL</label>
                    <input id="avatar_url" name="avatar_url" type="text" value={profile.avatar_url} onChange={handleProfileChange} className="w-full px-3 py-2 border rounded-md" />
                    {profile.avatar_url && <img src={profile.avatar_url} alt="avatar" className="w-20 h-20 rounded-full mt-2"/>}
                </div>

                {isClient && (
                    <>
                        <h2 className="text-xl font-semibold border-b pb-2 pt-4">Client Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="company_name" className="block text-sm font-medium mb-1">Company Name</label>
                                <input id="company_name" name="company_name" type="text" value={clientData.company_name} onChange={handleClientDataChange} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                             <div>
                                <label htmlFor="phone_number" className="block text-sm font-medium mb-1">Phone Number</label>
                                <input id="phone_number" name="phone_number" type="text" value={clientData.phone_number} onChange={handleClientDataChange} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="website" className="block text-sm font-medium mb-1">Website</label>
                            <input id="website" name="website" type="text" value={clientData.website} onChange={handleClientDataChange} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                         <div>
                            <label htmlFor="address" className="block text-sm font-medium mb-1">Address</label>
                            <textarea id="address" name="address" value={clientData.address} onChange={handleClientDataChange} rows="3" className="w-full px-3 py-2 border rounded-md"></textarea>
                        </div>
                    </>
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={() => navigate('/admin/users')} className="text-gray-600 mr-4">Cancel</button>
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;