import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Statistics = () => {
    const { authAxios } = useContext(AuthContext);
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [modelComplaintCount, setModelComplaintCount] = useState(0);
    const [reasons, setReasons] = useState([]);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await authAxios.get('http://localhost:8000/api/statistics/all-models/');
                setModels(response.data);
            } catch (error) {
                console.error('Error fetching models:', error);
            }
        };

        fetchModels();
    }, []);

    useEffect(() => {
        if (selectedModel) {
            const fetchModelComplaintCount = async () => {
                try {
                    const response = await authAxios.get(`http://localhost:8000/api/statistics/model-complaints/${selectedModel}/`);
                    setModelComplaintCount(response.data.count);
                } catch (error) {
                    console.error('Error fetching model complaints count:', error);
                }
            };

            const fetchModelComplaintReasons = async () => {
                try {
                    const response = await authAxios.get(`http://localhost:8000/api/statistics/model-complaints-reasons/${selectedModel}/`);
                    setReasons(response.data);
                } catch (error) {
                    console.error('Error fetching model complaints reasons:', error);
                }
            };

            fetchModelComplaintCount();
            fetchModelComplaintReasons();
        }
    }, [selectedModel]);

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-center">Štatistiky reklamácií</h1>
            <div className="mb-6 flex justify-center">
                <label htmlFor="model-select" className="mr-4 self-center text-lg">Vyberte model:</label>
                <select
                    id="model-select"
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                    className="p-2 border rounded-md"
                >
                    <option value="">--Vyberte model--</option>
                    {models.map((model, index) => (
                        <option key={index} value={model}>{model}</option>
                    ))}
                </select>
            </div>
            {selectedModel && (
                <div className="flex justify-center space-x-8">
                    <div className="chart w-1/2">
                        <h2 className="text-xl font-semibold mb-4 text-center">Počet reklamácií pre model: {selectedModel}</h2>
                        <BarChart width={500} height={300} data={[{ name: selectedModel, count: modelComplaintCount }]} className="mx-auto">
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <CartesianGrid stroke="#ccc" />
                            <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                    </div>
                    <div className="chart w-1/2">
                        <h2 className="text-xl font-semibold mb-4 text-center">Dôvody reklamácií pre model: {selectedModel}</h2>
                        <PieChart width={500} height={300} className="mx-auto">
                            <Pie
                                data={reasons}
                                dataKey="count"
                                nameKey="reason"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                label
                            >
                                {reasons.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Statistics;