import mongoose from 'mongoose';

const ShortDescriptionsSchema = new mongoose.Schema({
    description: {type: String, required: true}
});

const SmallImagePathSchema = new mongoose.Schema({
    path: {type: String, required: true}
});

const CasesSchema = new mongoose.Schema({
    case: {type: mongoose.Types.ObjectId, required: true, ref: "Case"}
});

mongoose.model('Short_descriptions', ShortDescriptionsSchema);
mongoose.model('Small_image_path', SmallImagePathSchema);
mongoose.model('Cases', CasesSchema);

const Evidence = new mongoose.Schema({

    name: {type: String, required: true},
    type: {type: String, required: true},
    short_descriptions: {type: Array, required: true, ref: "Short_descriptions"},
    long_descriptions: [{description: {type: String, required: true}}],
    small_image_paths: {type: Array, required: true, ref: "Small_image_path"},
    image_paths: [{path: {type: String, required: true}}],
    cases: {type: Array, required: true, ref: "Cases"}

});

export default mongoose.model('Evidence', Evidence);