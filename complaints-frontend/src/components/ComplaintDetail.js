import React, { useEffect, useState, useCallback, Fragment, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CurrencyEuroIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { AuthContext } from '../context/AuthContext';

function formatCurrency(amount) {
    return `${amount.toFixed(2)} €`;
}

const ComplaintDetail = () => {
    const { authAxios } = useContext(AuthContext);
    let { complaintNumber } = useParams();
    const formatDate = (date) => format(new Date(date), 'dd.MM.yyyy');
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCostId, setSelectedCostId] = useState(null);

    const fetchComplaintDetail = useCallback(() => {
        authAxios.get(`http://localhost:8000/api/get-complaint/${complaintNumber}`)
            .then(response => {
                const { id, ...complaintData } = response.data;
                setComplaint(complaintData);
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    }, [complaintNumber]);

    useEffect(() => {
        fetchComplaintDetail();
    }, [fetchComplaintDetail]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('invoice', file);

        try {
            const response = await authAxios.put(`http://localhost:8000/api/complain-costs/${selectedCostId}/upload/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('File uploaded successfully:', response.data);
            fetchComplaintDetail();  // Reload data to show updated invoice
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleDeleteInvoice = async (costId) => {
        try {
            const response = await authAxios.put(`http://localhost:8000/api/complain-costs/${costId}/remove-invoice/`);
            console.log('Invoice deleted successfully:', response.data);
            fetchComplaintDetail();  // Reload data to show updated invoice
        } catch (error) {
            console.error('Error deleting invoice:', error);
        }
    };

    if (loading) {
        return <div>Načítavanie...</div>;
    }

    if (error) {
        return <div>Chyba pri načítavaní údajov: {error}</div>;
    }

    if (!complaint) {
        return <div>Detaily o reklamácii neboli nájdené.</div>;
    }

    function translateKey(key) {
        const translations = {
            complaint_number: 'Číslo reklamácie',
            model_sk: 'Model SK',
            model_de: 'Model DE',
            customer: 'Zákazník',
            pass_value: 'PASS',
            date: 'Dátum',
            quantity: 'Počet kusov',
            reason: 'Dôvod',
            activities: 'Aktivity',
            status: 'Stav',
            response_date: 'Dátum odpovede',
            extra_note: 'Poznámka',
            correction_verification: 'Overenie nápravných opatrení',
            invoices_our_costs: 'Náklady našej firmy',
            invoices_without_costs: 'Faktúry bez nákladov',
            total: 'Celkové náklady',
            highlighted: 'Zvýraznené',
            model: 'Model',
            part_number: 'Číslo súčiastky',
            product_number: 'Číslo produktu',
            priority: 'Priorita',
            activities_pass_sk: 'Aktivity PASS SK',
            responsible: 'Zodpovedný',
            created_by: 'Vytvoril',
            complaint_status: 'Stav reklamácie',
            note: 'Poznámka',
        };

        return translations[key] || key;
    }

    function renderValue(key, value) {
        if (value === null || value === undefined) {
            return '';
        }
    
        if (typeof value === 'number' && key !== 'date') {
            return (
                <Fragment>
                    <CurrencyEuroIcon className="h-4 w-4 inline mr-1 text-gray-500" />
                    {formatCurrency(value)}
                </Fragment>
            );
        } else if (key === 'date') {
            return formatDate(value);
        } else if (key === 'costs') {
            return (
                <ul>
                    {value.map(cost => (
                        <li key={cost.id}>
                            <div>
                                <strong>{cost.type === 'our_costs' ? 'NÁKLADY NAŠEJ FIRMY' : 'FAKTÚRY BEZ NÁKLADOV'}: </strong>
                                {cost.invoice ? (
                                    <a href={`http://localhost:8000${cost.invoice}`} target="_blank" rel="noopener noreferrer">
                                        {formatCurrency(parseFloat(cost.cost))}
                                    </a>
                                ) : (
                                    formatCurrency(parseFloat(cost.cost))
                                )}
                            </div>
                            {cost.invoice && (
                                <button onClick={() => handleDeleteInvoice(cost.id)} className="text-red-500">Odstrániť faktúru</button>
                            )}
                        </li>
                    ))}
                </ul>
            );
        } else if (key === 'highlighted' && value) {
            return (
                <div className="bg-yellow-300 p-2 rounded">
                    <span className="font-semibold">NIEJE VYSTAVENÁ FAKTÚRA</span>
                </div>
            );
        } else {
            return value.toString();
        }
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Detail reklamácie číslo: {complaint.complaint_number}</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden divide-y divide-gray-200">
                    <tbody className="text-gray-800">
                        {Object.entries(complaint).map(([key, value]) => (
                            <tr className="bg-gray-50" key={key}>
                                <td className="py-3 px-6 text-left font-semibold">{translateKey(key)}</td>
                                <td className="py-3 px-6 text-left">
                                    {renderValue(key, value)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {complaint.costs && (
                <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-2">Prílohy</h2>
                    <select onChange={(e) => setSelectedCostId(e.target.value)} className="mb-4">
                        <option value="">Vyberte náklad</option>
                        {complaint.costs.map(cost => (
                            <option key={cost.id} value={cost.id}>
                                {cost.type === 'our_costs' ? 'NÁKLADY NAŠEJ FIRMY' : 'FAKTÚRY BEZ NÁKLADOV'} - {formatCurrency(parseFloat(cost.cost))}
                            </option>
                        ))}
                    </select>
                    <input type="file" onChange={handleFileUpload} />
                </div>
            )}
        </div>
    );
};

export default ComplaintDetail;