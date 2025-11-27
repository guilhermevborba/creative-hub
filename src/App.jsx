import React, { useEffect, useState } from "react";
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar'; 
import { supabase } from './utils/supabase';
import LoginPage from './pages/LoginPage';
import NovaIdeia from './pages/NovaIdeia'; 
import KanbanPage from './pages/KanbanPage'; 
import CalendarioPage from './pages/CalendarioPage';
import ProjetosPage from "./pages/ProjetosPage"; 
import DashboardPage from "./pages/DashboardPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";



function AppWrapper() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setLoading(false);
            }
        );

        return () => authListener.subscription.unsubscribe();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Carregando...</div>;
    }

    if (!session) {
        return <LoginPage />;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-grow pt-4 pl-64">
                <div className="p-4">
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/projetos" element={<ProjetosPage />} />
                        <Route path="/criar" element={<NovaIdeia />} />
                        <Route path="/kanban" element={<KanbanPage />} />
                        <Route path="/calendario" element={<CalendarioPage />} />
                        <Route path="/dashboard" element={<DashboardPage/>}/>
                        <Route path="/reset-password" element={<ResetPasswordPage />} />

                    </Routes>
                </div>
            </main>
        </div>
    );
}

export default function App() {
    return <AppWrapper />;
}
