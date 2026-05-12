require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { connectDB, User, Contact, Newsletter } = require('./db');
const multer = require('multer');
const fs = require('fs');

// Configure Multer for Profile Pictures
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Use /tmp for Vercel (ephemeral), or 'uploads/' for local development
        const uploadPath = process.env.VERCEL ? '/tmp' : 'uploads/';
        if (!fs.existsSync(uploadPath) && !process.env.VERCEL) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images are allowed!'));
    }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(process.env.VERCEL ? '/tmp' : path.join(__dirname, '../uploads')));
app.use(session({
    secret: process.env.JWT_SECRET || 'EastBlue_Super_Secret_Key_2026',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eastblue_db',
        connectTimeoutMS: 10000,
        ttl: 14 * 24 * 60 * 60
    }),
    cookie: { 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

// Connect to Database (Non-blocking)
connectDB().catch(err => console.error('Initial DB Connection failed:', err));

// --- Gemini Setup ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, firstName, lastName, email, password, plan } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            username: username || `${firstName} ${lastName}`, 
            email, 
            password: hashedPassword,
            membershipType: plan || 'Free Trial'
        });
        await newUser.save();
        req.session.userId = newUser._id;
        req.session.username = newUser.username;
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Server Error: ' + error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        req.session.userId = user._id;
        req.session.username = user.username;
        res.json({ token, username: user.username, message: 'Login successful' });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server Error: ' + error.message });
    }
});

// --- Newsletter Route ---
app.post('/api/newsletter', async (req, res) => {
    console.log('📩 Newsletter subscription attempt for:', req.body.email);
    try {
        const { email } = req.body;
        const newNewsletter = new Newsletter({ email });
        await newNewsletter.save();
        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Email already subscribed' });
        }
        res.status(500).json({ error: err.message });
    }
});


// --- Chatbot Route ---
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        // System instruction for the Gym Assistant
        const systemInstruction = `You are a professional Gym Assistant for 'East Blue Gym'. You are helpful, motivating, and knowledgeable about fitness, nutrition, and gym equipment.
        
        Our Current Class Schedule:
        - 06:00 AM: Cardio Burst with Coach Alex (High Intensity)
        - 07:30 AM: Iron Strength with Coach Mia (Medium Intensity)
        - 09:00 AM: Yoga Flow with Coach Sara (Low Intensity)
        - 12:00 PM: Hybrid Burn with Coach Jordan (High Intensity)
        - 05:30 PM: Beast Mode with Coach Kai (High Intensity)
        - 07:00 PM: Active Recovery with Coach Sara (Low Intensity)

        When users ask about classes, suggest these specific trainers and times. 

        BMR CALCULATION:
        If a user provides their weight (kg) and height (cm), calculate their BMR using the Mifflin-St Jeor Equation.
        Formula: BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5 (default age to 25 and gender to male if not specified).
        When you provide the result, also include exactly 'BMR_VALUE: [number]' at the end of your response.

        Keep your responses concise and friendly.`;

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemInstruction }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am the East Blue Gym Assistant. I can suggest classes and calculate BMR for members. If they provide weight and height, I'll calculate their daily calorie needs and provide the BMR value. How can I help you today?" }],
                },
                ...history.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }))
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        let text = response.text();
        
        // Parse BMR if AI calculated it
        const bmrMatch = text.match(/BMR_VALUE: (\d+(\.\d+)?)/);
        if (bmrMatch) {
            const bmrValue = bmrMatch[1];
            req.session.bmr = bmrValue;
            console.log(`Saved BMR to session: ${bmrValue}`);
            // Remove the hidden tag from the user's view
            text = text.replace(/BMR_VALUE: \d+(\.\d+)?/, '').trim();
        }
        
        res.json({ reply: text });
    } catch (err) {
        console.error('--- Gemini Error Details ---');
        console.error('Message:', err.message);
        if (err.status) console.error('Status:', err.status);
        if (err.errorDetails) console.error('Details:', JSON.stringify(err.errorDetails, null, 2));
        console.error('---------------------------');
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

// --- User Status Route ---
app.get('/api/user/status', (req, res) => {
    res.json({
        loggedIn: !!req.session.userId,
        username: req.session.username || 'Member',
        bmr: req.session.bmr || null
    });
});



// --- Invest Route ---
app.post('/api/invest', (req, res) => {
    // Just simulate saving an investor request
    console.log(`Investor request from: ${req.body.email}`);
    res.json({ message: 'Pitch deck request received. We will contact you shortly.' });
});

// Serve the frontend - fallback to index.html for SPA behavior
// Frontend files are served via express.static on line 46.
// No catch-all needed for multi-page static site.





// --- User Profile Routes ---
app.get('/api/user/profile', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const user = await User.findById(req.session.userId).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/user/profile/update', upload.any(), async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
    
    try {
        // --- DEEP AUDIT LOG ---
        console.log('📡 [UPDATE ATTEMPT]');
        console.log('📦 Body:', req.body);
        console.log('📂 Files:', req.files);

        if ((!req.body || Object.keys(req.body).length === 0) && (!req.files || req.files.length === 0)) {
            console.warn('⚠️ [UPDATE REJECTED]: No data or files received.');
            return res.status(400).json({ error: 'No data received. Please try again.' });
        }

        const { username, nickname, bio, secondaryEmail } = req.body;
        let profilePicture = req.body.profilePicture;

        // Find the specific file if uploaded
        const profileFile = req.files ? req.files.find(f => f.fieldname === 'profilePictureFile') : null;
        if (profileFile) {
            profilePicture = `/uploads/${profileFile.filename}`;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.session.userId,
            { username, nickname, bio, secondaryEmail, profilePicture },
            { new: true }
        ).select('-password');
        
        console.log('✅ Update Successful');
        res.json({ message: 'Profile updated successfully!', user: updatedUser });
    } catch (err) {
        console.error('Update Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/user/profile/change-email', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const { newEmail } = req.body;
        // Check if email taken
        const existing = await User.findOne({ email: newEmail });
        if (existing) return res.status(400).json({ error: 'Email already in use' });

        await User.findByIdAndUpdate(req.session.userId, { email: newEmail });
        res.json({ message: 'Email updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/user/profile/change-password', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const { newPassword } = req.body;
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.session.userId, { password: hashedPassword });
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;

