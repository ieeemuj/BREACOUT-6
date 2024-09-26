import prisma from "../utils/database.js";
import { Router } from 'express';
import {checkGeofence} from "../utils/helper.js";

const router = Router();

router.get('/', async(req, res, next) => {
    const team = await prisma.team.findFirst({
        where: {
            id: req.team.id
        }
    });

    if (!team) {
        res.status(404).json({success: false, message: "Team not found"});
    }

    const clue = await prisma.clues.findFirst({
        where: {
            track: team.track,
            clueno: team.clueno,
        }
    });
    if (clue) {
        res.json(clue);
    } else {
        res.status(404).json({success: false, message: "Clue not found"});
    }
});

router.post('/submit', async(req, res, next) => {
    const { lat, lan } = req.body;

    if (!lat || !lan) {
        return res.status(400).json({success: false, message: "Latitude and longitude are required"});
    }

    const team = await prisma.teamLogins.findFirst({
        where: {
            id: req.team.id
        }
    });

    if (!team) {
        res.status(404).json({success: false, message: "Team not found"});
    }

    const clue = await prisma.clues.findFirst({
        where: {
            track: team.track,
            clueno: team.clueno,
        },
        include: {
            location: true,
        }
    });

    if (!clue) {
        return res.status(404).json({success: false, message: "Clue not found"});
    }

    const correctLocation = checkGeofence(clue.location, {lat, lan});
    // if (!correctLocation) {
    //     return res.json({success: false, message: "You are not at the correct location"});
    // }

    const nextClue = await prisma.clues.findFirst({
        where: {
            track: team.track,
            clueno: team.clueno + 1,
        }
    });

    if (!nextClue) {
        return res.json({success: true, message: "Congratulations! You have completed the treasure hunt"});
    }

    console.log(clue);
    res.json({success: true, message: "Correct location", clue});
});

export default router;
