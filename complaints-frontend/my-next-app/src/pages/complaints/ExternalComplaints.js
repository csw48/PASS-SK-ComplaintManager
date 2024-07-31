import React, { useEffect, useState, useCallback } from 'react'; 
import axios from '../../api/axios';  
import { useRouter } from 'next/router'; 

const ExternalComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [complaintNumber, setComplaintNumber] = useState('');
    const [modelSk, setModelSk] = useState('');
    const [modelDe, setModelDe] = useState('');
    const [customer, setCustomer] = useState('');
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const router = useRouter();

    const fetchComplaints = useCallback(() => {
        console.log('Fetching complaints with params:', {
            sort_by: 'date',
            sort_order: sortOrder,
            page: currentPage,
            complaint_number: complaintNumber,
            model_sk: modelSk,
            model_de: modelDe,
            customer: customer,
            status: status,
            start_date: startDate,
            end_date: endDate,
        });

        axios.get('external-complaints/', {
            params: {
                sort_by: 'date',
                sort_order: sortOrder,
                page: currentPage,
                complaint_number: complaintNumber,
                model_sk: modelSk,
                model_de: modelDe,
                customer: customer,
                status: status,
                start_date: startDate,
                end_date: endDate,
            }
        })
        .then(response => {
            console.log(response)
            const { results, count } = response.data;
            const data = Array.isArray(results) ? results.map(complaint => ({
                ...complaint,
                ourCosts: complaint.costs
                    ? complaint.costs.filter(cost => cost.type === 'our_costs').reduce((total, cost) => total + cost.cost, 0)
                    : 0,
                withoutCosts: complaint.costs
                    ? complaint.costs.filter(cost => cost.type === 'without_costs').reduce((total, cost) => total + cost.cost, 0)
                    : 0
            })) : [];

            setComplaints(data);
            setTotalPages(Math.ceil(count / 10));
        })
        .catch(error => {
            console.error('Error fetching complaints:', error);
        });
    }, [sortOrder, currentPage, complaintNumber, modelSk, modelDe, customer, status, startDate, endDate]); // Add dependencies here

    useEffect(() => {
    fetchComplaints();
}, [fetchComplaints]);
ƒ
    

    const handleSort = () => {
        setSortOrder(prevOrder => (prevOrder === 'desc' ? 'asc' : 'desc'));
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getRowClass = (status) => {
        switch (status) {
            case 'Akceptovaná':
                return 'accepted';
            case 'Neakceptovaná':
                return 'not-accepted';
            case 'V procese':
                return 'in-process';
            default:
                return '';
        }
    };

    const handleComplaintClick = (complaintNumber) => {
        navigate(`/complaint/${complaintNumber}`);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">Externé reklamácie</h1>

            {/* Filter Inputs */}
            <div className="flex flex-wrap mb-4">
                <input
                    type="text"
                    placeholder="Číslo reklamácie"
                    value={complaintNumber}
                    onChange={e => setComplaintNumber(e.target.value)}
                    className="mr-2 mb-2 p-2 border"
                />
                <input
                    type="text"
                    placeholder="Model SK"
                    value={modelSk}
                    onChange={e => setModelSk(e.target.value)}
                    className="mr-2 mb-2 p-2 border"
                />
                <input
                    type="text"
                    placeholder="Model DE"
                    value={modelDe}
                    onChange={e => setModelDe(e.target.value)}
                    className="mr-2 mb-2 p-2 border"
                />
                <input
                    type="text"
                    placeholder="Zákazník"
                    value={customer}
                    onChange={e => setCustomer(e.target.value)}
                    className="mr-2 mb-2 p-2 border"
                />
                <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="p-2 border rounded mr-2 mb-2"
                >
                    <option value="">Stav</option>
                    <option value="Akceptovaná">Akceptovaná</option>
                    <option value="Neakceptovaná">Neakceptovaná</option>
                    <option value="V procese">V procese</option>
                </select>
                <input
                    type="date"
                    placeholder="Začiatok dátumu"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="mr-2 mb-2 p-2 border"
                />
                <input
                    type="date"
                    placeholder="Koniec dátumu"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="mr-2 mb-2 p-2 border"
                />
            </div>

            {/* Table of Complaints */}
            <table className="min-w-full bg-white">
                <thead className="bg-gray-800 text-white">
                    <tr>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Číslo reklamácie</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Model SK</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Model DE</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Zákazník</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">PASS</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm cursor-pointer" onClick={handleSort}>
                            Dátum {sortOrder === 'asc' ? '▲' : '▼'}
                        </th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Počet kusov</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Dôvod</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Aktivity</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Stav</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Dátum odpovede</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Poznámka</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Overenie nápravných opatrení</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Náklady našej firmy</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Faktúry bez nákladov</th>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Celkové náklady</th>
                        <th>Upraviť</th>
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {Array.isArray(complaints) && complaints.length > 0 ? (
                        complaints.map(complaint => {
                            console.log('Rendering complaint:', complaint);
                            return (
                                <tr key={complaint.id} className={getRowClass(complaint.status)}>
                                    <td className="text-left py-3 px-4 cursor-pointer" onClick={() => handleComplaintClick(complaint.complaint_number)}>
                                        {complaint.complaint_number}
                                    </td>
                                    <td className="text-left py-3 px-4">{complaint.model_sk}</td>
                                    <td className="text-left py-3 px-4">{complaint.model_de}</td>
                                    <td className="text-left py-3 px-4">{complaint.customer}</td>
                                    <td className="text-left py-3 px-4">{complaint.pass_value}</td>
                                    <td className="text-left py-3 px-4">{complaint.date}</td>
                                    <td className="text-left py-3 px-4">{complaint.quantity}</td>
                                    <td className="text-left py-3 px-4">{complaint.reason}</td>
                                    <td className="text-left py-3 px-4">{complaint.activities}</td>
                                    <td className="text-left py-3 px-4">{complaint.status}</td>
                                    <td className="text-left py-3 px-4">{complaint.response_date}</td>
                                    <td className="text-left py-3 px-4">{complaint.extra_note}</td>
                                    <td className="text-left py-3 px-4">{complaint.correction_verification}</td>
                                    <td className="text-left py-3 px-4">{complaint.ourCosts.toFixed(2)}</td>
                                    <td className="text-left py-3 px-4">{complaint.withoutCosts.toFixed(2)}</td>
                                    <td><button onClick={() => handleEdit(complaint.complaint_number)}>Upraviť</button></td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="17" className="text-center py-4">No complaints found.</td>
                        </tr>
                    )}
            </tbody>
        </table>

        {/* Pagination */}
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
export default ExternalComplaints;