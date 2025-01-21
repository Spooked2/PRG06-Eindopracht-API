import express from 'express';
import mongoose from "mongoose";
import Game from '../models/Game.js';

const router = express.Router();

//List full collection of games
router.get('/', async (req, res) => {

    try {

        const games = await Game.find({});

        res.status(200);
        res.json(games);

    } catch (error) {

        res.status(error instanceof mongoose.Error.ValidationError ? 400 : 500);
        res.json({error: error.message});

    }

});

//Create a new game
router.post('/', async (req, res) => {

    //Prevent the post from happening if the short and long names already exist
    if (Game.exists({long_name: req.body.long_name})) {

        res.status(400);
        return res.json({error: 'A game with that long name already exists'});

    }

    if (Game.exists({short_name: req.body.short_name})) {
        res.status(400);
        return res.json({error: 'A game with that short name already exists'});
    }

    try {

        const newGame = await Game.create({
            full_name: req.body.full_name,
            short_name: req.body.short_name,
            release_year: req.body.release_year,
            cases: req.body.cases
        });

        res.status(201);
        res.json({success: true, game: newGame})

    } catch (error) {

        res.status(error instanceof mongoose.Error.ValidationError ? 400 : 500);
        res.json({error: error.message});

    }

})

//Options for game collection

export default router;