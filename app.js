import express from 'express';
import mongoose from 'mongoose';
import evidence from 'routers/evidence.js';

const app = express();

//Connect to the mongoDB database via mongoose
await mongoose.connect('mongodb://127.0.0.1:27017/pgr06-eindopdracht-api');

//Make sure the webservice knows what it can receive
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Global middleware

//Use imported routes
app.use('/evidence', evidence);