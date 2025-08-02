import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchClientData();
    }
  }, [user]);

  const fetchClientData = async () => {
    setLoading(true);
    try {
      // Fetch orders for the current user
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', user.id);
      
      if (ordersError) throw ordersError;
      setOrders(ordersData);

      // Fetch messages for the current user
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('client_id', user.id) // Assuming messages table has client_id
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;
      setMessages(messagesData);

    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading your account details...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Account</h1>
      <p>Welcome to your dashboard. Here you can view your orders and messages.</p>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">My Orders</h2>
        {orders.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <ul className="divide-y dark:divide-gray-700">
              {orders.map(order => (
                <li key={order.id} className="p-4">
                  <p className="font-semibold">{order.project_name}</p>
                  <p>Status: <span className="font-medium text-blue-500">{order.status}</span></p>
                  <p>Total: ${order.total_amount}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>You have no active orders.</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">My Messages</h2>
        {messages.length > 0 ? (
           <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <ul className="divide-y dark:divide-gray-700">
                {messages.map(msg => (
                  <li key={msg.id} className="p-4">
                    <p className="font-semibold">{msg.subject}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{msg.message}</p>
                    <p className="text-xs text-gray-500 mt-2">Received: {new Date(msg.created_at).toLocaleDateString()}</p>
                  </li>
                ))}
            </ul>
           </div>
        ) : (
          <p>You have no new messages.</p>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
