import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios';
import { useParams } from 'react-router-dom';
import { CurrencyEuroIcon, PaperClipIcon } from '@heroicons/react/24/solid'
import { format } from 'date-fns';
import { Fragment } from 'react';

function formatCurrency(amount) {
    return `${amount.toFixed(2)} €`;
}

const ComplaintDetail = () => {
    let { complaintNumber } = useParams();
    const formatDate = (date) => format(new Date(date), 'dd.MM.yyyy');
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchComplaintDetail = useCallback(() => {
        axios.get(`/get-complaint/${complaintNumber}`)
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
            pass: 'PASS',
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
        } else if (key === 'invoices_our_costs' || key === 'invoices_without_costs' || key === 'total') {
            return (
                <Fragment>
                    <CurrencyEuroIcon className="h-4 w-4 inline mr-1 text-gray-500" />
                    {value}
                </Fragment>
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
            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <PaperClipIcon className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-600">Prílohy</span>
                </div>
                <button className="text-blue-500 hover:underline focus:outline-none">Zobraziť všetky</button>
            </div>
        </div>
    );
}

export default ComplaintDetail;
