require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    if (!process.env.MONGO_URL) {
      throw new Error('MONGO_URL not found in environment variables');
    }
    
    await mongoose.connect(process.env.MONGO_URL, { dbName: 'smarthealth' });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Appointment.deleteMany({})
    ]);

    // Create users
    console.log('👥 Creating users...');
    const users = await User.insertMany([
      {
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        name: 'System Administrator',
        email: 'admin@smarthealth.com'
      },
      {
        username: 'receptionist',
        password: await bcrypt.hash('recep123', 10),
        role: 'receptionist',
        name: 'Reception Staff',
        email: 'reception@smarthealth.com'
      },
      {
        username: 'doctor1',
        password: await bcrypt.hash('doc123', 10),
        role: 'doctor',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@smarthealth.com'
      }
    ]);

    // Create departments
    console.log('🏥 Creating departments...');
    const departments = await Department.insertMany([
      { name: 'Cardiology', description: 'Heart and cardiovascular care', isOpen: true, maxQueueSize: 30 },
      { name: 'Orthopedics', description: 'Bone, joint and muscle care', isOpen: true, maxQueueSize: 40 },
      { name: 'Pediatrics', description: 'Child healthcare services', isOpen: true, maxQueueSize: 50 },
      { name: 'General Medicine', description: 'General consultation and primary care', isOpen: true, maxQueueSize: 60 },
      { name: 'Emergency', description: 'Emergency medical services', isOpen: true, maxQueueSize: 20 }
    ]);

    // Create doctors
    console.log('👨‍⚕️ Creating doctors...');
    const doctors = await Doctor.insertMany([
      // Cardiology
      { name: 'Dr. Sarah Johnson', specialization: 'Interventional Cardiologist', department: departments[0]._id, phone: '555-1001', email: 'sarah.johnson@smarthealth.com' },
      { name: 'Dr. Michael Rodriguez', specialization: 'Cardiac Surgeon', department: departments[0]._id, phone: '555-1002', email: 'michael.rodriguez@smarthealth.com' },
      { name: 'Dr. Jennifer Lee', specialization: 'Electrophysiologist', department: departments[0]._id, phone: '555-1003', email: 'jennifer.lee@smarthealth.com' },
      
      // Orthopedics
      { name: 'Dr. Michael Chen', specialization: 'Orthopedic Surgeon', department: departments[1]._id, phone: '555-2001', email: 'michael.chen@smarthealth.com' },
      { name: 'Dr. David Thompson', specialization: 'Sports Medicine Specialist', department: departments[1]._id, phone: '555-2002', email: 'david.thompson@smarthealth.com' },
      { name: 'Dr. Lisa Wang', specialization: 'Joint Replacement Surgeon', department: departments[1]._id, phone: '555-2003', email: 'lisa.wang@smarthealth.com' },
      
      // Pediatrics
      { name: 'Dr. Emily Davis', specialization: 'General Pediatrician', department: departments[2]._id, phone: '555-3001', email: 'emily.davis@smarthealth.com' },
      { name: 'Dr. James Miller', specialization: 'Pediatric Cardiologist', department: departments[2]._id, phone: '555-3002', email: 'james.miller@smarthealth.com' },
      { name: 'Dr. Anna Garcia', specialization: 'Pediatric Neurologist', department: departments[2]._id, phone: '555-3003', email: 'anna.garcia@smarthealth.com' },
      
      // General Medicine
      { name: 'Dr. Robert Wilson', specialization: 'Internal Medicine', department: departments[3]._id, phone: '555-4001', email: 'robert.wilson@smarthealth.com' },
      { name: 'Dr. Maria Santos', specialization: 'Family Medicine', department: departments[3]._id, phone: '555-4002', email: 'maria.santos@smarthealth.com' },
      { name: 'Dr. Kevin Brown', specialization: 'General Physician', department: departments[3]._id, phone: '555-4003', email: 'kevin.brown@smarthealth.com' },
      
      // Emergency
      { name: 'Dr. Amanda White', specialization: 'Emergency Medicine', department: departments[4]._id, phone: '555-5001', email: 'amanda.white@smarthealth.com' }
    ]);

    // Create sample patients
    console.log('🏃‍♂️ Creating sample patients...');
    const patients = await Patient.insertMany([
      { name: 'John Smith', phone: '555-0101', email: 'john.smith@email.com', age: 45, gender: 'Male', address: '123 Main St, City' },
      { name: 'Mary Johnson', phone: '555-0102', email: 'mary.johnson@email.com', age: 38, gender: 'Female', address: '456 Oak Ave, City' },
      { name: 'David Wilson', phone: '555-0103', email: 'david.wilson@email.com', age: 52, gender: 'Male', address: '789 Pine Rd, City' },
      { name: 'Sarah Davis', phone: '555-0104', email: 'sarah.davis@email.com', age: 29, gender: 'Female', address: '321 Elm St, City' },
      { name: 'Mike Brown', phone: '555-0105', email: 'mike.brown@email.com', age: 41, gender: 'Male', address: '654 Maple Dr, City' },
      { name: 'Lisa Anderson', phone: '555-0106', email: 'lisa.anderson@email.com', age: 35, gender: 'Female', address: '987 Cedar Ln, City' },
      { name: 'Tom Garcia', phone: '555-0107', email: 'tom.garcia@email.com', age: 28, gender: 'Male', address: '147 Birch St, City' }
    ]);

    // Create sample appointments for today and tomorrow
    console.log('📅 Creating sample appointments...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    await Appointment.insertMany([
      // Today's appointments
      { patient: patients[0]._id, doctor: doctors[0]._id, department: departments[0]._id, appointmentDate: today, timeSlot: '09:00 AM', status: 'scheduled' },
      { patient: patients[1]._id, doctor: doctors[1]._id, department: departments[0]._id, appointmentDate: today, timeSlot: '10:30 AM', status: 'scheduled' },
      { patient: patients[2]._id, doctor: doctors[3]._id, department: departments[1]._id, appointmentDate: today, timeSlot: '11:00 AM', status: 'scheduled' },
      { patient: patients[3]._id, doctor: doctors[6]._id, department: departments[2]._id, appointmentDate: today, timeSlot: '02:00 PM', status: 'scheduled' },
      { patient: patients[4]._id, doctor: doctors[9]._id, department: departments[3]._id, appointmentDate: today, timeSlot: '03:30 PM', status: 'scheduled' },
      
      // Tomorrow's appointments
      { patient: patients[5]._id, doctor: doctors[2]._id, department: departments[0]._id, appointmentDate: tomorrow, timeSlot: '09:30 AM', status: 'scheduled' },
      { patient: patients[6]._id, doctor: doctors[4]._id, department: departments[1]._id, appointmentDate: tomorrow, timeSlot: '11:30 AM', status: 'scheduled' }
    ]);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Departments: ${departments.length}`);
    console.log(`   Doctors: ${doctors.length}`);
    console.log(`   Patients: ${patients.length}`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   Receptionist: receptionist / recep123');
    console.log('   Doctor: doctor1 / doc123');
    console.log('\n🌐 Access URLs:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Backend: http://localhost:4000');
    console.log('   Health Check: http://localhost:4000/api/health');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
