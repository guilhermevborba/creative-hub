import React from 'react';
import { Search, User } from 'lucide-react';

const PageHeader = ({ title, actionButton }) => {
    return (
        <header className="flex justify-between items-center h-16 bg-white border-b border-gray-200 px-6 fixed top-0 right-0 z-10" style={{ marginLeft: '256px', width: 'calc(100% - 256px)' }}>
            
            <h1 className="text-2xl font-semibold text-gray-800">
                {title}
            </h1>

            {actionButton && <div className="ml-auto">{actionButton}</div>}

            <div className="flex items-center space-x-6 ml-10">
                <Search className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />
                <div className="flex items-center space-x-2 cursor-pointer">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Admin</span>
                </div>
            </div>
        </header>
    );
};

export default PageHeader;