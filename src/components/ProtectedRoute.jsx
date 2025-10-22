import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

function ProtectedRoute() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    }
    
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) {
            setSession(session);
        }
    });

    return () => {
        mounted = false;
        authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl font-medium text-gray-700">Verificando autenticação...</div>;
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;