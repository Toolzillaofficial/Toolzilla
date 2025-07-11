// Required packages: express, axios, multer, cors, form-data
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const cors = require('cors');
const path = require('path');

// Initialize the Express app
const app = express();
const port = 3000;

// Set up multer to handle file uploads in memory (without saving to disk)
const upload = multer({ storage: multer.memoryStorage() });

// Enable CORS (Cross-Origin Resource Sharing) to allow the frontend to call this backend
app.use(cors());

// Serve the index.html file when someone visits the root URL (http://localhost:3000)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Define the main endpoint that the frontend will call
app.post('/upscale-image', upload.single('image'), async (req, res) => {
    // Check if a file was actually uploaded
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
    }

    try {
        // Create a new FormData object to send to the external AI API
        const formData = new FormData();
        // The external API expects a field named 'image_url', so we append the file buffer to it
        formData.append('image_url', req.file.buffer, { filename: req.file.originalname });

        // Configure the request to the external AI API
        const options = {
            method: 'POST',
            url: 'https://ai-image-upscaler-with-enhancement.p.rapidapi.com/v2/upscale',
            headers: {
                // Your secret API key is kept safe here on the backend
                'x-rapidapi-key': 'bc73a476e6msh10240cb95786540p14f225jsn6eef43bdb1d6',
                'x-rapidapi-host': 'ai-image-upscaler-with-enhancement.p.rapidapi.com',
                // Important headers provided by the FormData library
                ...formData.getHeaders()
            },
            data: formData,
            responseType: 'arraybuffer' // We expect the API to return raw image data
        };

        // Make the call to the external AI API
        const response = await axios.request(options);
        
        // Forward the successful image response back to our frontend
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);

    } catch (error) {
        // If anything goes wrong, log the error and send a clear error message to the frontend
        console.error('Error calling external API:', error.response ? error.response.data.toString() : error.message);
        res.status(500).json({ error: 'Failed to upscale the image. The external service may be down or the API key limit might be reached.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running! Open your browser and go to http://localhost:${port}`);
});
