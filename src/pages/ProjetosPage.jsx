import React from "react";
import PageHeader from '../components/PageHeader';

function ProjetosPage() { 
    return (
        <>
            <PageHeader title="Projetos" />
            <div className="mt-24 pb-10 px-8 w-full"> 
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <p className="text-gray-500">Página de Projetos em Construção.</p>
                </div>
            </div>
        </>
    );
}

export default ProjetosPage;