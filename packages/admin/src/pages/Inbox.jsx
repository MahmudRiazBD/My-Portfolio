import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { format } from 'date-fns';
import { Eye, Trash2, Mail, CheckCircle } from 'lucide-react';

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const fetchMessages = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            setError('Failed to fetch messages.');
            console.error('Error fetching messages:', error);
        } else {
            setMessages(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleViewMessage = (message) => {
        setSelectedMessage(message);
        // Mark as read if it's unread
        if (message.status === 'unread') {
            updateMessageStatus(message.id, 'read');
        }
    };

    const updateMessageStatus = async (id, status) => {
        const { data, error } = await supabase
            .from('messages')
            .update({ status })
            .eq('id', id)
            .select()
            .single(); // to get the updated record back

        if (error) {
            console.error('Error updating message status:', error);
            // Optionally, show an error to the user
        } else {
            setMessages(messages.map(msg => msg.id === id ? data : msg));
            if (selectedMessage && selectedMessage.id === id) {
                setSelectedMessage(data);
            }
        }
    };
    
    const handleDeleteMessage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) {
            return;
        }

        const { error } = await supabase.from('messages').delete().eq('id', id);

        if (error) {
            setError('Failed to delete message.');
            console.error('Error deleting message:', error);
        } else {
            setMessages(messages.filter(msg => msg.id !== id));
            if(selectedMessage && selectedMessage.id === id) {
                setSelectedMessage(null); // Close modal if the deleted message was open
            }
        }
    };


    if (loading) {
        return <div>Loading messages...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Inbox</h1>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Sender</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Subject</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Received</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map((message) => (
                                <tr key={message.id} className={`border-b border-gray-200 dark:border-gray-700 ${message.status === 'unread' ? 'font-bold' : ''}`}>
                                    <td className="px-5 py-5 text-sm">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${message.status === 'read' ? 'bg-gray-200 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {message.status}
                                      </span>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <p className="text-gray-900 dark:text-white whitespace-no-wrap">{message.name}</p>
                                        <p className="text-gray-600 dark:text-gray-400 whitespace-no-wrap text-xs">{message.email}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <p className="text-gray-900 dark:text-white whitespace-no-wrap">{message.subject}</p>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <p className="text-gray-900 dark:text-white whitespace-no-wrap">
                                            {format(new Date(message.created_at), 'PPP p')}
                                        </p>
                                    </td>
                                    <td className="px-5 py-5 text-sm">
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => handleViewMessage(message)} className="text-blue-500 hover:text-blue-700" title="View Message">
                                                <Eye size={20} />
                                            </button>
                                            <button onClick={() => handleDeleteMessage(message.id)} className="text-red-500 hover:text-red-700" title="Delete Message">
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

            {selectedMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4">
                       <div className="p-6 border-b dark:border-gray-700">
                           <h3 className="text-xl font-semibold">{selectedMessage.subject}</h3>
                           <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                               <span>From: {selectedMessage.name} &lt;{selectedMessage.email}&gt;</span><br/>
                               <span>Received: {format(new Date(selectedMessage.created_at), 'PPP p')}</span>
                           </div>
                       </div>
                       <div className="p-6 h-64 overflow-y-auto">
                           <p className="text-base leading-relaxed">{selectedMessage.body}</p>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 rounded-b-lg">
                           <div>
                            {selectedMessage.status === 'unread' && (
                                <button onClick={() => updateMessageStatus(selectedMessage.id, 'read')} className="flex items-center text-sm text-green-600 hover:text-green-800 font-medium py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <CheckCircle size={16} className="mr-2"/> Mark as Read
                                </button>
                            )}
                            </div>
                           <button onClick={() => setSelectedMessage(null)} className="py-2 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Close</button>
                       </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inbox;