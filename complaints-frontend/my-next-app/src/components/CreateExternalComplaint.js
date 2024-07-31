import DatePicker from 'react-datepicker';
import React, { useState } from 'react';
import axios from '../api/axios';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const CreateExternalComplaint = () => {
    const [formData, setFormData] = useState({
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
        invoices_our_costs: [{ cost: '' }],
        invoices_without_costs: [{ cost: '' }],
        total: '',
        highlighted: false,
    });

    const [successMessage, setSuccessMessage] = useState('');

    const updateTotal = (invoicesOurCosts, invoicesWithoutCosts) => {
        const totalOurCosts = invoicesOurCosts.reduce((acc, item) => acc + (parseFloat(item.cost) || 0), 0);
        const totalWithoutCosts = invoicesWithoutCosts.reduce((acc, item) => acc + (parseFloat(item.cost) || 0), 0);
        const total = totalOurCosts + totalWithoutCosts;
        setFormData(prevFormData => ({
            ...prevFormData,
            total: total.toFixed(2),
        }));
    };

    const handleChange = (e, index, field) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prevFormData => {
            const updatedFormData = { ...prevFormData };

            if (field === 'invoices_our_costs' || field === 'invoices_without_costs') {
                updatedFormData[field][index].cost = newValue;
                updateTotal(updatedFormData.invoices_our_costs, updatedFormData.invoices_without_costs);
            } else {
                updatedFormData[name] = newValue;
            }

            return updatedFormData;
        });
    };

    const handleAddCost = field => {
        setFormData(prevFormData => ({
            ...prevFormData,
            [field]: [...prevFormData[field], { cost: '' }],
        }));
    };

    const handleRemoveCost = (index, field) => {
        if (formData[field].length === 1) {
            return;
        }

        setFormData(prevFormData => {
            const updatedCosts = prevFormData[field].filter((_, i) => i !== index);
            updateTotal(
                field === 'invoices_our_costs' ? updatedCosts : prevFormData.invoices_our_costs,
                field === 'invoices_without_costs' ? updatedCosts : prevFormData.invoices_without_costs
            );
            return {
                ...prevFormData,
                [field]: updatedCosts,
            };
        });
    };

    const handleDateChange = (date, name) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: date,
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const formattedData = {
            ...formData,
            date: formData.date ? format(formData.date, 'yyyy-MM-dd') : null,
            response_date: formData.response_date ? format(formData.response_date, 'yyyy-MM-dd') : null,
        };
    
        console.log("Sending complaint data:", formattedData);
    
        try {
            const response = await axios.post('http://localhost:8000/api/external-complaints/', formattedData);
            const complaintId = response.data.id;
    
            console.log("Complaint successfully created with ID:", complaintId);
    
            // Format costs entries ensuring `cost` is converted to number
            const costEntries = [
                ...formData.invoices_our_costs.map(item => ({ cost: Number(item.cost), complaint: complaintId, type: 'our_costs' })),
                ...formData.invoices_without_costs.map(item => ({ cost: Number(item.cost), complaint: complaintId, type: 'without_costs' }))
            ];
    
            console.log("Sending costs:", costEntries);
    
            // Handle creating complain-costs asynchronously
            await Promise.all(costEntries.map(entry => axios.post('http://localhost:8000/api/complain-costs/', entry)));
    
            setSuccessMessage('Complaint successfully created!');
        
            setTimeout(() => {
                setSuccessMessage('');
                window.location.href = '/external-complaints';
            }, 3000);
        } catch (error) {
            const errorResponse = error.response ? error.response.data : 'There was an error creating the complaint!';
            console.error("Error creating complaint:", errorResponse);
    
            if (error.response && error.response.status === 400) {
                console.error("Validation errors:", errorResponse);
            }

            setSuccessMessage('');
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">Vytvoriť externú reklamáciu</h1>
            <form onSubmit={handleSubmit}>
                {/* Input fields for basic complaint information */}
                {/* Example: Complaint Number */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Číslo reklamácie</label>
                    <input
                        type="text"
                        name="complaint_number"
                        value={formData.complaint_number}
                        onChange={e => handleChange(e)}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>

                {/* Example: Model SK */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Model SK</label>
                    <input
                        type="text"
                        name="model_sk"
                        value={formData.model_sk}
                        onChange={e => handleChange(e)}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>

                {/* Example: Model DE */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Model DE</label>
                    <input
                        type="text"
                        name="model_de"
                        value={formData.model_de}
                        onChange={e => handleChange(e)}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>

                {/* Example: Customer */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Zákazník</label>
                    <input
                        type="text"
                        name="customer"
                        value={formData.customer}
                        onChange={e => handleChange(e)}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>

                {/* Example: PASS Value */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">PASS</label>
                    <select
                        name="pass_value"
                        value={formData.pass_value}
                        onChange={e => handleChange(e)}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    >
                        <option value="">Vyberte</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                </div>

                {/* Example: Date */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Dátum</label>
                    <DatePicker
                        selected={formData.date}
                        onChange={date => handleDateChange(date, 'date')}
                        dateFormat="dd-MM-yyyy"
                    />
                </div>

                {/* Example: Quantity */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Počet kusov</label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={e => handleChange(e)}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>

                {/* Example: Reason */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Dôvod</label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={e => handleChange(e)}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    ></textarea>
                </div>
                {/* Example: Activities */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Aktivity</label>
                    <textarea
                        name="activities"
                        value={formData.activities}
                        onChange={e => handleChange(e)}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    ></textarea>
                </div>

                {/* Example: Status */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Stav</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={e => handleChange(e)}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    >
                        <option value="">Vyberte stav</option>
                        <option value="Akceptovaná">Akceptovaná</option>
                        <option value="Neakceptovaná">Neakceptovaná</option>
                        <option value="V procese">V procese</option>
                    </select>
                </div>

                {/* Example: Response Date */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Dátum odpovede</label>
                    <DatePicker
                        selected={formData.response_date}
                        onChange={date => handleDateChange(date, 'response_date')}
                        dateFormat="dd-MM-yyyy"
                        placeholderText="Dátum odpovede"
                        isClearable
                    />
                </div>

                {/* Example: Extra Note */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Poznámka</label>
                    <textarea
                        name="extra_note"
                        value={formData.extra_note}
                        onChange={e => handleChange(e)}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    ></textarea>
                </div>

                {/* Example: Correction Verification */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Overenie nápravných opatrení</label>
                    <textarea
                        name="correction_verification"
                        value={formData.correction_verification}
                        onChange={e => handleChange(e)}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    ></textarea>
                </div>

                {/* Example: Invoices Our Costs */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Náklady našej firmy</label>
                    {formData.invoices_our_costs.map((item, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <input
                                type="number"
                                name="cost"
                                value={item.cost}
                                onChange={e => handleChange(e, index, 'invoices_our_costs')}
                                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                            />
                            <button type="button" onClick={() => handleRemoveCost(index, 'invoices_our_costs')} className="ml-2 bg-red-500 text-white px-2 py-1 rounded">Odstrániť</button>
                        </div>
                    ))}
                    <button type="button" onClick={() => handleAddCost('invoices_our_costs')} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Pridať náklad</button>
                </div>

                {/* Example: Invoices Without Costs */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Faktúry bez nákladov</label>
                    {formData.invoices_without_costs.map((item, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <input
                                type="number"
                                name="cost"
                                value={item.cost}
                                onChange={e => handleChange(e, index, 'invoices_without_costs')}
                                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                            />
                            <button type="button" onClick={() => handleRemoveCost(index, 'invoices_without_costs')} className="ml-2 bg-red-500 text-white px-2 py-1 rounded">Odstrániť</button>
                        </div>
                    ))}
                    <button type="button" onClick={() => handleAddCost('invoices_without_costs')} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Pridať náklad</button>
                </div>

                {/* Example: Total */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Spolu</label>
                    <input
                        type="number"
                        name="total"
                        value={formData.total}
                        readOnly
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>
                {/* Highlighted Checkbox */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        <input
                            type="checkbox"
                            name="highlighted"
                            checked={formData.highlighted}
                            onChange={e => handleChange(e)}
                            className="mr-2 leading-tight"
                        />
                        Highlighted
                    </label>
                </div>

                {/* Submit Button */}
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">Odoslať</button>
            </form>
            {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
        </div>
    );
};

export default CreateExternalComplaint;
