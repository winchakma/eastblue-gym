const mongoose = require('mongoose');

const dbURI = process.env.MONGO_URI; 

const connectDB = async () => {
  try {
    console.log('📡 Attempting to connect to:', dbURI);
    await mongoose.connect(dbURI, {
      serverSelectionTimeoutMS: 5000,
      family: 4 // Force IPv4
    });
    console.log('✅ MongoDB Connected Successfully.');
  } catch (err) {
    console.error('❌ Database Connection Error:', err.message);
  }
};

// Global config to stop the 10s wait
mongoose.set('bufferCommands', false);

// --- SCHEMAS ---
const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  date: { type: Date, default: Date.now }
});

const NewsletterSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  date: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  secondaryEmail: { type: String },
  password: { type: String, required: true },
  membershipType: { type: String, default: 'Free Trial' },
  nickname: { type: String },
  bio: { type: String },
  profilePicture: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
  date: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

// --- MODELS ---
const Contact = mongoose.model('Contact', ContactSchema);
const Newsletter = mongoose.model('Newsletter', NewsletterSchema);
const User = mongoose.model('User', UserSchema);

module.exports = { connectDB, Contact, Newsletter, User };