import prisma from "../utils/database.js";
import { Router } from 'express';

const router = Router();

router.post('/login', async(req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({success: false, message: "Username and password are required"});
    }

    const admin = await prisma.admins.findFirst({
        where: {
            username,
            password
        }
    });

    if (!admin) {
        return res.status(404).json({success: false, message: "Admin not found"});
    }

    res.json({
        success: true,
        data: admin
    });
});

async function checkAdmin(req) {
  const auth = req.headers['authorization'];
  if (!auth) {
    return false;
  }

  const token = auth.split(' ')[1];

  const admin = await prisma.admins.findFirst({
    where: {
      token
    }
  });

  return !!admin;
}

router.get('/teams', async(req, res, next) => {
  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json({success: false, message: "Unauthorized"});
  }

  const track = req.query.track;

  const teams = await prisma.teamLogins.findMany({
    where: {
      track,
    }
  });

  res.json(teams);
});

router.post('/stop', async(req, res, next) => {
  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json({success: false, message: "Unauthorized"});
  }

  const { track } = req.body;
  const team = await prisma.teamLogins.updateMany({
    where: {
      track,
    },
    data: {
      stopped: true,
    }
  });

  res.json({success: true});
});

router.post('/start', async(req, res, next) => {
  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json({success: false, message: "Unauthorized"});
  }

  const { track } = req.body;
  const team = await prisma.teamLogins.updateMany({
    where: {
      track,
    },
    data: {
      stopped: false,
    }
  });

  res.json({success: true});
});


export default router;
