const express = require('express');
const Doctor = require('../models/Doctor');
const Shift = require('../models/Shift');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, specialization, department, phone, email } = req.body;
    
    if (!name || !specialization || !department) {
      return res.status(400).json({ ok: false, error: 'Name, specialization, and department are required' });
    }
    
    const doctor = new Doctor({ name, specialization, department, phone, email });
    await doctor.save();
    
    const populatedDoctor = await Doctor.findById(doctor._id).populate('department');
    res.status(201).json({ ok: true, data: populatedDoctor, message: 'Doctor added successfully' });
  } catch (error) {
    console.error('Create doctor error:', error);
    if (error.code === 11000) {
      res.status(400).json({ ok: false, error: 'Doctor with this email already exists' });
    } else {
      res.status(500).json({ ok: false, error: 'Failed to create doctor' });
    }
  }
});

router.get('/', async (req, res) => {
  try {
    const { department } = req.query;
    const query = department ? { department } : {};
    
    const doctors = await Doctor.find(query)
      .populate('department')
      .sort({ name: 1 });
      
    res.json({ ok: true, data: doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch doctors' });
  }
});

router.patch('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate('department');
    
    if (!doctor) {
      return res.status(404).json({ ok: false, error: 'Doctor not found' });
    }
    
    res.json({ ok: true, data: doctor, message: 'Doctor updated successfully' });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ ok: false, error: 'Failed to update doctor' });
  }
});

router.get('/:id/shifts', auth, async (req, res) => {
  try {
    const shifts = await Shift.find({ doctor: req.params.id })
      .populate('department')
      .sort({ date: -1 });
      
    res.json({ ok: true, data: shifts });
  } catch (error) {
    console.error('Get doctor shifts error:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch doctor shifts' });
  }
});

router.post('/:id/shifts', auth, authorize('admin'), async (req, res) => {
  try {
    const { date, startTime, endTime, department } = req.body;
    
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ ok: false, error: 'Date, start time, and end time are required' });
    }
    
    const shift = new Shift({ 
      doctor: req.params.id, 
      date, 
      startTime, 
      endTime, 
      department 
    });
    
    await shift.save();
    
    const populatedShift = await Shift.findById(shift._id).populate('department');
    res.status(201).json({ ok: true, data: populatedShift, message: 'Shift added successfully' });
  } catch (error) {
    console.error('Create shift error:', error);
    res.status(500).json({ ok: false, error: 'Failed to create shift' });
  }
});

module.exports = router;
