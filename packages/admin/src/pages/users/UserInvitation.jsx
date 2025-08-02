import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const UserInvitation = () => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('client'); // Default role
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Fetch roles for the dropdown
    useEffect(() => {
        const fetchRoles = async () => {
            const { data, error } = await supabase.from('roles').select('*');
            if (error) {
                console.error("Error fetching roles", error);
            } else {
                setRoles(data || []);
            }
        };
        fetchRoles();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Use Supabase's built-in invite functionality
        // We pass the selected role in the user metadata
        const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
            data: { role: role }
        });

        if (error) {
            setError(error.message);
            console.error('Invitation error:', error);
        } else {
            setSuccess(`Invitation sent successfully to ${email}.`);
            setEmail('');
        }
        setLoading(false);
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Invite New User</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-lg mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">User Email</label>
                        <input 
                            id="email" 
                            name="email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
                            required 
                            placeholder="e.g., user@example.com"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium mb-1">Assign Role</label>
                        <select 
                            id="role" 
                            name="role" 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)} 
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 capitalize" 
                            required
                        >
                            {roles.map(r => (
                                <option key={r.id} value={r.name} className="capitalize">{r.name}</option>
                            ))}
                        </select>
                    </div>

                    {error && <p className="text-red-500 text-sm font-semibold p-3 bg-red-100 rounded-md">{error}</p>}
                    {success && <p className="text-green-500 text-sm font-semibold p-3 bg-green-100 rounded-md">{success}</p>}
                    
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={() => navigate('/admin/users')} className="text-gray-600 dark:text-gray-300 mr-4">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                            {loading ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserInvitation;