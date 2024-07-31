import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/AuthContext';

const ExternalComplaints = () => {
    const { authAxios } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [filterText, setFilterText] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await authAxios.get('http://localhost:8000/api/external-complaints/', {
                    params: {
                        sort_by: 'date',
                        sort_order: sortOrder,
                        page: currentPage,
                    }
                });

                const data = Array.isArray(response.data.results) ? response.data.results : response.data;
                const formattedData = data.map(complaint => ({
                    ...complaint,
                    ourCosts: complaint.costs
                        ? complaint.costs.filter(cost => cost.type === 'our_costs').reduce((total, cost) => total + parseFloat(cost.cost), 0)
                        : 0,
                    withoutCosts: complaint.costs
                        ? complaint.costs.filter(cost => cost.type === 'without_costs').reduce((total, cost) => total + parseFloat(cost.cost), 0)
                        : 0,
                    totalCosts: complaint.costs
                        ? complaint.costs.reduce((total, cost) => total + parseFloat(cost.cost), 0)
                        : 0
                }));

                setComplaints(formattedData);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    toast.error('Je nutné sa prihlásiť.');
                } else {
                    toast.error('Chyba pri načítavaní reklamácií');
                    console.error('Error fetching complaints:', err);
                }
            }
        };

        fetchData();
    }, [authAxios, sortOrder, currentPage]);

    const handleEdit = (complaintNumber) => {
        navigate(`/external-edit-complaint/${complaintNumber}`);
    };

    const handleDelete = async (complaintNumber) => {
        if (window.confirm("Naozaj chcete vymazať túto reklamáciu?")) {
            try {
                await authAxios.delete(`http://localhost:8000/api/delete-complaint/${complaintNumber}/`);
                setComplaints(prevComplaints => prevComplaints.filter(complaint => complaint.complaint_number !== complaintNumber));
                toast.success('Reklamácia bola úspešne vymazaná');
            } catch (error) {
                toast.error('Chyba pri vymazávaní reklamácie');
                console.error('There was an error deleting the complaint!', error);
            }
        }
    };

    const handleSort = () => {
        setSortOrder(prevOrder => (prevOrder === 'desc' ? 'asc' : 'desc'));
    };

    const getRowClass = (params) => {
        const status = params.data.status ? params.data.status.toLowerCase() : '';
    
        switch (status) {
            case 'akceptovaná':
                return 'accepted';
            case 'neakceptovaná':
                return 'not-accepted';
            case 'v procese':
                return 'in-process';
            case 'stornovaná':  
                return 'cancelled';  
            default:
                return '';
        }
    };

    const handleComplaintClick = (complaintNumber) => {
        navigate(`/complaint/${complaintNumber}`);
    };

    const onFilterTextChange = (e) => {
        setFilterText(e.target.value);
    };

    const exportToPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });

        const headers = [
            { title: "Complaint Number", dataKey: "complaint_number" },
            { title: "Model SK", dataKey: "model_sk" },
            { title: "Model DE", dataKey: "model_de" },
            { title: "Customer", dataKey: "customer" },
            { title: "PASS", dataKey: "pass_value" },
            { title: "Date", dataKey: "date" },
            { title: "Quantity", dataKey: "quantity" },
            { title: "Reason", dataKey: "reason" },
            { title: "Activities", dataKey: "activities" },
            { title: "Status", dataKey: "status" },
            { title: "Response Date", dataKey: "response_date" },
            { title: "Note", dataKey: "extra_note" },
            { title: "Correction Verification", dataKey: "correction_verification" },
            { title: "Our Costs", dataKey: "ourCosts" },
            { title: "Without Costs", dataKey: "withoutCosts" },
            { title: "Total Costs", dataKey: "totalCosts" }
        ];

        const filteredHeaders = headers.filter(header => {
            return complaints.some(complaint => complaint[header.dataKey] !== null && complaint[header.dataKey] !== '');
        });

        const data = complaints.map(complaint => {
            const filteredData = {};
            filteredHeaders.forEach(header => {
                filteredData[header.dataKey] = complaint[header.dataKey] || '';
            });
            return filteredData;
        });

        doc.autoTable({
            head: [filteredHeaders.map(header => header.title)],
            body: data.map(item => filteredHeaders.map(header => item[header.dataKey])),
            styles: { font: 'helvetica', fontSize: 10 },
            headStyles: { fillColor: [128, 128, 128] }
        });

        doc.save('external_complaints.pdf');
    };

    const columnDefs = [
        { headerName: 'Číslo reklamácie', field: 'complaint_number', sortable: true, flex: 1, minWidth: 180, cellClass: 'text-center', onCellClicked: (params) => handleComplaintClick(params.data.complaint_number)},
        { headerName: 'Model SK', field: 'model_sk', sortable: true, flex: 1, minWidth: 120, cellClass: 'text-center' },
        { headerName: 'Model DE', field: 'model_de', sortable: true, flex: 1, minWidth: 120, cellClass: 'text-center' },
        { headerName: 'Zákaznik', field: 'customer', sortable: true, flex: 1, minWidth: 120, cellClass: 'text-center' },
        { headerName: 'PASS', field: 'pass_value', sortable: true, flex: 1, minWidth: 120, cellClass: 'text-center' },
        { headerName: 'Dátum', field: 'date', sortable: true, onSortChanged: handleSort  , flex: 1, minWidth: 120, cellClass: 'text-center'},
        { headerName: 'Počet ks', field: 'quantity', sortable: true, flex: 1, minWidth: 150, cellClass: 'text-center' },
        { headerName: 'Dôvod', field: 'reason', sortable: true, flex: 1, minWidth: 120, cellClass: 'text-center' },
        { headerName: 'Aktivity', field: 'activities', sortable: true, flex: 1, minWidth: 130, cellClass: 'text-center' },
        { headerName: 'Status', field: 'status', sortable: true, flex: 1, minWidth: 120, cellClass: 'text-center' },
        { headerName: 'Dátum odpoveďe', field: 'response_date', sortable: true, flex: 1, minWidth: 180, cellClass: 'text-center' },
        { headerName: 'Poznámka', field: 'extra_note', sortable: true, flex: 1, minWidth: 150, cellClass: 'text-center' },
        { headerName: 'Overenie nápravných opatrení', field: 'correction_verification', sortable: true, flex: 1, minWidth: 180, cellClass: 'text-center' },
        { headerName: 'Naše náklady', field: 'ourCosts', flex: 1, minWidth: 200, cellClass: 'text-center', cellRenderer: (params) => params.data.costs.filter(cost => cost.type === 'our_costs').map(cost => `${cost.cost} €`).join(', ') },
        { headerName: 'Bez naších nákladov', field: 'withoutCosts', flex: 1, minWidth: 200, cellClass: 'text-center',  cellRenderer: (params) => params.data.costs.filter(cost => cost.type === 'without_costs').map(cost => `${cost.cost} €`).join(', ') },
        { headerName: 'Spolu', field: 'totalCosts', sortable: true, flex: 1, minWidth: 120, cellClass: 'text-center' },
        {
            headerName: 'Upraviť', field: 'edit', flex: 1, minWidth: 120, cellClass: 'text-center', cellRenderer: (params) => (
                <button onClick={() => handleEdit(params.data.complaint_number)} className="bg-blue-500 text-white px-4 py-1 rounded">Upraviť</button>
            )
        },
        {
            headerName: 'Vymazať', field: 'delete', flex: 1, minWidth: 120, cellClass: 'text-center', cellRenderer: (params) => (
                <button onClick={() => handleDelete(params.data.complaint_number)} className="bg-red-500 text-white px-4 py-1 rounded">Vymazať</button>
            )
        },
    ];

    return (
        <div className="container mx-auto px-4 py-6">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-4">Externé reklamácie</h1>
            <button onClick={exportToPDF} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">Exportovať do PDF</button>
            <input 
                type="text" 
                value={filterText} 
                onChange={onFilterTextChange} 
                placeholder="Hľadať..." 
                className="mb-4 p-2 border border-gray-300 rounded w-full"
            />
            <div className="ag-theme-alpine" style={{ height: 750, width: '310%' }}>
                <AgGridReact
                    rowData={complaints}
                    columnDefs={columnDefs}
                    getRowClass={getRowClass}
                    pagination={true}
                    paginationPageSize={15}
                    quickFilterText={filterText}
                    onPaginationChanged={(params) => {
                        if (params.api) {
                            const currentPage = params.api.paginationGetCurrentPage();
                            setCurrentPage(currentPage + 1);
                        }
                    }}
                />
            </div>
        </div>
    );
}

export default ExternalComplaints;