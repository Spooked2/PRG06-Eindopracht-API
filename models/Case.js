import mongoose from 'mongoose';
import Evidence from './Evidence.js';

const Case = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    evidence: {type: Array, required: true}
});

export default Case;