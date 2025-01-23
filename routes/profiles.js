import express from 'express';
import mongoose from "mongoose";
import Profile from "../models/Profile.js";
import Case from "../models/Case.js";

const router = express.Router();

//List full collection of profiles
router.get('/', async (req, res) => {

    try {

        const profiles = await Profile.find({}).populate("case", "name").exec();

        res.status(200);
        res.json(profiles);

    } catch (error) {

        res.status(error instanceof mongoose.Error.ValidationError ? 400 : 500);
        res.json({error: error.message});

    }

});

//Create a new profile
router.post('/', async (req, res) => {

    //Collect all the case ids in the request
    let caseIds = [];

    for (const caseId of req.body.cases) {
        if (!caseIds.includes(caseId)) {
            caseIds.push(caseId);
        }
    }

    for (const description of req.body.descriptions) {
        if (!caseIds.includes(description.case)) {
            caseIds.push(description.case);
        }
    }

    for (const caseId of caseIds) {

        //Check if the given case ids are valid
        if (!mongoose.Types.ObjectId.isValid(caseId)) {

            res.status(400);
            return res.json({error: 'Given case id is invalid', invalidId: caseId});

        }

        //Make sure the given case actually exists
        if (!await Case.exists({_id: caseId})) {

            res.status(404);
            return res.json({error: 'Case could not be found', requestedCase: caseId});

        }

    }

    try {

        const profile = await Profile.create({
            names: req.body.names,
            ages: req.body.ages,
            descriptions: req.body.descriptions,
            images: req.body.images,
            cases: req.body.cases
        });

        //Also save the newly created profile to the relevant cases
        for (const caseId of caseIds) {

            const gameCase = await Case.findById(caseId);

            gameCase.profiles.push(profile);

            await gameCase.save();

        }

        res.status(201);
        res.json({success: true, profile: profile});

    } catch (error) {

        res.status(error instanceof mongoose.Error.ValidationError ? 400 : 500);
        res.json({error: error.message});

    }

});

//Options for profile collection
router.options('/', (req, res) => {

    res.setHeader('Allows', "GET, POST, OPTIONS");
    res.setHeader('Access-Control-Allow-Methods', "GET, POST, OPTIONS");

    res.status(204);
    res.send();

});

//Detail middleware
//Throw a 404 early if the profile doesn't exist
router.use('/:id', async (req, res, next) => {

    //Don't bother checking if method is options
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {

        if (!await Profile.exists({_id: req.params.id})) {

            res.status(404);
            return res.json({error: 'Profile not found'});

        }

        next();

    } catch (error) {

        res.status(500);
        res.json({error: error.message});

    }

});

//Options for detail
router.options('/:id', (req, res) => {

    res.setHeader('Allows', "GET, PUT, DELETE, OPTIONS");
    res.setHeader('Access-Control-Allow-Methods', "GET, PUT, DELETE, OPTIONS");

    res.status(204);
    res.send();

});

export default router;