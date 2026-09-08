const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Models
const User = require('./models/User');
const Note = require('./models/Note');
const Discussion = require('./models/Discussion');
const Event = require('./models/Event');
const LostFound = require('./models/LostFound');

dotenv.config();

const importData = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Database already seeded');
      return;
    }

    // Clear all existing data
    await User.deleteMany();
    await Note.deleteMany();
    await Discussion.deleteMany();
    await Event.deleteMany();
    await LostFound.deleteMany();

    // Create Admin and Students
    const users = [];
    users.push({
      name: 'Admin User',
      email: 'admin@college.edu',
      password: 'password123',
      year: '4th Year',
      department: 'Computer Science',
      role: 'admin',
      bio: 'System Administrator'
    });

    const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Ananya', 'Diya', 'Sanya', 'Aaradhya', 'Pari', 'Kavya', 'Neha', 'Riya', 'Sneha', 'Tanya'];
    const lastNames = ['Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Patel', 'Das', 'Jain', 'Roy', 'Agarwal'];
    const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'];
    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

    for (let i = 0; i < 20; i++) {
      users.push({
        name: `${firstNames[i]} ${lastNames[i % 10]}`,
        email: `student${i}@college.edu`,
        password: 'password123',
        year: years[i % 4],
        department: departments[i % 5],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstNames[i]}`,
        bio: 'Passionate student learning new technologies.',
      });
    }

    const createdUsers = await User.create(users);
    const adminUser = createdUsers[0]._id;

    // Subjects and Tags
    const subjects = ['DBMS', 'Operating Systems', 'Computer Networks', 'DSA', 'AI/ML', 'Web Development'];
    
    // Create Notes
    const notes = [];
    for (let i = 0; i < 30; i++) {
      const uploader = createdUsers[Math.floor(Math.random() * 20) + 1]._id;
      const sub = subjects[i % subjects.length];
      notes.push({
        title: `Complete ${sub} Notes - Unit ${Math.floor(Math.random() * 5) + 1}`,
        description: `Detailed notes covering all important topics of ${sub}. Includes previous year questions.`,
        subject: sub,
        semester: `Semester ${Math.floor(Math.random() * 8) + 1}`,
        tags: [sub, 'Exam Prep', 'Important'],
        fileUrl: '#',
        uploadedBy: uploader,
        downloads: Math.floor(Math.random() * 500),
        upvotes: Math.floor(Math.random() * 100),
      });
    }
    await Note.insertMany(notes);

    // Create Discussions
    const discussions = [];
    for (let i = 0; i < 15; i++) {
      const author = createdUsers[Math.floor(Math.random() * 20) + 1]._id;
      discussions.push({
        title: `How to prepare for ${subjects[i % subjects.length]} placements?`,
        content: `I am looking for some guidance on preparing for ${subjects[i % subjects.length]} interviews. What are the best resources?`,
        author: author,
        tags: ['Placements', 'Guidance', subjects[i % subjects.length]],
        likes: Math.floor(Math.random() * 50),
        replies: [
          {
            content: 'I would recommend doing Leetcode regularly.',
            author: createdUsers[Math.floor(Math.random() * 20) + 1]._id
          },
          {
            content: 'Check out the standard textbooks and NPTEL lectures.',
            author: createdUsers[Math.floor(Math.random() * 20) + 1]._id
          }
        ]
      });
    }
    await Discussion.insertMany(discussions);

    // Create Events
    const events = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 30));
      events.push({
        title: `Tech Workshop on ${subjects[i % subjects.length]}`,
        description: `Join us for an exciting workshop on ${subjects[i % subjects.length]} conducted by industry experts.`,
        date: date,
        time: '14:00',
        venue: `Auditorium ${Math.floor(Math.random() * 3) + 1}`,
        organizer: adminUser,
        image: `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800`
      });
    }
    await Event.insertMany(events);

    // Create Lost and Found
    const lostFounds = [];
    const items = ['Water Bottle', 'Scientific Calculator', 'Keys', 'Umbrella', 'ID Card'];
    for (let i = 0; i < 10; i++) {
      lostFounds.push({
        itemName: items[i % items.length],
        description: `Found a ${items[i % items.length]} in the library.`,
        category: 'Electronics/Accessories',
        location: 'Central Library',
        status: i % 2 === 0 ? 'lost' : 'found',
        contactInfo: 'Please contact via email or phone 9876543210',
        postedBy: createdUsers[Math.floor(Math.random() * 20) + 1]._id
      });
    }
    await LostFound.insertMany(lostFounds);

    console.log('Data Imported!');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Note.deleteMany();
    await Discussion.deleteMany();
    await Event.deleteMany();
    await LostFound.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  if (process.argv[2] === '-d') {
    destroyData();
  } else {
    importData().then(() => process.exit());
  }
}

module.exports = { importData };
