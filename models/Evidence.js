import mongoose from 'mongoose';

const ShortDescriptionsSchema = new mongoose.Schema({
    description: {type: String, required: true}
});

const NamesSchema = new mongoose.Schema({
    name: {type: String, required: true}
});

const SmallImagesSchema = new mongoose.Schema({

    mime: {type: String, required: true},
    data: {type: String, required: true}

});

const CasesSchema = new mongoose.Schema({
    case: {type: mongoose.Types.ObjectId, required: true, ref: "Case"}
});

mongoose.model('Short_descriptions', ShortDescriptionsSchema);
mongoose.model('Names', NamesSchema);
mongoose.model('Small_images', SmallImagesSchema);

try {
    mongoose.model("Cases");
} catch (error) {
    mongoose.model('Cases', CasesSchema);
}

const Evidence = new mongoose.Schema({

    names: {type: Array, required: true, ref: "Names"},
    type: {type: String, required: true, enum: ["Other", "Documents", "Photographs", "Maps", "Reports", "Weapons"]},
    short_descriptions: {type: Array, required: true, ref: "Short_descriptions"},
    long_descriptions: [{description: {type: String, required: true}}],
    small_images: {type: Array, required: true, ref: "Small_images"},
    large_images: [{mime: {type: String, required: true}, data: {type: String, required: true}}],
    cases: {type: Array, required: true, ref: "Cases"}

}, {

    toJSON: {

        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {

            ret._links = {

                self: {
                    href: `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/evidence/${ret.id}`
                },
                collection: {
                    href: `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/evidence`
                }

            }

            delete ret._id;
            delete ret.__v;

        }

    }

});

export default mongoose.model('Evidence', Evidence);