import mongoose from 'mongoose';
import Evidence from './Evidence.js';
import Profile from './Profile.js';
import Game from './Game.js';

const Case = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    evidence: [Evidence],
    profile: [Profile],
    game: Game
});

export default mongoose.model('Case', Case);