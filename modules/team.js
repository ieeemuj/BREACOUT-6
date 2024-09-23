import prisma from "../utils/database.js";
import { Router } from 'express';
import jwt from "jsonwebtoken";

const router = Router();

router.get('/all', async (req, res) => {
    const teams = await prisma.teamLogins.findMany();
    res.json(teams);
});

router.post('/new', async (req, res) => {
    const { name, credential, track } = req.body;
    const team = await prisma.teamLogins.create({
        data: {
            name,
            track,
            credential
        }
    });
    res.json(team);
});

router.post('/login', async (req, res) => {
    const { credential } = req.body;
    const team = await prisma.teamLogins.findFirst({
        where: {
            credential
        }
    });
    const token = jwt.sign({ id: team.id }, process.env.JWT_SECRET);
    if (team) {
        res.json({
          success: true,
          data: { team, token },
        });
    } else {
        res.status(404).json({success: false, message: "Team not found"});
    }
});

export default router;
