import express from 'express';
import mongoose from 'mongoose';
import evidence from './routes/evidence.js';
import cases from './routes/cases.js';
import profiles from './routes/profiles.js';
import games from './routes/games.js';

const app = express();

//Connect to the mongoDB database via mongoose
await mongoose.connect('mongodb://127.0.0.1:27017/pgr06-eindopdracht-api');

//Make sure the webservice knows what it can receive
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Global middleware
//Make sure the client is informed this webservice only sends JSON
app.use((req, res, next) => {

    //If the client did not specify it accepts JSON, send an error unless they only ask for options
    if (!req.headers.accept?.includes('application/json') && req.method !== 'OPTIONS') {

        res.status(406);
        return res.json({error: 'This webservice only responds with JSON. Please specify if you will accept this format.'})

    }

    //Otherwise just continue
    next();

});

//Add CORS headers to all responses
app.use((req, res, next) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization');

    next();

});

//Throw a 400 early if the given id isn't valid
function validateId(req, res, next) {

    if (!mongoose.Types.ObjectId.isValid(req.params.id) && req.method !== 'OPTIONS') {

        res.status(400);
        return res.json({error: "Given id is invalid"});

    }

    next();

}
app.use('/evidence/:id', validateId);
app.use('/cases/:id', validateId);
app.use('/profiles/:id', validateId);
app.use('/games/:id', validateId);

//Use imported routes
app.use('/evidence', evidence);
app.use('/cases', cases);
app.use('/profiles', profiles);
app.use('/games', games);

//Print the port to the console so we know when it's actually running
app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Server is now listening on port ${process.env.EXPRESS_PORT}`);
});
