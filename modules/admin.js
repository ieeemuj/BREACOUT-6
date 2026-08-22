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

    const where = track
      ? {
        track: String(track),
      }
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
    |--------------------------------------------------------------------------
    | Generate unique credential
    |--------------------------------------------------------------------------
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
        finished: false,
        qualified: false,
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
| Each clue has:
| - Track
| - Clue number
| - Checkpoint name
| - Storyline
| - Clue
| - Four GPS corner points
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
      name,
      storyline,
      clue,
      co1,
      co2,
      co3,
      co4,
    } = req.body;

    const normalizedTrack = String(track || "").trim();
    const normalizedClueNo = Number(clueno);
    const normalizedName = String(name || "").trim();
    const normalizedStoryline = String(storyline || "").trim();
    const normalizedClue = String(clue || "").trim();

    /*
    |--------------------------------------------------------------------------
    | Validate required fields
    |--------------------------------------------------------------------------
    */

    if (!normalizedTrack) {
      return res.status(400).json({
        success: false,
        message: "Track is required",
      });
    }

    if (
      !Number.isInteger(normalizedClueNo) ||
      normalizedClueNo < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Clue number must be a valid number greater than 0",
      });
    }

    if (!normalizedStoryline) {
      return res.status(400).json({
        success: false,
        message: "Storyline is required",
      });
    }

    if (!normalizedClue) {
      return res.status(400).json({
        success: false,
        message: "Clue text is required",
      });
    }

    if (!VALID_TRACKS.includes(normalizedTrack)) {
      return res.status(400).json({
        success: false,
        message: "Invalid track. Track must be 1, 2, 3, or 4.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate all four GPS points
    |--------------------------------------------------------------------------
    */

    const points = [co1, co2, co3, co4];

    for (const point of points) {
      if (
        !Array.isArray(point) ||
        point.length !== 2 ||
        !Number.isFinite(Number(point[0])) ||
        !Number.isFinite(Number(point[1]))
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each GPS point must contain valid [latitude, longitude] values",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Validate latitude and longitude ranges
    |--------------------------------------------------------------------------
    */

    for (const point of points) {
      const lat = Number(point[0]);
      const lng = Number(point[1]);

      if (lat < -90 || lat > 90) {
        return res.status(400).json({
          success: false,
          message: "Latitude must be between -90 and 90",
        });
      }

      if (lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          message: "Longitude must be between -180 and 180",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Convert coordinates to String[]
    |--------------------------------------------------------------------------
    */

    const coordinate1 = co1.map((value) => String(value));
    const coordinate2 = co2.map((value) => String(value));
    const coordinate3 = co3.map((value) => String(value));
    const coordinate4 = co4.map((value) => String(value));

    /*
    |--------------------------------------------------------------------------
    | Prevent duplicate clue numbers within same track
    |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | Create clue and geofence
    |--------------------------------------------------------------------------
    */

    const newClue = await prisma.clues.create({
      data: {
        track: normalizedTrack,
        clueno: normalizedClueNo,
        storyline: String(storyline).trim(),
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
      message: "Clue created successfully",
      data: newClue,
    });
  } catch (error) {
    console.error("CREATE CLUE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create clue",
    });
  }
});


/*
|--------------------------------------------------------------------------
| FINISH TEAM AT OLD MESS
|--------------------------------------------------------------------------
|
| Called by an organizer after the team physically returns to Old Mess.
| The first team to finish each track qualifies for Round 2.
|
*/

router.post("/finish-team", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Team credential is required",
      });
    }

    // Find the team
    const team = await prisma.teamLogins.findFirst({
      where: {
        credential,
      },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Team must have completed all 5 checkpoints first
    if (!team.returning) {
      return res.status(400).json({
        success: false,
        message:
          "This team has not completed the final checkpoint yet.",
      });
    }

    // Prevent finishing twice
    if (team.finished) {
      return res.status(400).json({
        success: false,
        message: "This team has already finished.",
      });
    }

    /*
    --------------------------------------------------------------
    CHECK IF SOMEONE FROM THIS TRACK ALREADY QUALIFIED
    --------------------------------------------------------------
    */

    const alreadyQualified = await prisma.teamLogins.findFirst({
      where: {
        track: team.track,
        qualified: true,
      },
      orderBy: {
        finishedAt: "asc",
      },
    });

    const qualifies = !alreadyQualified;

    /*
    --------------------------------------------------------------
    FINISH THE TEAM
    --------------------------------------------------------------
    */

    const finishedTeam = await prisma.teamLogins.update({
      where: {
        id: team.id,
      },
      data: {
        finished: true,
        finishedAt: new Date(),
        qualified: qualifies,
      },
    });

    return res.json({
      success: true,
      message: qualifies
        ? "Team finished first on this track and QUALIFIED for Round 2!"
        : "Team has successfully completed Round 1.",
      data: {
        team: finishedTeam,
        qualified: qualifies,
      },
    });
  } catch (error) {
    console.error("FINISH TEAM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to finish team",
    });
  }
});


/*
|--------------------------------------------------------------------------
| FINISH TEAM AT OLD MESS
|--------------------------------------------------------------------------
|
| Called by an organizer after the team physically returns to Old Mess.
| The first team to finish each track qualifies for Round 2.
|
*/

router.post("/finish-team", async (req, res) => {
  try {
    const admin = await checkAdmin(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Team credential is required",
      });
    }

    // Find the team
    const team = await prisma.teamLogins.findFirst({
      where: {
        credential,
      },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Team must have completed all checkpoints first
    if (!team.returning) {
      return res.status(400).json({
        success: false,
        message:
          "This team has not completed the final checkpoint yet.",
      });
    }

    // Prevent finishing twice
    if (team.finished) {
      return res.status(400).json({
        success: false,
        message: "This team has already finished.",
      });
    }

    // Check whether a team from this track already qualified
    const alreadyQualified = await prisma.teamLogins.findFirst({
      where: {
        track: team.track,
        qualified: true,
      },
    });

    // Only the first team on this track qualifies
    const qualifies = !alreadyQualified;

    // Mark team as finished
    const finishedTeam = await prisma.teamLogins.update({
      where: {
        id: team.id,
      },
      data: {
        finished: true,
        finishedAt: new Date(),
        qualified: qualifies,
      },
    });

    return res.json({
      success: true,
      message: qualifies
        ? "Team finished first on this track and QUALIFIED for Round 2!"
        : "Team has successfully completed Round 1.",
      data: {
        team: finishedTeam,
        qualified: qualifies,
      },
    });
  } catch (error) {
    console.error("FINISH TEAM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to finish team",
    });
  }
});


export default router;