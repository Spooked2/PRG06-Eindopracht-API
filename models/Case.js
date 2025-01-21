import mongoose from 'mongoose';

const Case = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    evidence: [{type: mongoose.Types.ObjectId, required: true, ref: "Evidence"}],
    profiles: [{type: mongoose.Types.ObjectId, required: true, ref: "Profile"}],
    game: {type: mongoose.Types.ObjectId, required: true, ref: "Game"}
});

export default mongoose.model('Case', Case);