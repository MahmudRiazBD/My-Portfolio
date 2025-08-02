// src/pages/MyAccount/MyAccount.jsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const MyAccount = () => {
  const { user } = useAuth();

  if (!user) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Role:</strong> {user.role}</p>
        {/* Add more account details here */}
      </div>
    </div>
  );
};

export default MyAccount;
