import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const InternalComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const fetchComplaints = useCallback(() => {
        axios.get(`internal-complaints/?sort_by=date&sort_order=${sortOrder}&page=${currentPage}`)
            .then(response => {
                setComplaints(response.data.results);
                setTotalPages(Math.ceil(response.data.count / 10));
            })
            .catch(error => {
                console.error('There was an error fetching the complaints!', error);
            });
    }, [sortOrder, currentPage]);

    useEffect(() => {
    fetchComplaints();
}, [fetchComplaints]);



    const handleEdit = (complaintNumber) => {
        console.log(`Upraviť reklamáciu č.: ${complaintNumber}`);
        navigate(`/internal-edit-complaint/${complaintNumber}`);
    };

    const handleSort = () => {
        setSortOrder(prevOrder => (prevOrder === 'desc' ? 'asc' : 'desc'));
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">Interné Reklamácie</h1>
            <table className="min-w-full bg-white">
                <thead className="bg-gray-800 text-white">
                    <tr>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Číslo reklamácie</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Model</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm cursor-pointer" onClick={handleSort}>
                            Dátum {sortOrder === 'asc' ? '▲' : '▼'}
                        </th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Číslo súčiastky</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Číslo výrobku</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Priorita</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Dôvod</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Aktivity PASS SK</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Zodpovedný</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Vytvoril</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Počet kusov</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Stav reklamácie</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Poznámka</th>
                        <th>Upraviť</th>
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {complaints.map(complaint => (
                        <tr key={complaint.id}>
                            <td className="text-left py-3 px-4">{complaint.complaint_number}</td>
                            <td className="text-left py-3 px-4">{complaint.model}</td>
                            <td className="text-left py-3 px-4">{complaint.date}</td>
                            <td className="text-left py-3 px-4">{complaint.part_number}</td>
                            <td className="text-left py-3 px-4">{complaint.product_number}</td>
                            <td className="text-left py-3 px-4">{complaint.priority}</td>
                            <td className="text-left py-3 px-4">{complaint.reason}</td>
                            <td className="text-left py-3 px-4">{complaint.activities_pass_sk}</td>
                            <td className="text-left py-3 px-4">{complaint.responsible}</td>
                            <td className="text-left py-3 px-4">{complaint.created_by}</td>
                            <td className="text-left py-3 px-4">{complaint.quantity}</td>
                            <td className="text-left py-3 px-4">{complaint.complaint_status}</td>
                            <td className="text-left py-3 px-4">{complaint.note}</td>
                            <td><button onClick={() => handleEdit(complaint.complaint_number)}>Upraviť</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-center mt-4">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="mx-1 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                    Predchádzajúca
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`mx-1 px-3 py-2 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-gray-300`}
                    >
                        {index + 1}
                    </button>
                ))}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="mx-1 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                    Ďalšia
                </button>
            </div>
        </div>
    );
}

export default InternalComplaints;
