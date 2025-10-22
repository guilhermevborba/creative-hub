import React from "react";
import PageHeader from '../components/PageHeader';
import { motion } from "framer-motion";

function DashboardPage() { 
    return (
        <>
            <PageHeader 
                title="Dashboard" 
                subtitle="Visão geral do seu planejamento e performance"
            />
            
            <motion.div 
                className="mt-24 pb-10 px-8 w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                        Bem-vindo(a) ao CreativeHub!
                    </h2>
                    <p className="text-gray-600">
                        Esta é a área central para visualizar métricas, alertas e o resumo das tarefas. 
                        No momento, a funcionalidade está em construção.
                    </p>
                    <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
                        Próxima Ação: Navegue para "Ideias" ou "Kanban" para começar a criar seu fluxo de conteúdo.
                    </div>
                </div>
            </motion.div>
        </>
    );
}

export default DashboardPage;