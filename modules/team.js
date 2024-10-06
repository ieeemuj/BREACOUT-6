import prisma from "../utils/database.js";
import { Router } from 'express';
import jwt from "jsonwebtoken";

const router = Router();

router.get('/all', async (req, res) => {
    const auth = req.query.auth;
    if (auth !== process.env.SECRET) {
        return res.status(403).json({success: false, message: "Invalid auth"});
    }
    const teams = await prisma.teamLogins.findMany();
    res.json(teams);
});

router.post('/login', async (req, res) => {
    const { credential } = req.body;
    if (!credential) {
        return res.status(400).json({success: false, message: "Credential is required"});
    }

    const team = await prisma.teamLogins.findFirst({
        where: {
            credential
        }
    });
    if (!team) {
        return res.status(404).json({success: false, message: "Team not found"});
    }

    const token = jwt.sign({ id: team.id }, process.env.JWT_SECRET);
    const clue = await prisma.clues.findFirst({
        where: {
            track: team.track,
            clueno: team.clueno
        },
    });
    console.log(clue);
    if (team) {
        res.json({
          success: true,
          data: { team, token, clue },
        });
    } else {
        res.status(404).json({success: false, message: "Team not found"});
    }
});

export default router;
