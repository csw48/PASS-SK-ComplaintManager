import React, { useEffect, useState,useContext } from 'react';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/AuthContext';

const ExternalEditComplaint = () => {
    const { authAxios } = useContext(AuthContext);
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
        highlighted: false,
    });
    const [costs, setCosts] = useState([]);
    const [totalCosts, setTotalCosts] = useState(0);

    useEffect(() => {
        authAxios.get(`http://localhost:8000/api/get-complaint/${complaintNumber}/`)
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
        const { name, value, type, checked } = event.target;
        setComplaintData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCostChange = (index, field, value) => {
        const updatedCosts = [...costs];
        updatedCosts[index] = {
            ...updatedCosts[index],
            [field]: field === 'cost' ? parseFloat(value) || 0 : value
        };
        setCosts(updatedCosts);
        calculateTotalCosts(updatedCosts);
    };

    const handleAddCost = () => {
        setCosts([...costs, { id: null, cost: 0, type: 'our_costs' }]);
    };

    const handleDeleteCost = (index) => {
        const updatedCosts = [...costs];
        updatedCosts.splice(index, 1);
        setCosts(updatedCosts);
        calculateTotalCosts(updatedCosts);
    };

    const calculateTotalCosts = (costs) => {
        const total = costs.reduce((sum, cost) => sum + (parseFloat(cost.cost) || 0), 0);
        setTotalCosts(total);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const statusMapping = {
            'akceptovaná': 'Akceptovaná',
            'neakceptovaná': 'Neakceptovaná',
            'v procese': 'V procese',
            'stornovaná': 'Stornovaná'
        };

        const status = statusMapping[complaintData.status.toLowerCase()] || complaintData.status;

        const updatedComplaintData = {
            ...complaintData,
            status,
            costs: costs.map(cost => ({
                id: cost.id,
                cost: parseFloat(cost.cost).toFixed(2).toString(), // Ensure the cost is in string format with 2 decimal places
                type: cost.type
            })),
            total: totalCosts.toFixed(2) // Add totalCosts to the updated data
        };

        authAxios.put(`http://localhost:8000/api/update-complaint/${complaintNumber}/`, updatedComplaintData)
            .then(response => {
                console.log('Complaint updated successfully!');
                toast.success('Reklamácia bola úspešne upravená.');
            })
            .catch(error => {
                console.error('There was an error updating the complaint!', error);
                toast.error('Aktualizácia reklamácie zlyhala. Skúste to prosím znova.');
            });
    };

    return (
        <div className="ml-64 container mx-auto px-4 py-6">
            <ToastContainer />
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
                    <select
                        name="status"
                        value={complaintData.status ? complaintData.status.toLowerCase() : ''}
                        onChange={handleChange}
                        className="block w-full p-2 border rounded"
                    >
                        <option value="">Vyberte stav</option>
                        <option value="akceptovaná">Akceptovaná</option>
                        <option value="neakceptovaná">Neakceptovaná</option>
                        <option value="v procese">V procese</option>
                        <option value="stornovaná">Stornovaná</option>
                    </select>
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
                            <button type="button" onClick={() => handleDeleteCost(index)} className="ml-2 px-4 py-2 bg-red-500 text-white rounded">Delete</button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddCost} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">Add Cost</button>
                </div>
                <div className="mb-4">
                    <label>Highlighted</label>
                    <input
                        type="checkbox"
                        name="highlighted"
                        checked={complaintData.highlighted}
                        onChange={handleChange}
                        className="block p-2 border rounded"
                    />
                </div>
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Uložiť</button>
            </form>
        </div>
    );
}

export default ExternalEditComplaint;