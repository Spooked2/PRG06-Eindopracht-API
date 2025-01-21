import express from 'express';
import Case from '../models/Case.js'
import mongoose from "mongoose";

const router = express.Router();

//List full collection of cases
router.get('/', async (req, res) => {

    try {

        const cases = await Case.find({});

        res.status(200);
        res.json(cases);

    } catch (error) {

        res.status(error instanceof mongoose.Error.ValidationError ? 400 : 500);
        res.json({error: error.message})

    }

})

export default router;