import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';

const EditComplaint = () => {
    const { complaintNumber } = useParams();
    const [complaintData, setComplaintData] = useState({
        model: '',
        date: '',
        complaint_number: '',
        part_number: '',
        product_number: '',
        priority: '',
        reason: '',
        activities_pass_sk: '',
        responsible: '',
        created_by: '',
        quantity: '',
        complaint_status: '',
        note: '',
    });

    useEffect(() => {
        console.log('Fetching complaint data for complaint number:', complaintNumber);
        axios.get(`/get-complaint/${complaintNumber}`)  // Skontrolujte cestu
            .then(response => {
                console.log('Fetched complaint data:', response.data);
                if (response.data) {
                    setComplaintData(response.data);
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

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.put(`/update-complaint/${complaintNumber}`, complaintData)
            .then(response => {
                console.log('Complaint updated successfully!');
            })
            .catch(error => {
                console.error('There was an error updating the complaint!', error);
            });
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">Upraviť reklamáciu č. {complaintNumber}</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Model</label>
                    <input type="text" name="model" value={complaintData.model} onChange={handleChange} />
                </div>
                <div>
                    <label>Dátum</label>
                    <input type="date" name="date" value={complaintData.date} onChange={handleChange} />
                </div>
                <div>
                    <label>Číslo reklamácie</label>
                    <input type="text" name="complaint_number" value={complaintData.complaint_number} onChange={handleChange} />
                </div>
                <div>
                    <label>Číslo súčiastky</label>
                    <input type="text" name="part_number" value={complaintData.part_number} onChange={handleChange} />
                </div>
                <div>
                    <label>Číslo výrobku</label>
                    <input type="text" name="product_number" value={complaintData.product_number} onChange={handleChange} />
                </div>
                <div>
                    <label>Priorita</label>
                    <select name="priority" value={complaintData.priority} onChange={handleChange}>
                        <option value="">-- Vyberte prioritu --</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                    </select>
                </div>
                <div>
                    <label>Dôvod</label>
                    <textarea name="reason" value={complaintData.reason} onChange={handleChange} />
                </div>
                <div>
                    <label>Aktivity PASS SK</label>
                    <textarea name="activities_pass_sk" value={complaintData.activities_pass_sk} onChange={handleChange} />
                </div>
                <div>
                    <label>Zodpovedný</label>
                    <input type="text" name="responsible" value={complaintData.responsible} onChange={handleChange} />
                </div>
                <div>
                    <label>Vytvoril</label>
                    <input type="text" name="created_by" value={complaintData.created_by} onChange={handleChange} />
                </div>
                <div>
                    <label>Počet kusov</label>
                    <input type="text" name="quantity" value={complaintData.quantity} onChange={handleChange} />
                </div>
                <div>
                    <label>Stav reklamácie</label>
                    <input type="text" name="complaint_status" value={complaintData.complaint_status} onChange={handleChange} />
                </div>
                <div>
                    <label>Poznámka</label>
                    <textarea name="note" value={complaintData.note} onChange={handleChange} />
                </div>
                <button type="submit">Uložiť</button>
            </form>
        </div>
    );
}

export default EditComplaint;