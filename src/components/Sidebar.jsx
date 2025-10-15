import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    LayoutDashboard, 
    FolderOpen, 
    Lightbulb, 
    Wrench, 
    Calendar, 
    ChevronDown, 
    HelpCircle, 
    LogOut, 
} from 'lucide-react'; 

const links = [
    { path: "/", name: "Dashboard", icon: LayoutDashboard },
    { path: "/projetos", name: "Projetos", icon: FolderOpen },
    { 
        name: "Ideias", 
        icon: Lightbulb, 
        submenu: [
            { path: "/criar", name: "Nova Ideia" },
            { path: "/referencias", name: "Referências" },
        ] 
    },
    { 
        name: "Templates", 
        icon: Wrench, 
        submenu: [
            { path: "/templates/geral", name: "Geral" },
            { path: "/templates/video", name: "Vídeo" },
        ] 
    },
    { path: "/calendario", name: "Calendário", icon: Calendar },
];

const PRIMARY_COLOR_CLASSES = "text-slate-600 hover:bg-slate-100 hover:text-indigo-600";
const ACTIVE_COLOR_CLASSES = "bg-slate-100 text-indigo-600 font-semibold border-r-4 border-indigo-600";


const Sidebar = () => {
    const [openMenu, setOpenMenu] = useState(null);

    const toggleMenu = (name) => {
        setOpenMenu(openMenu === name ? null : name);
    };

    const NavItem = ({ link, isActive }) => {
        if (link.path) {
            return (
                <Link
                    to={link.path}
                    className={`flex items-center p-3 rounded-lg text-sm transition duration-150 ${
                        isActive ? ACTIVE_COLOR_CLASSES : PRIMARY_COLOR_CLASSES
                    } ${isActive ? 'font-semibold' : 'font-medium'}`}
                >
                    <link.icon className="w-5 h-5 mr-3" />
                    {link.name}
                </Link>
            );
        }

        return (
            <div 
                onClick={() => toggleMenu(link.name)}
                className={`flex items-center justify-between cursor-pointer p-3 rounded-lg text-sm transition duration-150 ${
                    openMenu === link.name ? ACTIVE_COLOR_CLASSES : PRIMARY_COLOR_CLASSES
                } font-medium`}
            >
                <div className="flex items-center">
                    <link.icon className="w-5 h-5 mr-3" />
                    {link.name}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openMenu === link.name ? 'rotate-180' : ''}`} />
            </div>
        );
    };

    return (
        <div className="fixed top-0 left-0 h-screen w-64 bg-white p-4 flex flex-col shadow-lg z-50">
            
            <div className="mb-8 pt-2 pb-4">
                <h1 className="text-2xl font-extrabold text-gray-900">
                    CreativeHub
                </h1> 
            </div>

            <nav className="flex-grow overflow-y-auto">
                <ul className="space-y-1">
                    {links.map((link) => (
                        <li key={link.name}>
                            <NavItem link={link} isActive={window.location.pathname === link.path} />
                            
                            {link.submenu && openMenu === link.name && (
                                <ul className="pl-8 pt-1 pb-1 space-y-1 bg-slate-50 rounded-lg mt-1">
                                    {link.submenu.map((subLink) => (
                                        <li key={subLink.path}>
                                            <Link 
                                                to={subLink.path}
                                                className="block p-2 text-xs text-slate-600 hover:text-indigo-600 transition duration-100"
                                            >
                                                {subLink.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
            
            <div className="mt-auto border-t border-gray-200 pt-4 space-y-1">
                <Link to="/ajuda" className="flex items-center p-3 text-sm font-medium text-slate-600 hover:text-indigo-600 transition duration-150">
                    <HelpCircle className="w-5 h-5 mr-3" />
                    Ajuda
                </Link>
                <button className="flex items-center w-full p-3 text-red-500 rounded-lg text-sm font-medium transition duration-150 hover:bg-red-50">
                    <LogOut className="w-5 h-5 mr-3" />
                    Sair
                </button>
            </div>
        </div>
    );
};

export default Sidebar;