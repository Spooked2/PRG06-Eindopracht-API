import mongoose from 'mongoose';

const Case = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    evidence: [{type: mongoose.Types.ObjectId, required: true, ref: "Evidence"}],
    profiles: [{type: mongoose.Types.ObjectId, required: true, ref: "Profile"}],
    game: {type: mongoose.Types.ObjectId, required: true, ref: "Game"}
}, {

    toJSON: {

        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {

            ret._links = {

                self: {
                    href: `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/cases/${ret.id}`
                },
                collection: {
                    href: `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/cases`
                }

            }

            delete ret._id;
            delete ret.__v;

        }

    }

});

export default mongoose.model('Case', Case);