import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, DocumentDuplicateIcon, PlusCircleIcon, ChartBarIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import logo from '../assets/logo.png';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const { authToken, logout, user } = useContext(AuthContext);

    return (
        <div className="w-64 bg-gray-800 text-white h-screen fixed">
            <div className="flex items-center justify-center p-4">
                <img src={logo} alt="Logo" className="w-40 h-20" />
            </div>
            <nav className="flex-1 px-2 space-y-2">
                <NavLink to="/" className={({ isActive }) => isActive ? "bg-gray-700 text-white flex items-center p-2 rounded" : "text-gray-300 flex items-center p-2 rounded hover:bg-gray-700"}>
                    <HomeIcon className="h-6 w-6 mr-2" />
                    Domov
                </NavLink>
                <NavLink to="/internal-complaints" className={({ isActive }) => isActive ? "bg-gray-700 text-white flex items-center p-2 rounded" : "text-gray-300 flex items-center p-2 rounded hover:bg-gray-700"}>
                    <DocumentDuplicateIcon className="h-6 w-6 mr-2" />
                    Interné reklamácie
                </NavLink>
                <NavLink to="/external-complaints" className={({ isActive }) => isActive ? "bg-gray-700 text-white flex items-center p-2 rounded" : "text-gray-300 flex items-center p-2 rounded hover:bg-gray-700"}>
                    <DocumentDuplicateIcon className="h-6 w-6 mr-2" />
                    Externé reklamácie
                </NavLink>
                {authToken && (
                    <>
                        <NavLink to="/complaint/new" className={({ isActive }) => isActive ? "bg-gray-700 text-white flex items-center p-2 rounded" : "text-gray-300 flex items-center p-2 rounded hover:bg-gray-700"}>
                            <PlusCircleIcon className="h-6 w-6 mr-2" />
                            Vytvoriť reklamáciu
                        </NavLink>
                        <NavLink to="/statistics" className={({ isActive }) => isActive ? "bg-gray-700 text-white flex items-center p-2 rounded" : "text-gray-300 flex items-center p-2 rounded hover:bg-gray-700"}>
                            <ChartBarIcon className="h-6 w-6 mr-2" />
                            Štatistiky
                        </NavLink>
                        <NavLink to="/upload" className={({ isActive }) => isActive ? "bg-gray-700 text-white flex items-center p-2 rounded" : "text-gray-300 flex items-center p-2 rounded hover:bg-gray-700"}>
                            <ArrowUpTrayIcon className="h-6 w-6 mr-2" />
                            Import
                        </NavLink>
                        <NavLink to="/logs" className={({ isActive }) => isActive ? "bg-gray-700 text-white flex items-center p-2 rounded" : "text-gray-300 flex items-center p-2 rounded hover:bg-gray-700"}>
                            <ClipboardDocumentListIcon className="h-6 w-6 mr-2" />
                            Logy
                        </NavLink>
                    </>
                )}
                {authToken ? (
                    <div className="text-gray-300 flex flex-col items-center p-2 rounded hover:bg-gray-700">
                        <span className="mb-2 font-bold">Prihlásený ako <span className="text-yellow-500">{user?.username || 'Neznámy užívateľ'}</span></span>
                        <button onClick={logout} className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-700">Odhlásiť sa</button>
                    </div>
                ) : (
                    <NavLink to="/login" className={({ isActive }) => isActive ? "bg-gray-700 text-white flex items-center p-2 rounded" : "text-gray-300 flex items-center p-2 rounded hover:bg-gray-700"}>
                        Prihlásiť sa
                    </NavLink>
                )}
            </nav>
        </div>
    );
};

export default Sidebar;