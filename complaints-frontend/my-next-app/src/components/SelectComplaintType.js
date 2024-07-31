import React from 'react';
import { useNavigate } from 'react-router-dom';

const SelectComplaintType = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">Vytvoriť reklamáciu</h1>
            <div className="flex flex-col items-center space-y-4">
                <button 
                    onClick={() => navigate('/complaint/new/internal')} 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Vytvoriť internú reklamáciu
                </button>
                <button 
                    onClick={() => navigate('/complaint/new/external')} 
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Vytvoriť externú reklamáciu
                </button>
            </div>
        </div>
    );
}

export default SelectComplaintType;