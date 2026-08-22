import prisma from "../utils/database.js";
import { Router } from "express";

const router = Router();

const VALID_TRACKS = ["1", "2", "3", "4"];

/*
|--------------------------------------------------------------------------
| GENERATE TEAM CREDENTIAL
|--------------------------------------------------------------------------
*/

function generateCredential() {
  return Math.random().toString(36).substring(2, 10);
}

/*
|--------------------------------------------------------------------------
| CHECK ADMIN AUTHORIZATION
|--------------------------------------------------------------------------
*/

async function checkAdmin(req) {
  try {
    const auth = req.headers["authorization"];

    if (!auth) {
      return false;
    }

    const parts = auth.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return false;
    }

    const token = parts[1];

    if (!token) {
      return false;
    }

    const admin = await prisma.admins.findFirst({
      where: {
        token,
      },
    });

    return !!admin;
  } catch (error) {
    console.error("ADMIN AUTH ERROR:", error);
    return false;
  }
}

/*
|--------------------------------------------------------------------------
| ADMIN LOGIN
|--------------------------------------------------------------------------
*/

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const admin = await prisma.admins.findFirst({
      where: {
        username,
        password,
      },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    return res.json({
      success: true,
      data: {
        id: admin.id,
        username: admin.username,
        token: admin.token,
      },
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to log in",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET TEAMS
|--------------------------------------------------------------------------
*/

router.get("/teams", async (req, res) => {
  try {
    const admin = await checkAdmin(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const track = req.query.track;

    /*
    | If no track is provided, return all teams.
    */

    const where = track
      ? { track: String(track) }
      : {};

    const teams = await prisma.teamLogins.findMany({
      where,
      orderBy: [
        {
          track: "asc",
        },
        {
          name: "asc",
        },
      ],
    });

    return res.json({
      success: true,
      data: teams,
    });
  } catch (error) {
    console.error("GET TEAMS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch teams",
    });
  }
});

/*
|--------------------------------------------------------------------------
| STOP A TRACK
|--------------------------------------------------------------------------
*/

router.post("/stop", async (req, res) => {
  try {
    const admin = await checkAdmin(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const track = String(req.body.track || "");

    if (!VALID_TRACKS.includes(track)) {
      return res.status(400).json({
        success: false,
        message: "Invalid track",
      });
    }

    const result = await prisma.teamLogins.updateMany({
      where: {
        track,
      },
      data: {
        stopped: true,
      },
    });

    return res.json({
      success: true,
      message: `Track ${track} has been stopped`,
      updated: result.count,
    });
  } catch (error) {
    console.error("STOP TRACK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to stop track",
    });
  }
});

/*
|--------------------------------------------------------------------------
| START A TRACK
|--------------------------------------------------------------------------
*/

router.post("/start", async (req, res) => {
  try {
    const admin = await checkAdmin(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const track = String(req.body.track || "");

    if (!VALID_TRACKS.includes(track)) {
      return res.status(400).json({
        success: false,
        message: "Invalid track",
      });
    }

    const result = await prisma.teamLogins.updateMany({
      where: {
        track,
      },
      data: {
        stopped: false,
      },
    });

    return res.json({
      success: true,
      message: `Track ${track} has been started`,
      updated: result.count,
    });
  } catch (error) {
    console.error("START TRACK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start track",
    });
  }
});

/*
|--------------------------------------------------------------------------
| CREATE NEW TEAM
|--------------------------------------------------------------------------
*/

router.post("/new", async (req, res) => {
  try {
    const admin = await checkAdmin(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const track = String(req.body.track || "");
    const name = String(req.body.name || "").trim();

    if (!track || !name) {
      return res.status(400).json({
        success: false,
        message: "Track and name are required",
      });
    }

    if (!VALID_TRACKS.includes(track)) {
      return res.status(400).json({
        success: false,
        message: "Invalid track. Track must be 1, 2, 3, or 4.",
      });
    }

    /*
    | Generate a credential and make sure it doesn't already exist.
    */

    let credential;
    let existingCredential;

    do {
      credential = generateCredential();

      existingCredential = await prisma.teamLogins.findUnique({
        where: {
          credential,
        },
      });
    } while (existingCredential);

    const team = await prisma.teamLogins.create({
      data: {
        track,
        name,
        credential,
        clueno: 1,
        stopped: false,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: {
        team,
      },
    });
  } catch (error) {
    console.error("CREATE TEAM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create team",
    });
  }
});

/*
|--------------------------------------------------------------------------
| CREATE NEW CLUE
|--------------------------------------------------------------------------
|
| Each clue receives exactly four GPS points.
| These four points define the geofence polygon.
|
*/

router.post("/clue", async (req, res) => {
  try {
    const admin = await checkAdmin(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      track,
      clueno,
      clue,
      name,
      co1,
      co2,
      co3,
      co4,
    } = req.body;

    const normalizedTrack = String(track || "");
    const normalizedClueNo = Number(clueno);

    /*
    | Validate basic fields
    */

    if (
      !normalizedTrack ||
      !normalizedClueNo ||
      !clue ||
      !co1 ||
      !co2 ||
      !co3 ||
      !co4
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Track, clueno, clue and all four location points are required",
      });
    }

    if (!VALID_TRACKS.includes(normalizedTrack)) {
      return res.status(400).json({
        success: false,
        message: "Invalid track. Track must be 1, 2, 3, or 4.",
      });
    }

    if (
      !Array.isArray(co1) ||
      !Array.isArray(co2) ||
      !Array.isArray(co3) ||
      !Array.isArray(co4) ||
      co1.length !== 2 ||
      co2.length !== 2 ||
      co3.length !== 2 ||
      co4.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Each location point must contain exactly [latitude, longitude]",
      });
    }

    /*
    | Convert all coordinates to strings for the PostgreSQL String[] columns.
    */

    const coordinate1 = co1.map((value) => String(value));
    const coordinate2 = co2.map((value) => String(value));
    const coordinate3 = co3.map((value) => String(value));
    const coordinate4 = co4.map((value) => String(value));

    /*
    | Prevent duplicate clue numbers within the same track.
    */

    const existingClue = await prisma.clues.findFirst({
      where: {
        track: normalizedTrack,
        clueno: normalizedClueNo,
      },
    });

    if (existingClue) {
      return res.status(409).json({
        success: false,
        message: `Clue ${normalizedClueNo} already exists for Track ${normalizedTrack}`,
      });
    }

    /*
    | Create clue and its geolocation together.
    */

    const newClue = await prisma.clues.create({
      data: {
        track: normalizedTrack,
        clueno: normalizedClueNo,
        clue: String(clue).trim(),
        name:
          name && String(name).trim()
            ? String(name).trim()
            : `Track ${normalizedTrack} - Checkpoint ${normalizedClueNo}`,

        location: {
          create: {
            coordinate1,
            coordinate2,
            coordinate3,
            coordinate4,
          },
        },
      },

      include: {
        location: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Checkpoint created successfully",
      data: newClue,
    });
  } catch (error) {
    console.error("CREATE CLUE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create checkpoint",
    });
  }
});

export default router;