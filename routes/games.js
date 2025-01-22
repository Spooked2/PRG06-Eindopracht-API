import express from 'express';
import mongoose from "mongoose";
import Game from '../models/Game.js';

const router = express.Router();

//List full collection of games
router.get('/', async (req, res) => {

    try {

        const games = await Game.find({}).populate("cases", "name");

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
    if (await Game.exists({full_name: req.body.full_name})) {

        res.status(400);
        return res.json({error: 'A game with that full name already exists'});

    }

    if (await Game.exists({short_name: req.body.short_name})) {
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

});

//Options for game collection
router.options('/', (req, res) => {

    res.setHeader('Allows', "GET, POST, OPTIONS");
    res.setHeader('Access-Control-Allow-Methods', "GET, POST, OPTIONS");

    res.status(204);
    res.send();

});

//Detail middleware
//Throw a 404 early if the game doesn't exist
router.use('/:id', async (req, res, next) => {

    //Don't bother checking if method is options
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {

        if (!await Game.exists({_id: req.params.id})) {

            res.status(404);
            return res.json({error: 'Game not found'});

        }

        next();

    } catch (error) {

        res.status(500);
        res.json({error: error.message});

    }

});

//Get details of a specific game
router.get('/:id', async (req, res) => {

    try {

        const game = await Game.findById(req.params.id).populate("cases", "name");

        res.status(200);
        res.json(game);

    } catch (error) {

        res.status(500);
        res.json({error: error.message});

    }

});

//Update a specific game
router.put('/:id', async (req, res) => {

    try {

        await Game.validate(req.body);

        const game = await Game.findById(req.params.id);

        //Manually fill specific fields in a new object as to prevent the cases array from being edited
        const postedGame = {
            full_name: req.body.full_name,
            short_name: req.body.short_name,
            release_year: req.body.release_year
        };

        //Checks to prevent unique key conflicts
        if (game.full_name !== postedGame.full_name) {

            if (await Game.exists({full_name: postedGame.full_name})) {

                res.status(400);
                return res.json({error: 'Another game with that full name already exists'});

            }

        }

        if (game.short_name !== postedGame.short_name) {

            if (await Game.exists({short_name: postedGame.short_name})) {

                res.status(400);
                return res.json({error: 'Another game with that short name already exists'});

            }

        }

        Object.assign(game, postedGame);

        const updatedGame = await game.save();

        res.status(200);
        res.json({success: true, updatedGame: updatedGame});

    } catch (error) {

        res.status(error instanceof mongoose.Error.ValidationError ? 400 : 500);
        res.json({error: error.message});

    }

});

//Delete a specific game
router.delete('/:id', async (req, res) => {

    try {

        await Game.findByIdAndDelete(req.params.id);

        res.status(204);
        res.send();

    } catch(error) {

        res.status(500);
        res.json({error: error.message});

    }

});

//Options for game detail
router.options('/:id', (req, res) => {

    res.setHeader('Allows', "GET, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader('Access-Control-Allow-Methods', "GET, PUT, PATCH, DELETE, OPTIONS");

    res.status(204);
    res.send();

});

export default router;