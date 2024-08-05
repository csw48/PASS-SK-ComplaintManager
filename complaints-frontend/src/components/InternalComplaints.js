import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/AuthContext';

const InternalComplaints = () => {
    const { authAxios } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage] = useState(1);
    const [filterText, setFilterText] = useState('');
    const navigate = useNavigate();

    const fetchComplaints = useCallback(() => {
        authAxios.get(`/api/internal-complaints/?sort_by=date&sort_order=${sortOrder}&page=${currentPage}`)
            .then(response => {
                setComplaints(response.data.results);
            })
            .catch(error => {
                if (error.response && error.response.status === 401) {
                    toast.error('Je nutné sa prihlásiť.');
                } else {
                    toast.error('Chyba pri načítavaní reklamácií');
                    console.error('There was an error fetching the complaints!', error);
                }
            });
    }, [authAxios, sortOrder, currentPage]);

    useEffect(() => {
        fetchComplaints();
    }, [fetchComplaints]);

    const handleEdit = (complaintNumber) => {
        navigate(`/internal-edit-complaint/${complaintNumber}`);
    };

    const handleDelete = async (complaintNumber) => {
        if (window.confirm("Naozaj chcete vymazať túto reklamáciu?")) {
            try {
                await authAxios.delete(`/api/delete-internal-complaint/${complaintNumber}/`);
                setComplaints(prevComplaints => prevComplaints.filter(complaint => complaint.complaint_number !== complaintNumber));
                toast.success('Reklamácia bola úspešne vymazaná');
            } catch (error) {
                toast.error('Chyba pri vymazávaní reklamácie');
                console.error('There was an error deleting the complaint!', error);
            }
        }
    };

    const handleComplaintClick = (complaintNumber) => {
        navigate(`/complaint/${complaintNumber}`);
    };

    const handleSort = () => {
        setSortOrder(prevOrder => (prevOrder === 'desc' ? 'asc' : 'desc'));
    };

    const onFilterTextChange = (e) => {
        setFilterText(e.target.value);
    };

    const exportToPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });

        const headers = [
            { title: "Complaint Number", dataKey: "complaint_number" },
            { title: "Model", dataKey: "model" },
            { title: "Date", dataKey: "date" },
            { title: "Part Number", dataKey: "part_number" },
            { title: "Product Number", dataKey: "product_number" },
            { title: "Priority", dataKey: "priority" },
            { title: "Reason", dataKey: "reason" },
            { title: "PASS SK Activities", dataKey: "activities_pass_sk" },
            { title: "Responsible", dataKey: "responsible" },
            { title: "Created By", dataKey: "created_by" },
            { title: "Quantity", dataKey: "quantity" },
            { title: "Complaint Status", dataKey: "complaint_status" },
            { title: "Note", dataKey: "note" }
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

        doc.save('internal_complaints.pdf');
    };

    const columns = [
        { 
            headerName: "Číslo reklamácie", 
            field: "complaint_number", 
            sortable: true, 
            filter: true, 
            resizable: true, 
            flex: 1, 
            minWidth: 200, 
            cellClass: 'text-center cursor-pointer', 
            cellRenderer: (params) => {
                return (
                    <span 
                        onClick={() => handleComplaintClick(params.value)}
                    >
                        {params.value}
                    </span>
                );
            }
        },
        { headerName: "Model", field: "model", sortable: true, filter: true, resizable: true, flex: 1, minWidth: 130, cellClass: 'text-center' },
        { headerName: "Dátum", field: "date", sortable: true, filter: true, resizable: true, flex: 1, minWidth: 150, cellClass: 'text-center' },
        { headerName: "Číslo súčiastky", field: "part_number", sortable: true, filter: true, resizable: true, flex: 1, minWidth: 180, cellClass: 'text-center' },
        { headerName: "Číslo produktu", field: "product_number", sortable: true, filter: true, resizable: true, flex: 1, minWidth: 200, cellClass: 'text-center' },
        { headerName: "Priorita", field: "priority", sortable: true, filter: true, resizable: true, flex: 1, minWidth: 120, cellClass: 'text-center' },
        { headerName: "Dôvod", field: "reason", sortable: true, filter: true, resizable: true, flex: 1, minWidth: 120, cellClass: 'text-center' },
        { headerName: "PASS SK Aktivity", field: "activities_pass_sk", sortable: true, filter: true, resizable: true, flex: 1, minWidth: 180, cellClass: 'text-center' },
        { headerName: "Zodpovedný", field: "responsible", sortable: true, filter: true, resizable: true, flex: 1, minWidth: 180, cellClass: 'text-center' },
        { headerName: "Vytvoril", field: "created_by", sortable: true, filter: true, resizable: true, flex: 1, minWidth: 150, cellClass: 'text-center' },
        { headerName: "Počet ks", field: "quantity", sortable: true, filter: true, resizable: true, flex: 1, minWidth: 180, cellClass: 'text-center' },
        { headerName: "Status", field: "complaint_status", sortable: true, filter: true, resizable: true, flex: 1, minWidth: 180, cellClass: 'text-center' },
        { headerName: "Poznámka", field: "note", sortable: true, filter: true, resizable: true, flex: 1, minWidth: 150, cellClass: 'text-center' },
        {
            headerName: "Upraviť",
            field: "edit",
            cellRenderer: (params) => (
                <button onClick={() => handleEdit(params.data.complaint_number)}>Upraviť</button>
            ),
            sortable: false,
            filter: false,
            resizable: false,
            cellClass: 'text-center'
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
            <h1 className="text-2xl font-bold mb-4">Interné reklamácie</h1>
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
                    columnDefs={columns}
                    pagination={true}
                    paginationPageSize={15}
                    onSortChanged={handleSort}
                    quickFilterText={filterText}
                />
            </div>
        </div>
    );
}

export default InternalComplaints;
