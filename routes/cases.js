import express from 'express';
import Case from '../models/Case.js'
import mongoose from "mongoose";
import Game from "../models/Game.js";

const router = express.Router();

//List full collection of cases
router.get('/', async (req, res) => {

    try {

        const totalItems = await Case.countDocuments().exec();
        let page = Math.abs(parseInt(req.query.page ?? '1'));
        let limit = Math.abs(parseInt(req.query.limit ?? `${totalItems}`));

        if (limit === 0) {
            limit = 1
        }

        const totalPages = Math.ceil(totalItems / limit);

        if (page > totalPages) {
            page = totalPages;
        }

        const skipAmount = (page - 1) * limit;

        const gameCases = await Case.find({})
            .skip(skipAmount)
            .limit(limit)
            .populate([
                {path: "game", select: "short_name"},
                {path: "profiles", select: "names images"},
                {path: "evidence", select: "names small_images"}
            ])
            .exec();

        const caseCollection = {

            items: gameCases,
            _links: {

                self: {
                    href: `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/cases/`
                },
                collection: {
                    href: `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/cases/`
                }

            },
            pagination: {
                currentPage: page,
                currentItems: ((limit > totalItems) ? totalItems : limit),
                totalPages: totalPages,
                totalItems: totalItems,
                _links: {
                    first: {
                        "page": 1,
                        "href": `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/cases?page=${page}&limit=${limit}`
                    },
                    last: {
                        "page": totalPages,
                        "href": `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/cases?page=${totalPages}&limit=${limit}`
                    },
                    previous: ((page === 1) ? null :{
                        "page": (page - 1),
                        "href": `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/cases?page=${page - 1}&limit=${limit}`
                    }),
                    next: ((page === totalPages) ? null :{
                        "page": (page + 1),
                        "href": `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/cases?page=${page + 1}&limit=${limit}`
                    })
                }
            }

        }

        res.status(200);
        res.json(caseCollection);

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
    if (!await Game.exists({_id: req.body.game})) {

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

});

//Options for case collection
router.options('/', (req, res) => {

    res.setHeader('Allow', "GET, POST, OPTIONS");
    res.setHeader('Access-Control-Allow-Methods', "GET, POST, OPTIONS");

    res.status(204);
    res.send();

});

//Detail middleware
//Throw a 404 early if the case doesn't exist
router.use('/:id', async (req, res, next) => {

    //Don't bother checking if method is options
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {

        if (!await Case.exists({_id: req.params.id})) {

            res.status(404);
            return res.json({error: 'Case not found'});

        }

        next();

    } catch (error) {

        res.status(500);
        res.json({error: error.message});

    }

});

//Get the details of a specific case
router.get('/:id', async (req, res) => {

    try {

        const gameCase = await Case.findById(req.params.id).populate([
            {path: "game", select: "full_name"},
            {path: "profiles"},
            {path: "evidence"}
        ]).exec();

        res.status(200);
        res.json(gameCase);

    } catch (error) {

        res.status(500);
        res.json({error: error.message});

    }

});

//Update all the fields of a specific case
router.put('/:id', async (req, res) => {

    try {

        const caseId = req.params.id;
        const postedCase = req.body;

        await Case.validate(postedCase);

        const oldCase = await Case.findById(caseId);

        //Send an error if the new name is already in use
        if (oldCase.name !== postedCase.name) {

            if (await Case.exists({name: postedCase.name})) {

                res.status(400);
                return res.json({error: 'Another case with that name already exists'});

            }

        }

        //Update the cases array in games if needed
        if (oldCase.game !== postedCase.game) {

            await Game.findByIdAndUpdate(oldCase.game, {$pull: {cases: caseId}});

            await Game.findByIdAndUpdate(postedCase.game, {$addToSet: {cases: caseId}});

        }

        Object.assign(oldCase, postedCase);

        const updatedCase = await oldCase.save();

        res.status(200);
        res.json({success: true, updatedCase: updatedCase});

    } catch (error) {

        res.status(error instanceof mongoose.Error.ValidationError ? 400 : 500);
        res.json({error: error.message});

    }

});

//Delete a specific case
router.delete('/:id', async (req, res) => {

    try {

        const gameCase = await Case.findById(req.params.id);

        await Game.findByIdAndUpdate(gameCase.game, {$pull: {cases: req.params.id}});

        await gameCase.deleteOne();

        res.status(204);
        res.send();

    } catch (error) {

        res.status(500);
        res.json({error: error.message});

    }

});

//Options for detail
router.options('/:id', (req, res) => {

    res.setHeader('Allow', "GET, PUT, DELETE, OPTIONS");
    res.setHeader('Access-Control-Allow-Methods', "GET, PUT, DELETE, OPTIONS");

    res.status(204);
    res.send();

});

export default router;