import express from 'express';
import Case from '../models/Case.js'
import mongoose from "mongoose";
import Game from "../models/Game.js";

const router = express.Router();

//List full collection of cases
router.get('/', async (req, res) => {

    try {

        const cases = await Case.find({}).populate("name", "name").exec();

        res.status(200);
        res.json(cases);

    } catch (error) {

        res.status(error instanceof mongoose.Error.ValidationError ? 400 : 500);
        res.json({error: error.message});

    }

});

//Create a new case
router.post('/', async (req, res) => {

    //Prevent the post from happening if a case with the same name already exists
    if (await Case.exists({name: req.body.name})) {

        res.status(400);
        return res.json({error: 'A case with that name already exists'});

    }

    //Check if the given game id is valid
    if (!mongoose.Types.ObjectId.isValid(req.body.game)) {

        res.status(400);
        return res.json({error: 'Given game id is invalid'});

    }

    //Make sure the given game actually exists
    if (! await Game.exists({_id: req.body.game})) {

        res.status(404);
        return res.json({error: 'Game could not be found'});

    }

    try {

        const newCase = await Case.create({
            name: req.body.name,
            evidence: req.body.evidence,
            profiles: req.body.profiles,
            game: req.body.game
        });

        //Also save the newly created case to the game
        const game = await Game.findById(req.body.game);
        game.cases.push(newCase);

        await game.save();

        res.status(201);
        res.json({success: true, case: newCase})

    } catch (error) {

        res.status(error instanceof mongoose.Error.ValidationError ? 400 : 500);
        res.json({error: error.message});

    }

})

//Options for case collection

export default router;