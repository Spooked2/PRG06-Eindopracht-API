import mongoose from 'mongoose';
import Case from './Case.js';

const Description = new mongoose.Schema({
    description: {type: String, required: true}
});

const Cases = new mongoose.Schema({
    case: {type: mongoose.Types.ObjectId, required: true, ref: Case}
});

const Profile = new mongoose.Schema({

    names: [{type: String, required: true}],
    ages: [{type: Number, required: true}],
    descriptions: {type: Array, required: true, ref: Description},
    image_paths: [{type: String, required: true}],
    cases: {type: Array, required: true, ref: Cases}

});

export default mongoose.model('Profile', Profile)