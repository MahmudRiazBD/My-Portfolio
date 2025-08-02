import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Save, ShieldAlert } from 'lucide-react';

const PermissionManager = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [rolePermissions, setRolePermissions] = useState({}); // e.g., { roleId: [permId1, permId2] }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data: rolesData, error: rolesError } = await supabase.from('roles').select('*');
        const { data: permsData, error: permsError } = await supabase.from('permissions').select('*');
        const { data: rolePermsData, error: rolePermsError } = await supabase.from('role_permissions').select('*');

        if (rolesError || permsError || rolePermsError) {
            setError('Failed to load permission data.');
            console.error(rolesError || permsError || rolePermsError);
            setLoading(false);
            return;
        }

        setRoles(rolesData);
        setPermissions(permsData);

        const permsMap = rolePermsData.reduce((acc, rp) => {
            if (!acc[rp.role_id]) {
                acc[rp.role_id] = [];
            }
            acc[rp.role_id].push(rp.permission_id);
            return acc;
        }, {});
        setRolePermissions(permsMap);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePermissionChange = (roleId, permissionId) => {
        setRolePermissions(prev => {
            const currentPerms = prev[roleId] ? [...prev[roleId]] : [];
            const permIndex = currentPerms.indexOf(permissionId);

            if (permIndex > -1) {
                currentPerms.splice(permIndex, 1); // Remove permission
            } else {
                currentPerms.push(permissionId); // Add permission
            }
            return { ...prev, [roleId]: currentPerms };
        });
    };
    
    const handleSavePermissions = async (roleId) => {
        setSaving(true);
        setError('');

        const currentPermissionIds = rolePermissions[roleId] || [];
        
        // 1. Delete all existing permissions for this role
        const { error: deleteError } = await supabase.from('role_permissions').delete().eq('role_id', roleId);
        if (deleteError) {
            setError(`Failed to update permissions for role ID ${roleId}.`);
            console.error(deleteError);
            setSaving(false);
            return;
        }

        // 2. Insert the new set of permissions if there are any
        if (currentPermissionIds.length > 0) {
            const newPermsToInsert = currentPermissionIds.map(pid => ({
                role_id: roleId,
                permission_id: pid
            }));
            const { error: insertError } = await supabase.from('role_permissions').insert(newPermsToInsert);
            if (insertError) {
                setError(`Failed to insert new permissions for role ID ${roleId}.`);
                console.error(insertError);
                setSaving(false);
                return;
            }
        }
        
        setSaving(false);
        alert(`Permissions for role ID ${roleId} saved!`);
    };

    const modules = [...new Set(permissions.map(p => p.module))];

    if (loading) return <div>Loading Permission Matrix...</div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Role & Permission Management</h1>
            </div>
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6 flex items-center">
                <ShieldAlert className="mr-3"/>
                <p>Changes here are critical and take effect immediately. Be cautious when editing Admin permissions.</p>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="p-4 text-left font-semibold sticky left-0 bg-gray-100 dark:bg-gray-700">Module</th>
                            <th className="p-4 text-left font-semibold sticky left-0 bg-gray-100 dark:bg-gray-700 z-10">Permission</th>
                            {roles.map(role => (
                                <th key={role.id} className="p-4 text-center font-semibold capitalize">{role.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {modules.map(module => (
                            <React.Fragment key={module}>
                                <tr className="bg-gray-50 dark:bg-gray-700 border-t border-b border-gray-200 dark:border-gray-600">
                                    <td colSpan={roles.length + 2} className="p-2 font-bold text-gray-700 dark:text-gray-300">{module}</td>
                                </tr>
                                {permissions.filter(p => p.module === module).map((permission, pIdx) => (
                                    <tr key={permission.id} className={`border-b border-gray-200 dark:border-gray-600 ${pIdx % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                                        <td className="p-3 sticky left-0 bg-white dark:bg-gray-800">{pIdx === 0 ? module : ''}</td>
                                        <td className="p-3 font-mono text-xs sticky left-0 bg-white dark:bg-gray-800 z-10">{permission.name}</td>
                                        {roles.map(role => (
                                            <td key={role.id} className="p-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                                                    disabled={role.name === 'admin'} // Admins always have all permissions
                                                    checked={role.name === 'admin' || (rolePermissions[role.id] && rolePermissions[role.id].includes(permission.id))}
                                                    onChange={() => handlePermissionChange(role.id, permission.id)}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="mt-6 flex justify-end">
                 {roles.filter(r => r.name !== 'admin').map(role => (
                     <button
                        key={role.id}
                        onClick={() => handleSavePermissions(role.id)}
                        disabled={saving}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:bg-blue-400 ml-4"
                    >
                        <Save size={18} className="mr-2" />
                        Save <span className="capitalize ml-1">{role.name}</span> Permissions
                    </button>
                 ))}
            </div>
        </div>
    );
};

export default PermissionManager;