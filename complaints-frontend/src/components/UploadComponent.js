import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UploadComponent = () => {
    const [internalFile, setInternalFile] = useState(null);
    const [externalFile, setExternalFile] = useState(null);

    const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    const handleInternalFileChange = (event) => {
        setInternalFile(event.target.files[0]);
    };

    const handleExternalFileChange = (event) => {
        setExternalFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (internalFile || externalFile) {
            const formData = new FormData();
            if (internalFile) {
                formData.append('internal_file', internalFile);
            }
            if (externalFile) {
                formData.append('external_file', externalFile);
            }
            const csrfToken = getCookie('csrftoken');

            try {
                const response = await axios.post('http://localhost:8000/upload/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRFToken': csrfToken
                    }
                });

                toast.success(response.data.message);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    toast.error('Je nutné sa prihlásiť.');
                } else {
                    toast.error(error.response?.data?.error || 'Nastala chyba pri nahrávaní súboru.');
                }
            }
        } else {
            toast.error('Vyberte prosím aspoň jeden súbor na nahranie.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-4">Import Reklamácií</h1>
            <div className="mb-4">
                <label className="block">Interné :</label>
                <input type="file" onChange={handleInternalFileChange} />
            </div>
            <div className="mb-4">
                <label className="block">Externé :</label>
                <input type="file" onChange={handleExternalFileChange} />
            </div>
            <button onClick={handleUpload} className="px-4 py-2 bg-blue-500 text-white rounded">Nahráť</button>
        </div>
    );
};

export default UploadComponent;