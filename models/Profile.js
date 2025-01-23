import mongoose from 'mongoose';

const DescriptionsSchema = new mongoose.Schema({
    text: {type: String, required: true},
    case: {type: mongoose.Types.ObjectId, required: true, ref: "Case"}
});

const CasesSchema = new mongoose.Schema({
    case: {type: mongoose.Types.ObjectId, required: true, ref: "Case"}
});

mongoose.model('Descriptions', DescriptionsSchema);

try {
    mongoose.model('Cases', CasesSchema);
} catch (error) {
    console.error(error.message);
}

const Profile = new mongoose.Schema({

    names: [{type: String, required: true}],
    ages: [{type: String, required: true}],
    descriptions: {type: Array, required: true, ref: "Descriptions"},
    images: [{mime: {type: String, required: true}, data: {type: String, required: true}}],
    cases: {type: Array, required: true, ref: "Cases"}

});

export default mongoose.model('Profile', Profile);