import prisma from "../utils/database.js";
import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

const TOTAL_CHECKPOINTS = 5;

/*
|--------------------------------------------------------------------------
| JWT AUTH MIDDLEWARE
|--------------------------------------------------------------------------
*/

function authenticateTeam(req, res, next) {
  try {
    const auth = req.headers.authorization;

    if (!auth) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    const token = auth.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.teamId = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

/*
|--------------------------------------------------------------------------
| CHECK IF COORDINATE IS INSIDE CHECKPOINT
|--------------------------------------------------------------------------
*/

function isInsideCheckpoint(
  latitude,
  longitude,
  coordinate1,
  coordinate2,
  coordinate3,
  coordinate4
) {
  const points = [
    coordinate1,
    coordinate2,
    coordinate3,
    coordinate4,
  ].map(([lat, lng]) => ({
    lat: Number(lat),
    lng: Number(lng),
  }));

  const latitudes = points.map((point) => point.lat);
  const longitudes = points.map((point) => point.lng);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);

  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return (
    latitude >= minLat &&
    latitude <= maxLat &&
    longitude >= minLng &&
    longitude <= maxLng
  );
}

/*
|--------------------------------------------------------------------------
| GET ALL TEAMS - ADMIN/DEBUG
|--------------------------------------------------------------------------
*/

router.get("/all", async (req, res) => {
  try {
    const auth = req.query.auth;

    if (auth !== process.env.SECRET) {
      return res.status(403).json({
        success: false,
        message: "Invalid auth",
      });
    }

    const teams = await prisma.teamLogins.findMany();

    return res.json({
      success: true,
      data: teams,
    });
  } catch (error) {
    console.error("GET ALL TEAMS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch teams",
    });
  }
});

/*
|--------------------------------------------------------------------------
| TEAM LOGIN
|--------------------------------------------------------------------------
*/

router.post("/login", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Credential is required",
      });
    }

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

    const token = jwt.sign(
      {
        id: team.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    const clue = await prisma.clues.findFirst({
      where: {
        track: team.track,
        clueno: team.clueno,
      },
    });

    return res.json({
      success: true,
      data: {
        team,
        token,
        clue,
      },
    });
  } catch (error) {
    console.error("TEAM LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET CURRENT CLUE
|--------------------------------------------------------------------------
*/

router.get("/current-clue", authenticateTeam, async (req, res) => {
  try {
    const team = await prisma.teamLogins.findUnique({
      where: {
        id: req.teamId,
      },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    if (team.finished) {
      return res.json({
        success: true,
        finished: true,
        returning: false,
        message: "You have completed the game.",
        data: {
          team,
        },
      });
    }

    if (team.returning) {
      return res.json({
        success: true,
        finished: false,
        returning: true,
        message: "Return to Old Mess to complete your track.",
        data: {
          team,
        },
      });
    }

    const clue = await prisma.clues.findFirst({
      where: {
        track: team.track,
        clueno: team.clueno,
      },
    });

    if (!clue) {
      return res.status(404).json({
        success: false,
        message: "Current clue not found",
      });
    }

    return res.json({
      success: true,
      finished: false,
      returning: false,
      data: {
        team,
        clue,
      },
    });
  } catch (error) {
    console.error("GET CURRENT CLUE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch current clue",
    });
  }
});

/*
|--------------------------------------------------------------------------
| SUBMIT LOCATION
|--------------------------------------------------------------------------
*/

router.post(
  "/submit-location",
  authenticateTeam,
  async (req, res) => {
    try {
      const latitude = Number(req.body.latitude);
      const longitude = Number(req.body.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return res.status(400).json({
          success: false,
          message: "Valid latitude and longitude are required",
        });
      }

      const team = await prisma.teamLogins.findUnique({
        where: {
          id: req.teamId,
        },
      });

      if (!team) {
        return res.status(404).json({
          success: false,
          message: "Team not found",
        });
      }

      if (team.finished) {
        return res.status(400).json({
          success: false,
          message: "This track has already been completed",
        });
      }

      if (team.returning) {
        return res.status(400).json({
          success: false,
          message:
            "You have completed all checkpoints. Return to Old Mess.",
        });
      }

      const currentClue = await prisma.clues.findFirst({
        where: {
          track: team.track,
          clueno: team.clueno,
        },
        include: {
          location: true,
        },
      });

      if (!currentClue || !currentClue.location) {
        return res.status(404).json({
          success: false,
          message: "Checkpoint location not found",
        });
      }

      const correct = isInsideCheckpoint(
        latitude,
        longitude,
        currentClue.location.coordinate1,
        currentClue.location.coordinate2,
        currentClue.location.coordinate3,
        currentClue.location.coordinate4
      );

      /*
      ------------------------------------------------------------
      WRONG LOCATION
      ------------------------------------------------------------
      */

      if (!correct) {
        return res.json({
          success: true,
          correct: false,
          message:
            "The Warden remains silent. You have not yet found the gate.",
        });
      }

      /*
      ------------------------------------------------------------
      FINAL CHECKPOINT
      ------------------------------------------------------------
      */

      const isFinalCheckpoint =
        team.clueno === TOTAL_CHECKPOINTS;

      if (isFinalCheckpoint) {
        const updatedTeam = await prisma.teamLogins.update({
          where: {
            id: team.id,
          },
          data: {
            returning: true,
          },
        });

        return res.json({
          success: true,
          correct: true,
          finalCheckpoint: true,
          returningToOldMess: true,
          message:
            "The final gate opens. The truth has been revealed. Return now to where your journey began.",
          data: {
            team: updatedTeam,
            storyline: currentClue.storyline,
          },
        });
      }

      /*
      ------------------------------------------------------------
      UNLOCK NEXT CHECKPOINT
      ------------------------------------------------------------
      */

      const nextClueNo = team.clueno + 1;

      const updatedTeam = await prisma.teamLogins.update({
        where: {
          id: team.id,
        },
        data: {
          clueno: nextClueNo,
        },
      });

      const nextClue = await prisma.clues.findFirst({
        where: {
          track: team.track,
          clueno: nextClueNo,
        },
      });

      return res.json({
        success: true,
        correct: true,
        finalCheckpoint: false,
        message:
          "The gate opens. A new piece of the truth has been revealed.",
        data: {
          team: updatedTeam,

          completed: {
            storyline: currentClue.storyline,
          },

          nextClue,
        },
      });
    } catch (error) {
      console.error("SUBMIT LOCATION ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to validate location",
      });
    }
  }
);


export default router;