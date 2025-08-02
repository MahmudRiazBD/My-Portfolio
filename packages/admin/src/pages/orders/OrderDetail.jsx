import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { format } from 'date-fns';
import { Calendar, DollarSign, Flag, Briefcase, User, MessageSquare, Paperclip } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor'; // Assuming you might want to post updates with it

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newUpdate, setNewUpdate] = useState('');

    const fetchOrderAndUpdates = async () => {
        setLoading(true);
        // Fetch order details including client info
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select(`
                *,
                clients(users(full_name, avatar_url))
            `)
            .eq('id', id)
            .single();

        if (orderError) {
            setError('Failed to fetch order details.');
            console.error(orderError);
            setLoading(false);
            return;
        }
        setOrder(orderData);

        // Fetch order updates including author info
        const { data: updatesData, error: updatesError } = await supabase
            .from('order_updates')
            .select(`
                *,
                users(full_name, avatar_url)
            `)
            .eq('order_id', id)
            .order('created_at', { ascending: true });
        
        if (updatesError) {
            setError('Failed to fetch order updates.');
            console.error(updatesError);
        } else {
            setUpdates(updatesData);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchOrderAndUpdates();
    }, [id]);

    const handlePostUpdate = async (e) => {
        e.preventDefault();
        if (!newUpdate.trim()) return;

        // You need to know the current logged-in user's ID
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError('You must be logged in to post an update.');
            return;
        }

        const { data, error } = await supabase
            .from('order_updates')
            .insert({
                order_id: id,
                author_id: user.id,
                content: newUpdate,
                update_type: 'Comment' // Or make this dynamic
            })
            .select('*, users(full_name, avatar_url)')
            .single();

        if (error) {
            setError('Failed to post update.');
            console.error(error);
        } else {
            setUpdates([...updates, data]);
            setNewUpdate('');
        }
    };

    if (loading) return <div>Loading order details...</div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;
    if (!order) return <div>Order not found.</div>;

    return (
        <div className="container mx-auto p-4 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">{order.project_name}</h1>
                    <p className="text-gray-500 mt-1">Order #{order.id}</p>
                </div>
                <Link to={`/admin/orders/edit/${order.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Edit Order
                </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-xl font-semibold mb-4">Details</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center"><User className="mr-3" size={16} /> Client: <strong>{order.clients?.users?.full_name || 'N/A'}</strong></li>
                            <li className="flex items-center"><Briefcase className="mr-3" size={16} /> Type: <strong>{order.project_type}</strong></li>
                            <li className="flex items-center"><Flag className="mr-3" size={16} /> Status: <strong className="ml-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{order.status}</strong></li>
                            <li className="flex items-center"><DollarSign className="mr-3" size={16} /> Budget: <strong>${order.budget ? Number(order.budget).toFixed(2) : 'N/A'}</strong></li>
                            <li className="flex items-center"><Calendar className="mr-3" size={16} /> Start Date: <strong>{order.start_date ? format(new Date(order.start_date), 'PPP') : 'N/A'}</strong></li>
                            <li className="flex items-center"><Calendar className="mr-3 text-red-500" size={16} /> Deadline: <strong>{order.deadline_date ? format(new Date(order.deadline_date), 'PPP') : 'N/A'}</strong></li>
                        </ul>
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-xl font-semibold mb-4">Project Brief</h3>
                        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: order.brief }}></div>
                    </div>
                </div>

                {/* Right Column: Updates & Communication */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <h3 className="text-xl font-semibold p-6">Communication History</h3>
                        {/* Updates List */}
                        <div className="h-96 overflow-y-auto p-6 space-y-4 border-t dark:border-gray-700">
                            {updates.map(update => (
                                <div key={update.id} className="flex items-start space-x-4">
                                    <img src={update.users?.avatar_url || `https://ui-avatars.com/api/?name=${update.users?.full_name}&background=random`} alt="avatar" className="w-10 h-10 rounded-full" />
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className="font-semibold">{update.users?.full_name}</span>
                                            <span className="text-xs text-gray-500">{format(new Date(update.created_at), 'PPp')}</span>
                                        </div>
                                        <p className="text-sm mt-1">{update.content}</p>
                                    </div>
                                </div>
                            ))}
                            {updates.length === 0 && <p className="text-center text-gray-500">No updates yet.</p>}
                        </div>
                        {/* New Update Form */}
                        <div className="p-6 border-t dark:border-gray-700">
                            <form onSubmit={handlePostUpdate} className="flex items-start space-x-4">
                                <img src={`https://ui-avatars.com/api/?name=Me&background=random`} alt="My Avatar" className="w-10 h-10 rounded-full" />
                                <div className="flex-1">
                                    <textarea
                                        value={newUpdate}
                                        onChange={(e) => setNewUpdate(e.target.value)}
                                        placeholder="Post an update or comment..."
                                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                    ></textarea>
                                    <button type="submit" className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold">Post Update</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;