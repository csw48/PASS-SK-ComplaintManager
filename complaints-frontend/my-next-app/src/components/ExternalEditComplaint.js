import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ExternalEditComplaint = () => {
    const { complaintNumber } = useParams();
    const navigate = useNavigate();
    const [complaintData, setComplaintData] = useState({
        model_sk: '',
        model_de: '',
        customer: '',
        pass_value: '',
        date: new Date(),
        complaint_number: '',
        quantity: '',
        reason: '',
        activities: '',
        status: '',
        response_date: null,
        extra_note: '',
        correction_verification: '',
        invoices_our_costs: [],
        invoices_without_costs: [],
        total: 0,
        highlighted: false,
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        console.log('Fetching complaint data for complaint number:', complaintNumber);
        axios.get(`/get-complaint/${complaintNumber}`)
            .then(response => {
                console.log('Fetched complaint data:', response.data);
                if (response.data) {
                    const initialData = response.data;

                    initialData.invoices_our_costs = [{ cost: initialData.invoices_our_costs.toString() }];
                    initialData.invoices_without_costs = [{ cost: initialData.invoices_without_costs.toString() }];
               
                    const totalOurCosts = parseFloat(initialData.invoices_our_costs[0].cost) || 0;
                    const totalWithoutCosts = parseFloat(initialData.invoices_without_costs[0].cost) || 0;
                    initialData.total = totalOurCosts + totalWithoutCosts;

                    setComplaintData(initialData);
                } else {
                    console.error('No data found for this complaint');
                }
            })
            .catch(error => {
                console.error('There was an error fetching the complaint!', error);
            });
    }, [complaintNumber]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setComplaintData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleDateChange = (date, name) => {
        setComplaintData(prevData => ({
            ...prevData,
            [name]: date
        }));
    };

    const handleAddCost = (field) => {
    setComplaintData(prevData => {
        const updatedCosts = [...prevData[field], { cost: '' }];
        const totalOurCosts = calculateTotal('invoices_our_costs', updatedCosts);
        const totalWithoutCosts = calculateTotal('invoices_without_costs', prevData.invoices_without_costs);
        return {
            ...prevData,
            [field]: updatedCosts,
            total: totalOurCosts + totalWithoutCosts
        };
    });
};

const handleRemoveCost = (index, field) => {
    setComplaintData(prevData => {
        const updatedCosts = prevData[field].filter((_, idx) => idx !== index);
        const totalOurCosts = calculateTotal('invoices_our_costs', updatedCosts);
        const totalWithoutCosts = calculateTotal('invoices_without_costs', prevData.invoices_without_costs);
        return {
            ...prevData,
            [field]: updatedCosts,
            total: totalOurCosts + totalWithoutCosts
        };
    });
};

const handleCostChange = (event, index, field) => {
    const { value } = event.target;
    setComplaintData(prevData => {
        const updatedCosts = prevData[field].map((item, idx) => idx === index ? { ...item, cost: value } : item);
        const totalOurCosts = calculateTotal('invoices_our_costs', updatedCosts);
        const totalWithoutCosts = calculateTotal('invoices_without_costs', prevData.invoices_without_costs);
        return {
            ...prevData,
            [field]: updatedCosts,
            total: totalOurCosts + totalWithoutCosts
        };
    });
};

const calculateTotal = (field, costs) => {
    return costs.reduce((acc, item) => acc + parseFloat(item.cost || 0), 0);
};

    const handleSubmit = (event) => {
        event.preventDefault();
        
        const updatedComplaintData = {
            ...complaintData,
            invoices_our_costs: complaintData.invoices_our_costs.map(item => parseFloat(item.cost)),
            invoices_without_costs: complaintData.invoices_without_costs.map(item => parseFloat(item.cost))
        };
        
        axios.put(`/update-complaint/${complaintNumber}/`, updatedComplaintData)
            .then(response => {
                console.log('Complaint updated successfully!');
                setSuccessMessage('Údaje boli úspešne zmenené.');
                setTimeout(() => {
                    setSuccessMessage('');
                }, 5000); // 5 seconds
            })
            .catch(error => {
                console.error('There was an error updating the complaint!', error);
                setErrorMessage('Aktualizácia reklamácie zlyhala. Skúste to prosím znova.');
                setTimeout(() => {
                    setErrorMessage('');
                }, 15000); // 15 seconds
            });
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">Upraviť externú reklamáciu č. {complaintNumber}</h1>
            <form onSubmit={handleSubmit}>
            <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Číslo reklamácie</label>
                    <input
                        type="text"
                        name="complaint_number"
                        value={complaintData.complaint_number}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Model SK</label>
                    <input
                        type="text"
                        name="model_sk"
                        value={complaintData.model_sk}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Model DE</label>
                    <input
                        type="text"
                        name="model_de"
                        value={complaintData.model_de}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Zákazník</label>
                    <input
                        type="text"
                        name="customer"
                        value={complaintData.customer}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">PASS</label>
                    <select
                        name="pass_value"
                        value={complaintData.pass_value}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    >
                        <option value="">Vyberte</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Dátum</label>
                    <DatePicker
                        selected={complaintData.date ? new Date(complaintData.date) : null}
                        onChange={(date) => handleDateChange(date, 'date')}
                        dateFormat="dd-MM-yyyy"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Počet kusov</label>
                    <input
                        type="number"
                        name="quantity"
                        value={complaintData.quantity}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Dôvod</label>
                    <textarea
                        name="reason"
                        value={complaintData.reason}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Aktivity</label>
                    <textarea
                        name="activities"
                        value={complaintData.activities}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Stav</label>
                    <select
                        name="status"
                        value={complaintData.status}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
                        <option value="">Vyberte stav</option>
                        <option value="Akceptovaná">Akceptovaná</option>
                        <option value="Neakceptovaná">Neakceptovaná</option>
                        <option value="V procese">V procese</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Dátum odpovede</label>
                    <DatePicker
                        selected={complaintData.response_date}
                        onChange={(date) => handleDateChange(date, 'response_date')}
                        dateFormat="dd-MM-yyyy"
                        placeholderText="Dátum odpovede"
                        isClearable
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Poznámka</label>
                    <textarea
                        name="extra_note"
                        value={complaintData.extra_note}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Overenie nápravných opatrení</label>
                    <textarea
                        name="correction_verification"
                        value={complaintData.correction_verification}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Náklady našej firmy</label>
                    {complaintData.invoices_our_costs.map((item, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <input
                                type="number"
                                value={item.cost}
                                onChange={(event) => handleCostChange(event, index, 'invoices_our_costs')}
                                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                            />
                            <button type="button" onClick={() => handleRemoveCost(index, 'invoices_our_costs')} className="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700">Odstrániť</button>
                        </div>
                    ))}
                    <button type="button" onClick={() => handleAddCost('invoices_our_costs')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">Pridať náklad</button>
                </div>
                
                {/* Invoices Without Costs */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Faktúry bez nákladov</label>
                    {complaintData.invoices_without_costs.map((item, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <input
                                type="number"
                                value={item.cost}
                                onChange={(event) => handleCostChange(event, index, 'invoices_without_costs')}
                                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                            />
                            <button type="button" onClick={() => handleRemoveCost(index, 'invoices_without_costs')} className="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700">Odstrániť</button>
                        </div>
                    ))}
                    <button type="button" onClick={() => handleAddCost('invoices_without_costs')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">Pridať faktúru</button>
                </div>
                
                {/* Total */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Spolu</label>
                    <input
                        type="number"
                        name="total"
                        value={complaintData.total}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Zvýraznené
                        <input
                            type="checkbox"
                            name="highlighted"
                            checked={complaintData.highlighted}
                            onChange={handleChange}
                            className="ml-2 leading-tight"
                        />
                    </label>
                </div>
                {successMessage && <p className="text-green-600">{successMessage}</p>}
                {errorMessage && <p className="text-red-600">{errorMessage}</p>}
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">Upraviť</button>
                <button type="button" onClick={handleGoBack} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 ml-2">Späť</button>
            </form>
        </div>
    );
};

export default ExternalEditComplaint;