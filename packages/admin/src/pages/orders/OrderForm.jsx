import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import RichTextEditor from '../../components/RichTextEditor';

const OrderForm = () => {
    const [formData, setFormData] = useState({
        project_name: '',
        client_id: '',
        project_type: 'Web Development',
        status: 'Pending',
        budget: '',
        start_date: '',
        deadline_date: '',
        brief: '', // This will be handled by RichTextEditor
    });
    const [clients, setClients] = useState([]);
    const [briefContent, setBriefContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    // Fetch clients for the dropdown
    useEffect(() => {
        const fetchClients = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('id, full_name, roles(name)')
                .eq('roles.name', 'client');
            
            if(error) console.error("Error fetching clients", error);
            else setClients(data || []);
        };
        fetchClients();
    }, []);

    // Fetch order data if editing
    useEffect(() => {
        if (id) {
            setLoading(true);
            const fetchOrder = async () => {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error) {
                    setError('Could not fetch order data.');
                    console.error(error);
                } else if (data) {
                    setFormData({
                        ...data,
                        budget: data.budget || '',
                        start_date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : '',
                        deadline_date: data.deadline_date ? new Date(data.deadline_date).toISOString().split('T')[0] : '',
                    });
                    setBriefContent(data.brief || '');
                }
                setLoading(false);
            };
            fetchOrder();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const orderPayload = {
            ...formData,
            brief: briefContent,
            budget: formData.budget || null,
            start_date: formData.start_date || null,
            deadline_date: formData.deadline_date || null,
        };
        
        const { error } = id
            ? await supabase.from('orders').update(orderPayload).match({ id })
            : await supabase.from('orders').insert([orderPayload]);

        if (error) {
            setError(error.message);
            console.error(error);
        } else {
            navigate('/admin/orders');
        }
        setLoading(false);
    };
    
    if (loading && id) return <div>Loading order details...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{id ? 'Edit Order' : 'Create New Order'}</h1>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="project_name" className="block text-sm font-medium mb-1">Project Name</label>
                        <input id="project_name" name="project_name" type="text" value={formData.project_name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                    </div>
                    <div>
                        <label htmlFor="client_id" className="block text-sm font-medium mb-1">Client</label>
                        <select id="client_id" name="client_id" value={formData.client_id} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required>
                            <option value="">Select a Client</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.full_name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="project_type" className="block text-sm font-medium mb-1">Project Type</label>
                        <select id="project_type" name="project_type" value={formData.project_type} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                            <option>Web Development</option>
                            <option>App Development</option>
                            <option>UI/UX Design</option>
                            <option>SEO</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
                        <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Awaiting Feedback</option>
                            <option>Completed</option>
                            <option>Cancelled</option>
                        </select>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div>
                        <label htmlFor="budget" className="block text-sm font-medium mb-1">Budget ($)</label>
                        <input id="budget" name="budget" type="number" step="0.01" value={formData.budget} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="start_date" className="block text-sm font-medium mb-1">Start Date</label>
                        <input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="deadline_date" className="block text-sm font-medium mb-1">Deadline</label>
                        <input id="deadline_date" name="deadline_date" type="date" value={formData.deadline_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Project Brief</label>
                    <RichTextEditor content={briefContent} onChange={setBriefContent} />
                </div>
                
                {/* Add more fields here like requirements, file attachments etc. later */}

                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={() => navigate('/admin/orders')} className="text-gray-600 mr-4">Cancel</button>
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                        {loading ? 'Saving...' : 'Save Order'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OrderForm;