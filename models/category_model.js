const mongoose = require('mongoose');

const Schemas = new mongoose.Schema({
    id:{type:String, required:true},
    name: {type:String, required:true},
    isActive:{type:Boolean, required:true},
    count:{type:Number, required:true},
    created_at:{type:Date, required:true},
    updated_at:{type:Date},
},{versionKey:false});

const Models = new mongoose.model('categories', Schemas);
module.exports = Models; 