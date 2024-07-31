import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/AuthContext';

const InternalEditComplaint = () => {
    const { authAxios } = useContext(AuthContext);
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

    const RESPONSIBLE_MAP = {
        "S.Yüksekol": "Salih Yüksekol",
        "G.Verzi": "Giuseppe Verzi",
        "M.Stach": "Marek Stach",
        "G.Wacławski": "Grzegorz Wacławski",
        "S.Ilič": "Sanja Ilič",
        "Salih Yüksekol": "Salih Yüksekol",
        "Giuseppe Verzi": "NEMECKO Gumy: Giuseppe Verzi",
        "Marek Stach": "POĽSKO Gumy Marek Stach, Łukasz Jachlewski.",
        "Grzegorz Wacławski": "POĽSKO Kovové rúrky Grzegorz Wacławski, Paweł Fejdasz",
        "Sanja Ilič": "BOSNA: Sanja Ilič",
        "Yuksekol": "Salih Yüksekol",
        "S. Yüksekol": "Salih Yüksekol",
        "G. Verzi": "Giuseppe Verzi",
        "M. Stach": "Marek Stach",
        "G. Wacławski": "Grzegorz Wacławski",
        "S. Ilič": "Sanja Ilič",
    };

    const CREATED_BY_MAP = {
        "T.Geletka": "Geletka",
        "P.Staňa": "Staňa",
        "S.Pamula": "Pamula",
        "S.Spielmann": "Spielmann",
        "M.Kaščáková": "Kaščáková",
        "L.Augustin": "Augustin",
        "Geletka": "Geletka",
        "Staňa": "Staňa",
        "Pamula": "Pamula",
        "Spielmann": "Spielmann",
        "Kaščáková": "Kaščáková",
        "Augustin": "Augustin",
        "T. Geletka": "Geletka",
        "P. Staňa": "Staňa",
        "S. Pamula": "Pamula",
        "S. Spielmann": "Spielmann",
        "M. Kaščáková": "Kaščáková",
        "L. Augustin": "Augustin",
    };

    const fetchComplaintData = () => {
        authAxios.get(`/api/get-complaint/${complaintNumber}/`)
            .then(response => {
                if (response.data) {
                    const data = response.data;
                    data.responsible = Object.keys(RESPONSIBLE_MAP).find(key => RESPONSIBLE_MAP[key] === data.responsible) || data.responsible;
                    data.created_by = Object.keys(CREATED_BY_MAP).find(key => CREATED_BY_MAP[key] === data.created_by) || data.created_by;
                    setComplaintData(data);
                }
            })
            .catch(error => {
                console.error('There was an error fetching the complaint!', error);
            });
    };

    useEffect(() => {
        fetchComplaintData();
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
        const data = { ...complaintData };
        data.responsible = RESPONSIBLE_MAP[data.responsible] || data.responsible;
        data.created_by = CREATED_BY_MAP[data.created_by] || data.created_by;

        authAxios.put(`/api/update-complaint/${complaintNumber}/`, data)
            .then(response => {
                toast.success('Reklamácia bola úspešne upravená.');
                setTimeout(() => {
                    navigate('/internal-complaints');
                }, 2000);
            })
            .catch(error => {
                toast.error('Aktualizácia reklamácie zlyhala. Skúste to prosím znova.');
            });
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <ToastContainer />
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
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">Upraviť</button>
                <button type="button" onClick={handleGoBack} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 ml-2">Späť</button>
            </form>
        </div>
    );
};

export default InternalEditComplaint;