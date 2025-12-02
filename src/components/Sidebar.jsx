import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from "../utils/supabase";
import { 
    LayoutDashboard, 
    FolderOpen, 
    Lightbulb, 
    SquareKanban, 
    Calendar, 
    ChevronDown, 
    HelpCircle, 
    LogOut, 
} from 'lucide-react'; 

const links = [
    { path: "/", name: "Dashboard", icon: LayoutDashboard },
    // { path: "/projetos", name: "Projetos", icon: FolderOpen },
    { path: "/criar", name: "Ideias", icon: Lightbulb },
    { path: "/kanban", name: "Kanban", icon: SquareKanban},
    { path: "/calendario", name: "Calendário", icon: Calendar },
];

const PRIMARY_COLOR_CLASSES = "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700";
const ACTIVE_COLOR_CLASSES = "bg-indigo-100 text-indigo-700 font-bold border-r-4 border-indigo-600"; 


const Sidebar = () => {
    const [openMenu, setOpenMenu] = useState(null); 
    const location = useLocation(); 
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error("Erro ao fazer logout:", error.message);
            } else {
                navigate("/"); 
            }
        } catch (error) {
            console.error("Erro inesperado no logout:", error);
        }
    };

    const NavItem = ({ link }) => {
        const isActive = location.pathname === link.path;
        const isDashboardActive = link.path === "/" && location.pathname === "/"; 
        
        const itemClass = isActive || isDashboardActive
            ? ACTIVE_COLOR_CLASSES 
            : PRIMARY_COLOR_CLASSES;

        return (
            <Link
                to={link.path}
                className={`flex items-center p-3 transition duration-150 ${itemClass} rounded-lg`}
            >
                <link.icon className="w-5 h-5 mr-3" />
                {link.name}
            </Link>
        );
    };

    return (
        <div className="fixed top-0 left-0 h-screen w-64 bg-white p-4 flex flex-col shadow-2xl z-50">
            
            <div className="mb-8 pt-2 pb-4 border-b border-gray-100">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-wide">
                    CreativeHub
                </h1> 
            </div>

            <nav className="flex-grow overflow-y-auto">
                <ul className="space-y-1">
                    {links.map((link) => (
                        <li key={link.name}>
                            <NavItem link={link} />
                        </li>
                    ))}
                </ul>
            </nav>
            
            <div className="mt-auto border-t border-gray-200 pt-4 space-y-1">
                <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full p-3 text-sm font-medium text-red-500 rounded-lg transition duration-150 hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sair
                </button>
            </div>
        </div>
    );
};

export default Sidebar;