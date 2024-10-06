import prisma from "../utils/database.js";
import { Router } from 'express';

const router = Router();

function generateCredential() {
  // generate a random 8 character string
  return Math.random().toString(36).substring(2, 10);
}

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
      track: track,
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
      track: track,
    },
    data: {
      stopped: false,
    }
  });

  res.json({success: true});
});

router.post('/new', async(req, res, next) => {
  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json({success: false, message: "Unauthorized"});
  }

  const { track, name } = req.body;
  if (!track || !name) {
    return res.status(400).json({success: false, message: "Track and name are required"});
  }

  if (!["gr", "hu", "re", "sl"].includes(track)) {
    return res.status(400).json({success: false, message: "Invalid track"});
  }
  const credential = generateCredential();
  const team = await prisma.teamLogins.create({
    data: {
      track,
      name,
      credential,
    }
  });

  res.json({success: true, data: { team }});
});

router.post('/clue', async(req, res, next) => {
  const admin = await checkAdmin(req);
  if (!admin) {
    return res.status(401).json({success: false, message: "Unauthorized"});
  }

  const { track, clueno, clue, co1, co2, co3, co4 } = req.body;
  if (!track || !clueno || !clue) {
    return res.status(400).json({success: false, message: "Track, clueno and clue are required"});
  }

  const coordinate1 = co1.map(x => x.toString());
  const coordinate2 = co2.map(x => x.toString());
  const coordinate3 = co3.map(x => x.toString());
  const coordinate4 = co4.map(x => x.toString());

  const geolocation = await prisma.geolocations.create({
    data: {
      coordinate1,
      coordinate2,
      coordinate3,
      coordinate4,
    }
  });

  const newClue = await prisma.clues.create({
    data: {
      track,
      clueno,
      clue,
      location: {
        connect: {
          id: geolocation.id
        }
      }
    }
  });

  res.json({success: true, data: { clue: newClue, geolocation }});
});

export default router;
