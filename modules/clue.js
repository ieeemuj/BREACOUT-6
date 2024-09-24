import prisma from "../utils/database.js";
import { Router } from 'express';

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

export default router;
