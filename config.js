const mongoose = require('mongoose');

function connectDB()
{
    mongoose.connect(process.env.DATABASE);
    console.log("Connection Successful"); 
}
module.exports = connectDB();