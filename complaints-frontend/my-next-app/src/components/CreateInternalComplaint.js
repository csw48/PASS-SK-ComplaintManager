// src/components/CreateInternalComplaint.js
import React, { useState } from 'react';
import axios from '../api/axios';

const CreateInternalComplaint = () => {
    const [formData, setFormData] = useState({
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
        highlighted: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('internal-complaints/', formData)
            .then(response => {
                console.log(response.data);
                window.location.href = '/internal-complaints';
            })
            .catch(error => {
                console.error('There was an error creating the complaint!', error);
            });
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">Vytvoriť internú reklamáciu</h1>
            <form onSubmit={handleSubmit}>
            <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Číslo reklamácie</label>
                    <input
                        type="text"
                        name="complaint_number"
                        value={formData.complaint_number}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Model</label>
                    <input
                        type="text"
                        name="model"
                        value={formData.model}
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
                        value={formData.date}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Číslo súčiastky</label>
                    <input
                        type="text"
                        name="part_number"
                        value={formData.part_number}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Číslo výrobku</label>
                    <input
                        type="text"
                        name="product_number"
                        value={formData.product_number}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>
                {/* Add other fields as per your model */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Priorita</label>
                    <select
                        name="priority"
                        value={formData.priority}
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
                        value={formData.reason}
                        onChange={handleChange}
                        rows="4"
                        className="resize-none block w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Aktivity PASS SK</label>
                    <textarea
                        name="activities"
                        value={formData.activities}
                        onChange={handleChange}
                        rows="4"
                        className="resize-none block w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Zodpovedný</label>
                    <select
                        name="responsible"
                        value={formData.responsible}
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
                        value={formData.created_by}
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
                        value={formData.quantity}
                        onChange={handleChange}
                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Poznámka</label>
                    <textarea
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        rows="4"
                        className="resize-none block w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    ></textarea>
                </div>
                <div className="flex items-center justify-between">
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Vytvoriť reklamáciu
                </button>
                </div>
            </form>
        </div>
    );
};

export default CreateInternalComplaint;