import mongoose from 'mongoose';

const Game = new mongoose.Schema({
    full_name: {type: String, required: true, unique: true},
    short_name: {type: String, required: true, unique: true},
    release_year: {type: String, required: true},
    cases: [{type: mongoose.Types.ObjectId, required: true, ref: "Case"}]
}, {

    toJSON: {

        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {

            ret._links = {

                self: {
                    href: `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/games/${ret.id}`
                },
                collection: {
                    href: `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/games`
                }

            }

            delete ret._id;
            delete ret.__v;

        }

    }

});

export default mongoose.model('Game', Game);