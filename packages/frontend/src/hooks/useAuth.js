// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserRole = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      return data?.role;
    } catch (error) {
      console.error('Error in getUserRole:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const role = await getUserRole(session.user.id);
        setUser({ ...session.user, role });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const role = await getUserRole(session.user.id);
        setUser({ ...session.user, role });
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [getUserRole]);

  const login = (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signup = (email, password) => {
    return supabase.auth.signUp({ email, password });
  };

  const logout = () => {
    return supabase.auth.signOut();
  };

  return { user, loading, login, signup, logout, getUserRole };
};
