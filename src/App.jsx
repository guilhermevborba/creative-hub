import React from "react";
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar'; 
import "./tailwind.css"

import NovaIdeia from './pages/NovaIdeia'; 

const DashboardPage = () => <div className="p-8"><h1>Dashboard Principal</h1><p>Página em construção.</p></div>;
const KanbanPage = () => <div className="p-8"><h1>Quadro Kanban</h1><p>Página em construção.</p></div>;
const CalendarioPage = () => <div className="p-8"><h1>Calendário</h1><p>Página em construção.</p></div>;


function App() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            
            <Sidebar />
            
            <main className="flex-grow pt-4 pl-64">
                <div className="p-4">
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        
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