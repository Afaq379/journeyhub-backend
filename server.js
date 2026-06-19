// server.js - ORIGINAL WORKING VERSION (Before Deployment)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS - Allow frontend to connect
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500']
}));

app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('🎉 Successfully connected to MongoDB Atlas!'))
  .catch((error) => {
    console.error('❌ MongoDB connection error!');
    console.error(error);
  });

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  destination: { type: String, default: '' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// Routes
app.get('/', (req, res) => {
  res.send('JourneyHub Server is running! Go to /api/contacts to view submissions.');
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, destination, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please provide name, email, and message.' });
    }
    const newContact = new Contact({ name, email, destination, message });
    await newContact.save();
    res.status(201).json({ message: 'Thank you! Your message was saved to the database.' });
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({ error: 'Server error: could not save submission.' });
  }
});

app.get('/api/contacts', async (req, res) => {
  try {
    const allSubmissions = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(allSubmissions);
  } catch (error) {
    console.error('Error retrieving submissions:', error);
    res.status(500).json({ error: 'Server error: could not fetch submissions.' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});