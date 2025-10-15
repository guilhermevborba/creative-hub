import React from 'react';

const AIAssistantSidebar = () => {
    return (
        <aside className="fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-200 p-6 shadow-2xl z-40" style={{ marginTop: '64px' }}>
            
            <h3 className="text-base font-semibold text-gray-700 mb-4">
                Precisa de ajuda para criar?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
                Utilize a IA do CreativeHub.
            </p>

            <div className="flex flex-col h-full -mt-24">
                <textarea
                    placeholder="Digite aqui..."
                    className="w-full h-full p-4 border border-gray-300 rounded-lg resize-none text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    rows="15" 
                    disabled
                ></textarea>
            </div>
        </aside>
    );
};

export default AIAssistantSidebar;