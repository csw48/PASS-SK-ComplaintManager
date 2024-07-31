// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import InternalComplaints from './components/InternalComplaints';
import ExternalComplaints from './components/ExternalComplaints';
import SelectComplaintType from './components/SelectComplaintType';
import CreateInternalComplaint from './components/CreateInternalComplaint';
import CreateExternalComplaint from './components/CreateExternalComplaint';
import EditComplaint from './components/EditComplaint';
import InternalEditComplaint from './components/InternalEditComplaint';
import ExternalEditComplaint from './components/ExternalEditComplaint';
import ComplaintDetail from './components/ComplaintDetail';
import Sidebar from './components/Sidebar';
import Statistics from './components/Statistics';
import Home from './components/Home';
import UploadComponent from './components/UploadComponent';
import Login from './components/Login';  // pridaj Login komponent
import Register from './components/Register';
import { AuthProvider } from './context/AuthContext';
import Logs from './components/Logs';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="flex">
                    <Sidebar />
                    <div className="flex-1 ml-64 p-6">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/internal-complaints" element={<InternalComplaints />} />
                            <Route path="/external-complaints" element={<ExternalComplaints />} />
                            <Route path="/complaint/new" element={<SelectComplaintType />} />
                            <Route path="/complaint/new/internal" element={<CreateInternalComplaint />} />
                            <Route path="/complaint/new/external" element={<CreateExternalComplaint />} />
                            <Route path="/edit-complaint/:complaintNumber" element={<EditComplaint />} />
                            <Route path="/internal-edit-complaint/:complaintNumber" element={<InternalEditComplaint />} />
                            <Route path="/external-edit-complaint/:complaintNumber" element={<ExternalEditComplaint />} />
                            <Route path="/complaint/:complaintNumber" element={<ComplaintDetail />} />
                            <Route path="/statistics" element={<Statistics />} />
                            <Route path="/upload" element={<UploadComponent />} />
                            <Route path="/login" element={<Login />} /> 
                            <Route path="/register" element={<Register />} />
                            <Route path="/logs" element={<Logs />} />
                        </Routes>
                    </div>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;