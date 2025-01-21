import mongoose from 'mongoose';
import Case from './Case.js';

const Short_description = new mongoose.Schema({
    description: {type: String, required: true}
});

const Small_image_path = new mongoose.Schema({
    path: {type: String, required: true}
});

const Cases = new mongoose.Schema({
    case: {type: mongoose.Types.ObjectId, required: true, ref: Case}
});

const Evidence = new mongoose.Schema({

    name: {type: String, required: true},
    type: {type: String, required: true},
    short_descriptions: {type: Array, required: true, ref: Short_description},
    long_descriptions: [{description: {type: String, required: true}}],
    small_image_paths: {type: Array, required: true, ref: Small_image_path},
    image_paths: [{path: {type: String, required: true}}],
    cases: {type: Array, required: true, ref: Cases}

});


export default mongoose.model('Evidence', Evidence);