const express = require('express');
const Department = require('../models/Department');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, description, maxQueueSize, isOpen } = req.body;
    
    if (!name) {
      return res.status(400).json({ ok: false, error: 'Department name is required' });
    }
    
    const existingDept = await Department.findOne({ name });
    if (existingDept) {
      return res.status(400).json({ ok: false, error: 'Department already exists' });
    }
    
    const department = new Department({ 
      name, 
      description, 
      maxQueueSize: maxQueueSize || 50, 
      isOpen: isOpen !== undefined ? isOpen : true 
    });
    
    await department.save();
    res.status(201).json({ ok: true, data: department, message: 'Department created successfully' });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ ok: false, error: 'Failed to create department' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { isOpen } = req.query;
    const query = isOpen !== undefined ? { isOpen: isOpen === 'true' } : {};
    
    const departments = await Department.find(query).sort({ name: 1 });
    res.json({ ok: true, data: departments });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch departments' });
  }
});

router.patch('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!department) {
      return res.status(404).json({ ok: false, error: 'Department not found' });
    }
    
    res.json({ ok: true, data: department, message: 'Department updated successfully' });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ ok: false, error: 'Failed to update department' });
  }
});

module.exports = router;
