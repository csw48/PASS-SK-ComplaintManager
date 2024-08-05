import React from 'react';
import { Container, Typography, Grid, Paper, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f4f6f8',
        },
        text: {
            primary: '#333',
            secondary: '#555',
        },
    },
});

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: theme.shadows[4],
        transform: 'scale(1.05)',
    },
}));

const Home = () => {
    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Box textAlign="center" my={4}>
                    <Typography variant="h3" component="h1" gutterBottom>
                        Vitajte v PASS-SK Manažer Reklamacii
                    </Typography>
                    <Typography variant="h5" component="p" color="textSecondary">
                        Moderné riešenie pre správu reklamácií a štatistík
                    </Typography>
                </Box>

                <Box my={4}>
                    <Typography variant="h4" component="h2" gutterBottom>
                        O aplikácii
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Naša aplikácia poskytuje efektívne nástroje pre správu interných a externých reklamácií. Môžete sledovať reklamácie, analyzovať ich príčiny a vytvárať detailné štatistiky.
                    </Typography>
                </Box>

                <Box my={4}>
                    <Typography variant="h4" component="h2" gutterBottom>
                        Hlavné funkcie
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <StyledPaper>
                                <Typography variant="h5" component="h3" gutterBottom>
                                    Správa reklamácií
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    Jednoduché sledovanie a správa interných a externých reklamácií.
                                </Typography>
                            </StyledPaper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <StyledPaper>
                                <Typography variant="h5" component="h3" gutterBottom>
                                    Štatistiky a analýzy
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    Detailné štatistiky a analýzy na identifikáciu hlavných príčin reklamácií.
                                </Typography>
                            </StyledPaper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <StyledPaper>
                                <Typography variant="h5" component="h3" gutterBottom>
                                    Reporty
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    Generovanie reportov pre lepšie pochopenie dát.
                                </Typography>
                            </StyledPaper>
                        </Grid>
                    </Grid>
                </Box>

                <Box my={4}>
                    <Typography variant="h4" component="h2" gutterBottom>
                        Často kladené otázky
                    </Typography>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Ako môžem pridať novú reklamáciu?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body1" color="textSecondary">
                                Na pridanie novej reklamácie použite formulár dostupný v ľavej časti: "Vytvoriť reklamáciu".
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Ako môžem získať prístup k štatistikám?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body1" color="textSecondary">
                                Štatistiky sú dostupné cez sekciu "Štatistiky" v ľavej časti.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                </Box>

                <Box textAlign="center" py={4} borderTop={1} borderColor="grey.300">
                    <Typography variant="body2" color="textSecondary">&copy; 2024 PASS-SK. Všetky práva vyhradené.</Typography>
                    <Typography variant="body2" color="textSecondary">Created by Daniel Vajda</Typography>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default Home;
