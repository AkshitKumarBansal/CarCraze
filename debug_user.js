const mongoose = require('mongoose');
const User = require('./backend/src/models/User');
require('dotenv').config({ path: './backend/.env' });

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const userId = '69157ee00e3b3c8ec7e00ce2'; // ID from screenshot

        console.log(`Checking for User ID: ${userId}`);

        // List all users just to see
        const allUsers = await User.find({}, '_id firstName lastName email');
        console.log('--- ALL USERS ---');
        allUsers.forEach(u => {
            console.log(`${u._id}: ${u.firstName} ${u.lastName} (${u.email})`);
        });
        console.log('----------------');

        const user = await User.findById(userId);
        if (user) {
            console.log('FOUND USER:', user);
        } else {
            console.log('USER NOT FOUND');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkUser();
