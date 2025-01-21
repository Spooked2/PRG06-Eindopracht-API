import mongoose from 'mongoose';

const Game = new mongoose.Schema({
    full_name: {type: String, required: true},
    short_name: {type: String, required: true},
    release_year: {type: Number, required: true},
    cases: [{type: mongoose.Types.ObjectId, required: true, ref: "Case"}]
});

export default mongoose.model('Game', Game);