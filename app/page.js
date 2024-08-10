'use client';
import { useState, useEffect } from 'react';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { Container, Typography, TextField, Button, Select, MenuItem, InputLabel, FormControl, Snackbar, Box, Paper, IconButton } from '@mui/material';
import { Alert } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export default function Home() {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [chat, setChat] = useState(null);
    const [theme, setTheme] = useState("light");
    const [error, setError] = useState(null);

    const API_key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const MODEL_NAME = "gemini-1.5-flash";
    const genAI = new GoogleGenerativeAI(API_key);

    const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
    };

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    useEffect(() => {
        const initChat = async () => {
            try {
                const newChat = await genAI
                    .getGenerativeModel({ model: MODEL_NAME })
                    .startChat({
                        generationConfig,
                        safetySettings,
                        history: messages.map((msg) => ({
                            text: msg.text,
                            role: msg.role,
                        }))
                    });
                setChat(newChat);
            } catch (error) {
                setError("Failed to initialize chat. Please try again");
            }
        };

        initChat();
    }, [messages]);

    const handleSendMessage = async () => {
        try {
            const userMessage = {
                text: userInput,
                role: "user",
                timestamp: new Date(),
            };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            setUserInput("");

            if (chat) {
                const result = await chat.sendMessage(userInput);
                const botMessage = {
                    text: result.response.text(),
                    role: "bot",
                    timestamp: new Date(),
                };
                setMessages((prevMessages) => [...prevMessages, botMessage]);
            }
        } catch (error) {
            setError("Failed to send message. Please try again");
        }
    };

    const handleThemeChange = (e) => {
        setTheme(e.target.value);
    };

    const getThemeColors = () => {
        switch (theme) {
            case "light":
                return {
                    primary: '#ffffff',
                    secondary: "#f5f5f5",
                    accent: "#2196f3",
                    text: "#000000",
                };
            case "dark":
                return {
                    primary: "#303030",
                    secondary: "#424242",
                    accent: "#c43bff",
                    text: "#ffffff"
                };
            default:
                return {
                    primary: '#ffffff',
                    secondary: "#f5f5f5",
                    accent: "#2196f3",
                    text: "#000000"
                };
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const { primary, secondary, accent, text } = getThemeColors();

    return (
        <Container maxWidth="sm" sx={{ height: '100vh', bgcolor: primary, color: text, display: 'flex', flexDirection: 'column', p: 2 }}>
            <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" component="h1" color={text}>Gemini Chat</Typography>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="theme-select-label" sx={{ color: text }}>Theme</InputLabel>
                    <Select
                        labelId="theme-select-label"
                        id="theme-select"
                        value={theme}
                        onChange={handleThemeChange}
                        label="Theme"
                        sx={{ bgcolor: secondary, color: text }}
                    >
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Box flex={1} overflow="auto" bgcolor={secondary} p={2} borderRadius={1}>
                {messages.map((msg, index) => (
                    <Box key={index} mb={2} display="flex" flexDirection={msg.role === "user" ? "row-reverse" : "row"}>
                        <Paper
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: msg.role === "user" ? accent : primary,
                                color: msg.role === "user" ? '#ffffff' : text,
                                maxWidth: '70%',
                                wordBreak: 'break-word',
                            }}
                        >
                            {msg.text}
                        </Paper>
                        <Typography variant="caption" color={text} ml={1}>
                            {msg.role === "bot" ? "Bot" : "You"} - {msg.timestamp.toLocaleTimeString()}
                        </Typography>
                    </Box>
                ))}
            </Box>
            {error && (
                <Snackbar
                    open={Boolean(error)}
                    autoHideDuration={6000}
                    onClose={() => setError(null)}
                    action={
                        <IconButton
                            size="small"
                            aria-label="close"
                            color="inherit"
                            onClick={() => setError(null)}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                >
                    <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                </Snackbar>
            )}
            <Box mt={2} display="flex" alignItems="center">
                <TextField
                    variant="outlined"
                    placeholder="Type your Message..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    fullWidth
                    sx={{ mr: 1, bgcolor: secondary, color: text }}
                />
                <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    sx={{ bgcolor: accent, color: text }}
                >
                    Send
                </Button>
            </Box>
        </Container>
    );
}
