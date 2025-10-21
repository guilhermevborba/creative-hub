import React from "react";
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar'; 

import NovaIdeia from './pages/NovaIdeia'; 
import KanbanPage from './pages/KanbanPage'; 
import CalendarioPage from './pages/CalendarioPage'; 

const DashboardPage = () => (
    <div className="p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard Principal</h1>
        <p className="text-gray-600">Página em construção.</p>
    </div>
);
const ProjetosPage = () => <div className="p-8"><h1>Projetos em Construção</h1></div>;


function App() {
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
                    </Routes>
                </div>
            </main>
        </div>
    );
}

export default App;