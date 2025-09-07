import prisma from "../utils/database.js";
import { Router } from 'express';
import {checkGeofence} from "../utils/helper.js";

const router = Router();

router.get('/', async(req, res, next) => {
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
        }
    });
    if (clue) {
        res.json({ success: true, data: { clue } });
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

    if (team.stopped) {
        return res.json({success: false, message: "Another team has already completed the treasure hunt. Report back to Old Mess."});
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

    const correctLocation = checkGeofence([lat, lan], clue.location);
    if (!correctLocation) {
        return res.json({success: false, message: "You are not at the correct location"});
    }

    if (team.clueno === 5) {
        return res.json({ success: true, clue: { clue: 'Welcome to Round 2! Report to Old Mess to continue.', clueno: 6 }, code: 2000 })
    }

    const nextClue = await prisma.clues.findFirst({
        where: {
            track: team.track,
            clueno: team.clueno + 1,
        }
    });

    if (!nextClue) {
        return res.json({success: true, message: "Congratulations! You have completed the treasure hunt", correctLocation});
    }

    await prisma.teamLogins.update({
        where: {
            id: team.id,
        },
        data: {
            clueno: team.clueno + 1,
        }
    });

    console.log(clue);
    res.json({success: true, clue: nextClue });
});

export default router;
