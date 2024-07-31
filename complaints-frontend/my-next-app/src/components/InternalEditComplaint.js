import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const InternalEditComplaint = () => {
    const { complaintNumber } = useParams();
    const navigate = useNavigate();
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

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

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
        axios.put(`/update-complaint/${complaintNumber}/`, complaintData)
            .then(response => {
                console.log('Complaint updated successfully!');
                setSuccessMessage('Údaje boli úspešne zmenené.');
                setTimeout(() => {
                    setSuccessMessage('');
                }, 5000); // 5 sekúnd
            })
            .catch(error => {
                console.error('There was an error updating the complaint!', error);
                setErrorMessage('Aktualizácia reklamácie zlyhala. Skúste to prosím znova.');
                setTimeout(() => {
                    setErrorMessage('');
                }, 15000); // 15 sekúnd
            });
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">Upraviť internú reklamáciu č. {complaintNumber}</h1>
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
                    <label className="block text-gray-700 text-sm font-bold mb-2">Model</label>
                    <input
                        type="text"
                        name="model"
                        value={complaintData.model}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>
                {/* Add all other fields similarly */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Dátum</label>
                    <input
                        type="date"
                        name="date"
                        value={complaintData.date}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Číslo súčiastky</label>
                    <input
                        type="text"
                        name="part_number"
                        value={complaintData.part_number}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Číslo výrobku</label>
                    <input
                        type="text"
                        name="product_number"
                        value={complaintData.product_number}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>
                {/* Add other fields as per your model */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Priorita</label>
                    <select
                        name="priority"
                        value={complaintData.priority}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    >
                        <option value="">Vyberte</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Dôvod</label>
                    <textarea
                        name="reason"
                        value={complaintData.reason}
                        onChange={handleChange}
                        rows="4"
                        className="resize-none block w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Aktivity PASS SK</label>
                    <textarea
                        name="activities"
                        value={complaintData.activities}
                        onChange={handleChange}
                        rows="4"
                        className="resize-none block w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Zodpovedný</label>
                    <select
                        name="responsible"
                        value={complaintData.responsible}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    >
                        <option value="Salih Yüksekol">Dodávateľske NEMECKO: Salih Yüksekol</option>
                        <option value="Giuseppe Verzi">NEMECKO Plasty: Giuseppe Verzi</option>
                        <option value="Giuseppe Verzi">NEMECKO Polyamidy: Giuseppe Verzi</option>
                        <option value="Giuseppe Verzi">NEMECKO Gumy: Giuseppe Verzi</option>
                        <option value="Marek Stach">POĽSKO Gumy Marek Stach, Łukasz Jachlewski.</option>
                        <option value="Grzegorz Wacławski">POĽSKO Kovové rúrky Grzegorz Wacławski, Paweł Fejdasz</option>
                        <option value="Sanja Ilič">BOSNA: Sanja Ilič</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Vytvoril</label>
                    <select
                        name="created_by"
                        value={complaintData.created_by}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    >
                        <option value="Geletka">Geletka</option>
                        <option value="Staňa">Staňa</option>
                        <option value="Pamula">Pamula</option>
                        <option value="Spielmann">Spielmann</option>
                        <option value="Kaščáková">Kaščáková</option>
                        <option value="Augustin">Augustin</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Počet kusov</label>
                    <input
                        type="text"
                        name="quantity"
                        value={complaintData.quantity}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Poznámka</label>
                    <textarea
                        name="note"
                        value={complaintData.note}
                        onChange={handleChange}
                        rows="4"
                        className="resize-none block w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    ></textarea>
                </div>
                {successMessage && <p className="text-green-600">{successMessage}</p>}
                {errorMessage && <p className="text-red-600">{errorMessage}</p>}
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">Upraviť</button>
                <button type="button" onClick={handleGoBack} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 ml-2">Späť</button>
            </form>
        </div>
    );
};

export default InternalEditComplaint;