const express = require('express');
const Patient = require('../models/Patient');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Allow public patient registration without staff authentication
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, age, gender, address, medicalHistory } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ ok: false, error: 'Name and phone are required' });
    }
    
    const existing = await Patient.findOne({ phone });
    if (existing) {
      return res.json({ ok: true, data: existing, message: 'Patient already exists' });
    }
    
    const patient = new Patient({ name, phone, email, age, gender, address, medicalHistory });
    await patient.save();
    
    res.status(201).json({ ok: true, data: patient, message: 'Patient registered successfully' });
  } catch (error) {
    console.error('Patient registration error:', error);
    if (error.code === 11000) {
      res.status(400).json({ ok: false, error: 'Phone number already exists' });
    } else {
      res.status(500).json({ ok: false, error: 'Failed to register patient' });
    }
  }
});

router.get('/', async (req, res) => {
  try {
    const { phone, search } = req.query;
    let query = {};
    
    if (phone) {
      query.phone = phone;
    } else if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .limit(100);
      
    res.json({ ok: true, data: patients });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch patients' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ ok: false, error: 'Patient not found' });
    }
    
    res.json({ ok: true, data: patient });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch patient' });
  }
});

module.exports = router;
