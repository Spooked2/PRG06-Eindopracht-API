import express from 'express';
import mongoose from "mongoose";
import Evidence from "../models/Evidence.js";
import Case from "../models/Case.js";

const router = express.Router();

//List full collection of evidence
router.get('/', async (req, res) => {

    try {

        const totalItems = await Evidence.countDocuments().exec();
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

        const evidence = await Evidence.find({})
            .skip(skipAmount)
            .limit(limit)
            .populate("cases", "name")
            .exec();

        const evidenceCollection = {

            items: evidence,
            _links: {

                self: {
                    href: `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/evidence/`
                },
                collection: {
                    href: `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/evidence/`
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
                        "href": `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/evidence?page=${page}&limit=${limit}`
                    },
                    last: {
                        "page": totalPages,
                        "href": `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/evidence?page=${totalPages}&limit=${limit}`
                    },
                    previous: ((page === 1) ? null :{
                        "page": (page - 1),
                        "href": `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/evidence?page=${page - 1}&limit=${limit}`
                    }),
                    next: ((page === totalPages) ? null :{
                        "page": (page + 1),
                        "href": `${process.env.HOST_ADRESS}${process.env.EXPRESS_PORT}/evidence?page=${page + 1}&limit=${limit}`
                    })
                }
            }

        }

        res.status(200);
        res.json(evidenceCollection);

    } catch (error) {

        res.status(error instanceof mongoose.Error.ValidationError ? 400 : 500);
        res.json({error: error.message});

    }

});

//Create a new piece of evidence
router.post('/', async (req, res) => {

    //Collect all the case ids in the request
    let caseIds = [];

    for (const caseId of req.body.cases) {
        if (!caseIds.includes(caseId)) {
            caseIds.push(caseId);
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

    //Check the posted type so we can give a more descriptive error if needed
    //Array copied from Evidence model
    const validTypes = ["Other", "Documents", "Photographs", "Maps", "Reports", "Weapons"];

    if (!validTypes.includes(req.body.type)) {

        res.status(400);
        return res.json({error: "Given type is not valid", givenType: req.body.type, validTypes: validTypes});

    }

    try {

        const evidence = await Evidence.create({
            names: req.body.names,
            type: req.body.type,
            short_descriptions: req.body.short_descriptions,
            long_descriptions: req.body.long_descriptions,
            small_images: req.body.small_images,
            large_images: req.body.large_images,
            cases: req.body.cases
        });

        //Also save the newly created profile to the relevant cases
        for (const caseId of caseIds) {

            const gameCase = await Case.findById(caseId);

            gameCase.evidence.push(evidence);

            await gameCase.save();

        }

        res.status(201);
        res.json({success: true, evidence: evidence});

    } catch (error) {

        res.status(error instanceof mongoose.Error.ValidationError ? 400 : 500);
        res.json({error: error.message});

    }

});

//Options for evidence collection
router.options('/', (req, res) => {

    res.setHeader('Allow', "GET, POST, OPTIONS");
    res.setHeader('Access-Control-Allow-Methods', "GET, POST, OPTIONS");

    res.status(204);
    res.send();

});

//Detail middleware
//Throw a 404 early if the evidence doesn't exist
router.use('/:id', async (req, res, next) => {

    //Don't bother checking if method is options
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {

        if (!await Evidence.exists({_id: req.params.id})) {

            res.status(404);
            return res.json({error: 'Evidence not found'});

        }

        next();

    } catch (error) {

        res.status(500);
        res.json({error: error.message});

    }

});

//Get the details of a specific piece of evidence
router.get('/:id', async (req, res) => {

    try {

        const evidence = await Evidence.findById(req.params.id).populate("cases", "name");

        res.status(200);
        res.json(evidence);

    } catch (error) {

        res.status(500);
        res.json({error: error.message});

    }

});

//Update a specific piece of evidence
router.put('/:id', async (req, res) => {

    //Collect all the case ids in the request in a set to prevent duplicates
    let allCaseIds = new Set(req.body.cases);

    for (const caseId of allCaseIds) {

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

        await Evidence.validate(req.body);

        const oldEvidence = await Evidence.findById(req.params.id);
        const newCaseIds = new Set(req.body.cases);
        const oldCaseIds = new Set(oldEvidence.cases);

        const postedEvidence = req.body;
        Object.assign(oldEvidence, postedEvidence);

        const updatedEvidence = await oldEvidence.save();

        const addedCases = [...newCaseIds].filter(caseId => !oldCaseIds.has(caseId));
        const removedCases = [...oldCaseIds].filter(caseId => !newCaseIds.has(caseId));

        if (addedCases.length > 0) {

            for (const addedCase of addedCases) {

                await Case.findByIdAndUpdate(addedCase, {$addToSet: {evidence: updatedEvidence._id}});

            }

        }

        if (removedCases.length > 0) {

            for (const removedCase of removedCases) {

                await Case.findByIdAndUpdate(removedCase, {$pull: {evidence: updatedEvidence._id}});

            }

        }

        res.status(200);
        res.json({success: true, evidence: updatedEvidence});

    } catch (error) {

        res.status(error instanceof mongoose.Error.ValidationError ? 400 : 500);
        res.json({error: error.message});

    }

});

//Delete a specific piece of evidence
router.delete('/:id', async (req, res) => {

    try {

        const evidence = await Evidence.findById(req.params.id);

        const gameCases = evidence.cases;

        await Evidence.deleteOne({_id: evidence._id});

        for (const gameCase of gameCases) {
            await Case.findByIdAndUpdate(gameCase, {$pull: {evidence: evidence._id}});
        }

        res.status(204);
        res.send();

    } catch(error) {

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