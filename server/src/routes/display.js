const express = require('express');
const router = express.Router();
const Token = require('../models/Token');
const Department = require('../models/Department');

// Get current serving token for a department
router.get('/now-serving/:deptId', async (req, res) => {
  try {
    const { deptId } = req.params;
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const currentToken = await Token.findOne({ 
      department: deptId, 
      status: { $in: ['called', 'serving'] },
      createdAt: { $gte: todayStart }
    })
    .populate('patient')
    .populate('department')
    .sort({ calledAt: -1 });
    
    res.json({ ok: true, data: currentToken });
  } catch (error) {
    console.error('Get current token error:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch current token' });
  }
});

// Get waiting queue for a department
router.get('/queue/:deptId', async (req, res) => {
  try {
    const { deptId } = req.params;
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const queue = await Token.find({ 
      department: deptId, 
      status: 'waiting',
      createdAt: { $gte: todayStart }
    })
    .populate('patient')
    .populate('department')
    .sort({ priority: -1, createdAt: 1 })
    .limit(20);
    
    res.json({ ok: true, data: queue });
  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch queue' });
  }
});

// Get all departments with current status
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find({ isOpen: true });
    
    const departmentStatus = await Promise.all(
      departments.map(async (dept) => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const currentToken = await Token.findOne({
          department: dept._id,
          status: { $in: ['called', 'serving'] },
          createdAt: { $gte: todayStart }
        }).populate('patient');
        
        const waitingCount = await Token.countDocuments({
          department: dept._id,
          status: 'waiting',
          createdAt: { $gte: todayStart }
        });
        
        return {
          department: dept,
          currentToken,
          waitingCount
        };
      })
    );
    
    res.json({ ok: true, data: departmentStatus });
  } catch (error) {
    console.error('Get departments status error:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch departments status' });
  }
});

module.exports = router;
