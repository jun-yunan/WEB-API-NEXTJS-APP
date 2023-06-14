const mongoose = require('mongoose');
require('dotenv').config();

async function connect() {
    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };

        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log('Connected to the database successfully!');
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
    }
}

module.exports = { connect };
