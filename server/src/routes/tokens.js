const express = require('express');
const Token = require('../models/Token');
const Department = require('../models/Department');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { patient, patientId, department, priority } = req.body;
    
    const actualPatientId = patient || patientId;
    
    if (!actualPatientId || !department) {
      return res.status(400).json({ ok: false, error: 'Patient and department are required' });
    }
    
    const dept = await Department.findById(department);
    if (!dept) {
      return res.status(400).json({ ok: false, error: 'Department not found' });
    }

    if (!dept.isOpen) {
      return res.status(400).json({ ok: false, error: 'Department is currently closed' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const queueCount = await Token.countDocuments({
      department,
      createdAt: { $gte: todayStart },
      status: { $in: ['waiting', 'called', 'serving'] }
    });

    if (queueCount >= dept.maxQueueSize) {
      return res.status(400).json({ ok: false, error: 'Queue is full for today' });
    }

    const existingToken = await Token.findOne({
      patient: actualPatientId,
      department,
      createdAt: { $gte: todayStart },
      status: { $in: ['waiting', 'called', 'serving'] }
    });

    if (existingToken) {
      return res.status(400).json({ ok: false, error: 'Patient already has an active token for this department' });
    }

    const lastToken = await Token.findOne({ 
      department, 
      createdAt: { $gte: todayStart } 
    }).sort({ createdAt: -1 });
    
    const nextNum = lastToken ? parseInt(lastToken.tokenNumber.split('-')[1]) + 1 : 1;
    const deptPrefix = dept.name.substring(0, 3).toUpperCase();
    const tokenNumber = `${deptPrefix}-${String(nextNum).padStart(3, '0')}`;

    const token = new Token({ 
      tokenNumber, 
      patient: actualPatientId, 
      department, 
      priority: priority || false 
    });
    
    await token.save();

    const populatedToken = await Token.findById(token._id)
      .populate('patient')
      .populate('department');

    if (req.io) {
      req.io.emit('tokenCreated', populatedToken);
    }
    
    res.status(201).json({ ok: true, data: populatedToken, message: 'Token generated successfully' });
  } catch (error) {
    console.error('Token creation error:', error);
    res.status(500).json({ ok: false, error: 'Failed to generate token' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { department, status } = req.query;
    const query = {};
    
    if (department) query.department = department;
    if (status) query.status = status;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    query.createdAt = { $gte: todayStart };

    const tokens = await Token.find(query)
      .populate('patient')
      .populate('department')
      .populate('doctor')
      .sort({ priority: -1, createdAt: 1 });
    
    res.json({ ok: true, data: tokens });
  } catch (error) {
    console.error('Get tokens error:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch tokens' });
  }
});

router.patch('/:id/call', auth, async (req, res) => {
  try {
    const { counter } = req.body;
    
    if (!counter) {
      return res.status(400).json({ ok: false, error: 'Counter is required' });
    }
    
    const token = await Token.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'called', 
        calledAt: new Date(), 
        counter 
      },
      { new: true }
    ).populate('patient').populate('department');

    if (!token) {
      return res.status(404).json({ ok: false, error: 'Token not found' });
    }

    try {
      const notification = new Notification({
        patient: token.patient._id,
        token: token._id,
        message: `Your token ${token.tokenNumber} is being called. Please proceed to ${counter}`,
        type: 'push',
        status: 'sent',
        sentAt: new Date()
      });
      await notification.save();
    } catch (notifError) {
      console.error('Notification creation error:', notifError);
    }

    if (req.io) {
      req.io.emit('tokenCalled', token);
    }
    
    res.json({ ok: true, data: token, message: 'Token called successfully' });
  } catch (error) {
    console.error('Call token error:', error);
    res.status(500).json({ ok: false, error: 'Failed to call token' });
  }
});

router.patch('/:id/skip', auth, async (req, res) => {
  try {
    const token = await Token.findByIdAndUpdate(
      req.params.id,
      { status: 'skipped', skippedAt: new Date() },
      { new: true }
    ).populate('patient').populate('department');

    if (!token) {
      return res.status(404).json({ ok: false, error: 'Token not found' });
    }

    if (req.io) {
      req.io.emit('tokenUpdated', token);
    }
    
    res.json({ ok: true, data: token, message: 'Token skipped successfully' });
  } catch (error) {
    console.error('Skip token error:', error);
    res.status(500).json({ ok: false, error: 'Failed to skip token' });
  }
});

router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const token = await Token.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', completedAt: new Date() },
      { new: true }
    ).populate('patient').populate('department');

    if (!token) {
      return res.status(404).json({ ok: false, error: 'Token not found' });
    }

    if (req.io) {
      req.io.emit('tokenUpdated', token);
    }
    
    res.json({ ok: true, data: token, message: 'Token completed successfully' });
  } catch (error) {
    console.error('Complete token error:', error);
    res.status(500).json({ ok: false, error: 'Failed to complete token' });
  }
});

module.exports = router;
