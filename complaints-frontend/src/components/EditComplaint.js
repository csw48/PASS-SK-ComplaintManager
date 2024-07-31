import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';

const ExternalEditComplaint = () => {
    const { complaintNumber } = useParams();
    const [complaintData, setComplaintData] = useState({
        model_sk: '',
        model_de: '',
        customer: '',
        pass_value: '',
        date: '',
        complaint_number: '',
        quantity: '',
        reason: '',
        activities: '',
        status: '',
        response_date: '',
        extra_note: '',
        correction_verification: '',
    });
    const [costs, setCosts] = useState([]);
    const [totalCosts, setTotalCosts] = useState(0);

    useEffect(() => {
        axios.get(`/get-complaint/${complaintNumber}`)
            .then(response => {
                if (response.data) {
                    setComplaintData(response.data);
                    setCosts(response.data.costs || []);
                    calculateTotalCosts(response.data.costs || []);
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

    const handleCostChange = (index, field, value) => {
        const updatedCosts = [...costs];
        updatedCosts[index][field] = parseFloat(value) || 0;
        setCosts(updatedCosts);
        calculateTotalCosts(updatedCosts);
    };

    const calculateTotalCosts = (costs) => {
        const total = costs.reduce((sum, cost) => sum + (parseFloat(cost.cost) || 0), 0);
        setTotalCosts(total);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const updatedComplaintData = { 
            ...complaintData, 
            costs: costs.map(cost => ({ cost: cost.cost.toString(), type: cost.type })) 
        };
        axios.put(`/api/update-complaint/${complaintNumber}/`, updatedComplaintData)
            .then(response => {
                console.log('Complaint updated successfully!');
            })
            .catch(error => {
                console.error('There was an error updating the complaint!', error);
            });
    };

    return (
        <div className="ml-64 container mx-auto px-4 py-6">  
            <h1 className="text-2xl font-bold mb-4">Upraviť externú reklamáciu č. {complaintNumber}</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label>Model SK</label>
                    <input type="text" name="model_sk" value={complaintData.model_sk || ''} onChange={handleChange} className="block w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                    <label>Model DE</label>
                    <input type="text" name="model_de" value={complaintData.model_de || ''} onChange={handleChange} className="block w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                    <label>Zákazník</label>
                    <input type="text" name="customer" value={complaintData.customer || ''} onChange={handleChange} className="block w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                    <label>PASS</label>
                    <input type="text" name="pass_value" value={complaintData.pass_value || ''} onChange={handleChange} className="block w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                    <label>Dátum</label>
                    <input type="date" name="date" value={complaintData.date || ''} onChange={handleChange} className="block w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                    <label>Číslo reklamácie</label>
                    <input type="text" name="complaint_number" value={complaintData.complaint_number || ''} onChange={handleChange} className="block w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                    <label>Počet kusov</label>
                    <input type="text" name="quantity" value={complaintData.quantity || ''} onChange={handleChange} className="block w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                    <label>Dôvod</label>
                    <textarea name="reason" value={complaintData.reason || ''} onChange={handleChange} className="block w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                    <label>Aktivity</label>
                    <textarea name="activities" value={complaintData.activities || ''} onChange={handleChange} className="block w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                    <label>Stav</label>
                    <input type="text" name="status" value={complaintData.status || ''} onChange={handleChange} className="block w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                    <label>Dátum odpovede</label>
                    <input type="date" name="response_date" value={complaintData.response_date || ''} onChange={handleChange} className="block w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                    <label>Poznámka</label>
                    <textarea name="extra_note" value={complaintData.extra_note || ''} onChange={handleChange} className="block w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                    <label>Overenie nápravných opatrení</label>
                    <textarea name="correction_verification" value={complaintData.correction_verification || ''} onChange={handleChange} className="block w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                    <label>Celkové náklady: {totalCosts.toFixed(2)}</label>
                </div>
                <div className="mb-4">
                    <label>Náklady</label>
                    {costs.map((cost, index) => (
                        <div key={index} className="flex mb-2">
                            <input 
                                type="number" 
                                value={cost.cost} 
                                onChange={(e) => handleCostChange(index, 'cost', e.target.value)} 
                                className="block w-full p-2 border rounded mr-2"
                            />
                            <select 
                                value={cost.type} 
                                onChange={(e) => handleCostChange(index, 'type', e.target.value)} 
                                className="block w-full p-2 border rounded"
                            >
                                <option value="our_costs">Our Costs</option>
                                <option value="without_costs">Without Costs</option>
                            </select>
                        </div>
                    ))}
                </div>
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Uložiť</button>
            </form>
        </div>
    );
}

export default ExternalEditComplaint;