import mongoose from 'mongoose';
import Case from './Case.js';

const Game = new mongoose.Schema({
    full_name: {type: String, required: true},
    short_name: {type: String, required: true},
    release_year: {type: Number, required: true},
    cases: [Case]
});

export default mongoose.model('Game', Game);