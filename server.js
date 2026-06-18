// 1. Load external libraries (dependencies) we need
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 2. Load configuration settings from the .env file
dotenv.config();

// 3. Create our Express app and choose the server port
const app = express();
const PORT = process.env.PORT || 5000;

// 4. Configure CORS (Cross-Origin Resource Sharing)
// This tells the backend it is safe to accept requests from your frontend
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500']
}));

// 5. Middleware to let Express understand JSON data sent in the request body
app.use(express.json());

// 6. Connect to our MongoDB Atlas Database using Mongoose
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => {
    console.log('🎉 Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error! Check your connection string in .env.');
    console.error(error);
  });

// 7. Define the structure (Schema) for our contact form submissions
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required']
  },
  destination: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: [true, 'Message is required']
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically logs the time of submission
  }
});

// Create a Mongoose Model based on the Schema
// Mongoose automatically saves this in a collection named "contacts"
const Contact = mongoose.model('Contact', contactSchema);

// 8. Define Route 1: A home route to check if the server is running
app.get('/', (req, res) => {
  res.send('✈️ JourneyHub Server is running! Go to /api/contacts to view submissions.');
});

// 9. Define Route 2 (POST): Receive submissions from the frontend
app.post('/api/contact', async (req, res) => {
  try {
    // Destructure/extract variables from the request body
    const { name, email, destination, message } = req.body;

    // Basic server-side validation to ensure nothing is missing
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please provide name, email, and message.' });
    }

    // Create a new Contact document
    const newContactSubmission = new Contact({
      name,
      email,
      destination,
      message
    });

    // Save the document to MongoDB
    await newContactSubmission.save();

    // Send a success response back to the frontend
    res.status(201).json({ message: 'Thank you! Your message was saved to the database.' });
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({ error: 'Server error: could not save submission.' });
  }
});

// 10. Define Route 3 (GET): Retrieve and display all saved messages
app.get('/api/contacts', async (req, res) => {
  try {
    // Retrieve all contacts from the database and sort by newest first (-1)
    const allSubmissions = await Contact.find().sort({ createdAt: -1 });
    
    // Send the submissions back to the client as JSON
    res.status(200).json(allSubmissions);
  } catch (error) {
    console.error('Error retrieving submissions:', error);
    res.status(500).json({ error: 'Server error: could not fetch submissions.' });
  }
});

// 11. Export the app for Vercel (serverless) OR run locally
if (process.env.NODE_ENV === 'production') {
  // Vercel uses this export
  module.exports = app;
} else {
  // Your local computer uses this
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}
