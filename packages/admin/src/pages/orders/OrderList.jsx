import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { format } from 'date-fns';
import { PlusCircle, Eye, Edit, Trash2 } from 'lucide-react';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const navigate = useNavigate();

    const statusOptions = ['All', 'Pending', 'In Progress', 'Awaiting Feedback', 'Completed', 'Cancelled'];

    const fetchOrders = async () => {
        setLoading(true);
        // We need to fetch related client info as well
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id,
                project_name,
                status,
                budget,
                deadline_date,
                client_id,
                clients (
                    users (full_name)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            setError('Failed to fetch orders.');
            console.error('Error fetching orders:', error);
        } else {
            setOrders(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);
    
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            return;
        }

        // You might want to delete related order_updates first if you don't have cascading delete setup
        const { error } = await supabase.from('orders').delete().eq('id', id);

        if (error) {
            setError('Failed to delete order.');
            console.error('Error deleting order:', error);
        } else {
            setOrders(orders.filter(order => order.id !== id));
        }
    };
    
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const clientName = order.clients?.users?.full_name || 'N/A';
            const matchesSearch = order.project_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  clientName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    if (loading) return <div>Loading orders...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Orders</h1>
                <button
                    onClick={() => navigate('/admin/orders/new')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                    <PlusCircle size={20} className="mr-2" />
                    New Order
                </button>
            </div>

            {/* Filters */}
            <div className="mb-4 flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <input
                    type="text"
                    placeholder="Search by project or client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                    {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                         <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Project Name</th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Client</th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Budget</th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Deadline</th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Status</th>
                                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order.id} className="border-b dark:border-gray-700">
                                    <td className="px-5 py-5 text-sm">
                                        <p className="font-semibold">{order.project_name}</p>
                                    </td>
                                     <td className="px-5 py-5 text-sm">
                                        <p>{order.clients?.users?.full_name || 'N/A'}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <p>${order.budget ? Number(order.budget).toFixed(2) : 'N/A'}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <p>{order.deadline_date ? format(new Date(order.deadline_date), 'PPP') : 'N/A'}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${
                                            order.status === 'Completed' ? 'bg-green-200 text-green-900' :
                                            order.status === 'In Progress' ? 'bg-yellow-200 text-yellow-900' :
                                            order.status === 'Cancelled' ? 'bg-red-200 text-red-900' :
                                            'bg-gray-200 text-gray-900'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => navigate(`/admin/orders/${order.id}`)} className="text-blue-500 hover:text-blue-700" title="View Details">
                                                <Eye size={20} />
                                            </button>
                                            <button onClick={() => navigate(`/admin/orders/edit/${order.id}`)} className="text-yellow-500 hover:text-yellow-700" title="Edit Order">
                                                <Edit size={20} />
                                            </button>
                                            <button onClick={() => handleDelete(order.id)} className="text-red-500 hover:text-red-700" title="Delete Order">
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

export default OrderList;