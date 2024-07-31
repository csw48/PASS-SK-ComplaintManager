import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Container, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Logs = () => {
    const { authToken } = useContext(AuthContext);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/logs/', {
                    headers: {
                        Authorization: `Token ${authToken}`
                    }
                });
                setLogs(response.data);
            } catch (error) {
                toast.error('Nepodarilo sa načítať logy.');
            }
        };

        fetchLogs();
    }, [authToken]);

    const getActionLabel = (action) => {
        switch(action) {
            case 1:
                return 'Create';
            case 2:
                return 'Update';
            case 3:
                return 'Delete';
            default:
                return 'Unknown';
        }
    }

    return (
        <Container component="main" maxWidth="md">
            <ToastContainer />
            <Typography component="h1" variant="h5" sx={{ mt: 4, mb: 4 }}>
                Logy
            </Typography>
            <List>
                {logs.map((log) => (
                    <ListItem key={log.id} alignItems="flex-start">
                        <ListItemAvatar>
                            <Avatar alt={log.actor_name || 'Neznámy užívateľ'} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={`Užívateľ: ${log.actor_name || 'Neznámy užívateľ'}`}
                            secondary={
                                <>
                                    <Typography component="span" variant="body2" color="text.primary">
                                        Akcia: {getActionLabel(log.action)}
                                    </Typography>
                                    <br />
                                    <Typography component="span" variant="body2" color="text.secondary">
                                        Popis: {typeof log.changes === 'string' ? log.changes : JSON.stringify(log.changes)}
                                    </Typography>
                                    <br />
                                    <Typography component="span" variant="body2" color="text.secondary">
                                        Časová značka: {new Date(log.timestamp).toLocaleString()}
                                    </Typography>
                                </>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default Logs;