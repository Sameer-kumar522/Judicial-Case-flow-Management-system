
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import Models
const User = require('../models/User');
const Court = require('../models/Court');
const Judge = require('../models/Judge');
const Case = require('../models/Case');
const Hearing = require('../models/Hearing');
const Document = require('../models/Document');
const Counter = require('../models/Counter');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('Database Connection Failed:', error.message);
    throw error;
  }
};

// Import Demo Data
const importData = async () => {
  try {
    console.log('Clearing existing demo data...');

    // Clear all collections
    await User.deleteMany({});
    await Court.deleteMany({});
    await Judge.deleteMany({});
    await Case.deleteMany({});
    await Hearing.deleteMany({});
    await Document.deleteMany({});
    await Counter.deleteMany({});

    // Hash demo password
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // 1. Create Users
    const users = await User.create([
      {
        fullName: 'System Administrator',
        email: 'admin@cfms.com',
        password: hashedPassword,
        role: 'Admin'
      },
      {
        fullName: 'Court Clerk',
        email: 'clerk@cfms.com',
        password: hashedPassword,
        role: 'Clerk'
      }
    ]);

    console.log('Users created');

    // 2. Create Courts
    const courts = await Court.create([
      {
        courtName: 'Principal Seat Karachi',
        benchLocation: 'Karachi',
        courtType: 'High Court',
        roomNumber: '101'
      },
      {
        courtName: 'Hyderabad Circuit Court',
        benchLocation: 'Hyderabad',
        courtType: 'Circuit Court',
        roomNumber: '201'
      }
    ]);

    console.log('Courts created');

    // 3. Create Judges
    const judges = await Judge.create([
      {
        fullName: 'Justice Ahmed Khan',
        designation: 'Chief Justice',
        specialization: 'Constitutional Law',
        assignedCourt: courts[0]._id,
        status: 'Active'
      },
      {
        fullName: 'Justice Ali Raza',
        designation: 'Senior Judge',
        specialization: 'Civil Law',
        assignedCourt: courts[1]._id,
        status: 'Active'
      }
    ]);

    console.log('Judges created');

    // 4. Create Cases
    const cases = await Case.create([
      {
        caseNumber: 'SHC-KHI-CIVIL-2026-0001',
        title: 'Property Ownership Dispute',
        description: 'A fictional property ownership dispute.',
        caseType: 'Civil',
        priority: 'High',
        status: 'Pending',
        court: courts[0]._id,
        assignedJudge: judges[0]._id,
        registeredBy: users[0]._id,
        plaintiff: {
          name: 'Muhammad Hassan'
        },
        defendant: {
          name: 'Ahmed Ali'
        },
        statusHistory: [
          {
            status: 'Pending',
            remarks: 'Case registered in the system.'
          }
        ]
      },
      {
        caseNumber: 'SHC-HYD-CIVIL-2026-0002',
        title: 'Contract Disagreement',
        description: 'A fictional contract disagreement.',
        caseType: 'Civil',
        priority: 'Medium',
        status: 'Under Review',
        court: courts[1]._id,
        assignedJudge: judges[1]._id,
        registeredBy: users[1]._id,
        plaintiff: {
          name: 'Usman Khan'
        },
        defendant: {
          name: 'Bilal Ahmed'
        },
        statusHistory: [
          {
            status: 'Pending',
            remarks: 'Case initially registered.'
          },
          {
            status: 'Under Review',
            remarks: 'Case moved for review.'
          }
        ]
      }
    ]);

    console.log('Cases created');

    // 5. Create Hearings
    const hearings = await Hearing.create([
      {
        case: cases[0]._id,
        judge: judges[0]._id,
        court: courts[0]._id,
        hearingDate: new Date('2026-11-15T10:00:00'),
        hearingType: 'Initial',
        status: 'Scheduled',
        proceedingsSummary: 'Initial hearing scheduled.',
        nextHearingDate: new Date('2026-11-20T10:00:00')
      },
      {
        case: cases[1]._id,
        judge: judges[1]._id,
        court: courts[1]._id,
        hearingDate: new Date('2026-11-18T11:00:00'),
        hearingType: 'Regular',
        status: 'Scheduled',
        proceedingsSummary: 'Regular hearing scheduled.',
        nextHearingDate: new Date('2026-11-25T11:00:00')
      }
    ]);

    console.log('Hearings created');

    // 6. Create Documents
    const documents = await Document.create([
      {
        case: cases[0]._id,
        documentTitle: 'Property Petition',
        documentType: 'Petition',
        fileUrl: 'uploads/property-petition.pdf',
        fileFormat: 'PDF',
        fileSizeKB: 250,
        uploadedBy: users[1]._id
      },
      {
        case: cases[0]._id,
        documentTitle: 'Property Evidence',
        documentType: 'Evidence',
        fileUrl: 'uploads/property-evidence.pdf',
        fileFormat: 'PDF',
        fileSizeKB: 500,
        uploadedBy: users[1]._id
      },
      {
        case: cases[1]._id,
        documentTitle: 'Contract Affidavit',
        documentType: 'Affidavit',
        fileUrl: 'uploads/contract-affidavit.pdf',
        fileFormat: 'PDF',
        fileSizeKB: 300,
        uploadedBy: users[0]._id
      }
    ]);

    console.log('Documents created');

    // 7. Initialize Case Number Counter
    await Counter.create({
      _id: 'caseNumber',
      sequenceValue: 2
    });

    console.log('Counter initialized');

    console.log('\nAll demo data imported successfully!');
    console.log({
      users: users.length,
      courts: courts.length,
      judges: judges.length,
      cases: cases.length,
      hearings: hearings.length,
      documents: documents.length
    });

  } catch (error) {
    console.error('Error importing demo data:', error.message);
    throw error;
  }
};

// Start Seeding
const startSeeding = async () => {
  try {
    await connectDB();
    await importData();
    process.exitCode = 0;
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

startSeeding();
