import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { styled } from '@mui/system';

const StyledButton = styled(Button)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'scale(1.05)',
    },
}));

const SelectComplaintType = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Vytvoriť reklamáciu
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <StyledButton 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => navigate('/complaint/new/internal')}
                >
                    Vytvoriť internú reklamáciu
                </StyledButton>
                <StyledButton 
                    variant="contained" 
                    color="secondary" 
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => navigate('/complaint/new/external')}
                >
                    Vytvoriť externú reklamáciu
                </StyledButton>
            </Box>
        </Container>
    );
}

export default SelectComplaintType;