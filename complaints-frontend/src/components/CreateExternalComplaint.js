import DatePicker from 'react-datepicker';
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateExternalComplaint = () => {
    const { authAxios } = useContext(AuthContext);
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
        costs: [{ cost: '', type: 'our_costs' }],
        total: '',
        highlighted: false,
    });

    const [successMessage, setSuccessMessage] = useState('');

    const updateTotal = (costs) => {
        const total = costs.reduce((acc, item) => acc + (parseFloat(item.cost) || 0), 0);
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

            if (field === 'costs') {
                updatedFormData.costs[index].cost = newValue;
                updateTotal(updatedFormData.costs);
            } else {
                updatedFormData[name] = newValue;
            }

            return updatedFormData;
        });
    };

    const handleCostTypeChange = (index, newType) => {
        setFormData(prevFormData => {
            const updatedFormData = { ...prevFormData };
            updatedFormData.costs[index].type = newType;
            return updatedFormData;
        });
    };

    const handleAddCost = () => {
        setFormData(prevFormData => ({
            ...prevFormData,
            costs: [...prevFormData.costs, { cost: '', type: 'our_costs' }],
        }));
    };

    const handleRemoveCost = (index) => {
        if (formData.costs.length === 1) {
            return;
        }

        setFormData(prevFormData => {
            const updatedCosts = prevFormData.costs.filter((_, i) => i !== index);
            updateTotal(updatedCosts);
            return {
                ...prevFormData,
                costs: updatedCosts,
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
            costs: formData.costs.map(cost => ({
                cost: parseFloat(cost.cost) || 0,
                type: cost.type
            }))
        };

        console.log("Sending complaint data:", formattedData);

        try {
            const response = await authAxios.post('http://localhost:8000/api/external-complaints/', formattedData);
            console.log("Complaint successfully created:", response.data);
            toast.success('Reklamácia bola úspešne vytvorená');
            setSuccessMessage('Complaint successfully created!');
            setTimeout(() => {
                setSuccessMessage('');
                window.location.href = '/external-complaints';
            }, 3000);
        } catch (error) {
            const errorResponse = error.response ? error.response.data : 'There was an error creating the complaint!';
            toast.error('Chyba pri vytváraní reklamácie');
            console.error("Error creating complaint:", errorResponse);

            if (error.response && error.response.status === 400) {
                console.error("Validation errors:", errorResponse);
            }

            setSuccessMessage('');
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <ToastContainer />
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
    <label className="block text-gray-700 text-sm font-bold mb-2">Náklady</label>
    {formData.costs.map((cost, index) => (
        <div key={index} className="flex items-center mb-2">
            <input
                type="number"
                name="cost"
                value={cost.cost}
                onChange={e => handleChange(e, index, 'costs')}
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            />
            <select
                value={cost.type}
                onChange={e => handleCostTypeChange(index, e.target.value)}
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            >
                <option value="our_costs">Our Costs</option>
                <option value="without_costs">Without Costs</option>
            </select>
            <button type="button" onClick={() => handleRemoveCost(index)} className="ml-2 bg-red-500 text-white px-2 py-1 rounded">Odstrániť</button>
        </div>
    ))}
    <button type="button" onClick={() => handleAddCost('our_costs')} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Pridať náklad našej firmy</button>
    <button type="button" onClick={() => handleAddCost('without_costs')} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Pridať faktúru bez nákladov</button>
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
        </div>
    );
};

export default CreateExternalComplaint;
