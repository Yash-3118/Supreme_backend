const mongoose = require('mongoose');

const Schemas = new mongoose.Schema({
    id:{type:String, required:true},
    firstName: {type:String, required:true},
    lastName: {type:String, required:true},
    email: {type:String, required:true},
    mobileNumber: {type:String, required:true},
    address: {type:String, required:true},
    city: {type:String, required:true},
    state: {type:String, required:true},
    pincode: {type:String, required:true},
    country: {type:String, required:true},
    password: {type:String, required:true},
    password_string: {type:String, required:true},
    isActive:{type:Boolean, required:true},
    count:{type:Number, required:true},
    created_at:{type:Date, required:true},
    updated_at:{type:Date},
},{versionKey:false});

const Models = new mongoose.model('users', Schemas);
module.exports = Models; 