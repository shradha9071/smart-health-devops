require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const tokenRoutes = require('./routes/tokens');
const appointmentRoutes = require('./routes/appointments');
const doctorRoutes = require('./routes/doctors');
const departmentRoutes = require('./routes/departments');
const notificationRoutes = require('./routes/notifications');
const displayRoutes = require('./routes/display');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: process.env.NODE_ENV === 'production' ? false : '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use((req, res, next) => {
  req.io = io;
  next();
});

if (!process.env.MONGO_URL) {
  console.error('❌ MONGO_URL not set in .env');
  process.exit(1);
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_here_change_me') {
  console.error('❌ Please set a secure JWT_SECRET in .env');
  process.exit(1);
}

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URL, { dbName: 'smarthealth' })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/display', displayRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err.stack || err);
  res.status(err.status || 500).json({ 
    ok: false, 
    error: err.message || 'Internal server error' 
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ ok: false, error: 'Route not found' });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
