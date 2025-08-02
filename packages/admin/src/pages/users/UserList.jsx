import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { format } from 'date-fns';
import { UserPlus, Edit, Trash2, Shield } from 'lucide-react';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const navigate = useNavigate();

    const fetchUsersAndRoles = async () => {
        setLoading(true);
        // Fetch all roles
        const { data: rolesData, error: rolesError } = await supabase.from('roles').select('*');
        if (rolesError) {
            setError('Failed to fetch roles.');
            console.error('Error fetching roles:', rolesError);
            setLoading(false);
            return;
        }
        setRoles(rolesData);

        // Fetch all users with their role name
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select(`
                id,
                full_name,
                created_at,
                role_id,
                roles (name),
                auth_user:auth.users (email)
            `)
            .order('created_at', { ascending: false });

        if (usersError) {
            setError('Failed to fetch users.');
            console.error('Error fetching users:', usersError);
        } else {
            // Combine auth email with user profile data
            const formattedUsers = usersData.map(u => ({
                ...u,
                email: u.auth_user?.email || 'N/A'
            }));
            setUsers(formattedUsers);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsersAndRoles();
    }, []);
    
    const handleRoleChange = async (userId, newRoleId) => {
        const { error } = await supabase
            .from('users')
            .update({ role_id: newRoleId })
            .eq('id', userId);

        if (error) {
            setError('Failed to update user role.');
            console.error('Error updating role:', error);
        } else {
            // Refresh the list to show the change
            fetchUsersAndRoles();
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action is irreversible and will delete all their associated data.')) {
            return;
        }
        // Deleting from auth.users will cascade delete the public.users record
        // This requires elevated service_role key permissions, handled via a server-side function.
        const { error } = await supabase.rpc('delete_user', { user_id: userId });

        if (error) {
            setError('Failed to delete user. Make sure the delete_user RPC function is set up.');
            console.error('Error deleting user:', error);
        } else {
            setUsers(users.filter(user => user.id !== userId));
        }
    };
    
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || user.roles.name === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    if (loading) return <div>Loading users...</div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">User Management</h1>
                <button
                    onClick={() => navigate('/admin/users/new')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                    <UserPlus size={20} className="mr-2" />
                    Invite User
                </button>
            </div>

            <div className="mb-4 flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 capitalize"
                >
                    <option value="all">All Roles</option>
                    {roles.map(role => (
                        <option key={role.id} value={role.name} className="capitalize">{role.name}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase">User</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase">Role</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase">Joined Date</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="border-b dark:border-gray-700">
                                    <td className="px-5 py-5 text-sm">
                                        <p className="font-semibold">{user.full_name || 'No Name Provided'}</p>
                                        <p className="text-gray-500">{user.email}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                       <div className="flex items-center">
                                            <Shield size={16} className="mr-2 text-gray-500"/>
                                            <select 
                                                value={user.role_id} 
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="capitalize p-1 bg-transparent border rounded-md"
                                            >
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.id} className="capitalize">{role.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <p>{format(new Date(user.created_at), 'PPP')}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => navigate(`/admin/users/edit/${user.id}`)} className="text-yellow-500 hover:text-yellow-700" title="Edit User">
                                                <Edit size={20} />
                                            </button>
                                            <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700" title="Delete User">
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

export default UserList;