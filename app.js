require('dotenv').config();
const config = require('./config');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.static(__dirname+'/uploads'));
const multer = require('multer');
const form = multer();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const category = require('./routes/category');
const users = require('./routes/users');
app.use('/category', form.any(), category);
app.use('/users', form.any(), users);

app.listen(process.env.LISTEN_PORT);