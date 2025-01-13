// Run this script once to create the demo user
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/database.js';
import User from './models/User.js';

dotenv.config({ path: './config/.env' });

const addDemoUser = async () => {
    try {
        await connectDB(process.env.CONNECTION_STRING_DB);

        await User.deleteMany({ userName: 'Guest' });

        const demoUser = new User({ 
            userName: 'Guest',
            email: 'guest@example.com',
        });
        await demoUser.save();
        // Change the demo user id in the controllers to match the id of the demo user afte this script is run
        console.log('Demo user created with ID:', demoUser._id);
        mongoose.connection.close();

        process.exit(0)
    } catch (err) {
        console.log(err);
        process.exit(1)
    }
}

addDemoUser();