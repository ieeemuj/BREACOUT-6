import prisma from "../utils/database.js";
import { Router } from "express";
import { checkGeofence } from "../utils/helper.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| FINAL MESSAGES
|--------------------------------------------------------------------------
|
| All tracks eventually report to the same final location.
| You can change this text later without changing the logic.
|
*/

const FINAL_MESSAGES = {
  "1": {
    title: "Path A: The Citadel",
    message:
      "You have completed Path A: The Citadel. Report immediately to the final gathering point. The first four teams to arrive will qualify for the next round.",
  },

  "2": {
    title: "Path B: The Sovereign",
    message:
      "You have completed Path B: The Sovereign. Report immediately to the final gathering point. The first four teams to arrive will qualify for the next round.",
  },

  "3": {
    title: "Path C: The Nexus",
    message:
      "You have completed Path C: The Nexus. Report immediately to the final gathering point. The first four teams to arrive will qualify for the next round.",
  },

  "4": {
    title: "Path D: The Frontier",
    message:
      "You have completed Path D: The Frontier. Report immediately to the final gathering point. The first four teams to arrive will qualify for the next round.",
  },
};

/*
|--------------------------------------------------------------------------
| GET CURRENT CLUE
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
  try {
    const team = await prisma.teamLogins.findUnique({
      where: {
        id: req.team.id,
      },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | TEAM HAS ALREADY COMPLETED THE HUNT
    |--------------------------------------------------------------------------
    */

    if (team.finished) {
      const finalInfo = FINAL_MESSAGES[team.track] || {
        title: "Path Completed",
        message:
          "You have completed your path. Report to the final gathering point.",
      };

      return res.json({
        success: true,
        completed: true,
        code: 2000,
        message: finalInfo.message,
        data: {
          finished: true,
          qualified: team.qualified,
          finalTitle: finalInfo.title,
          finalMessage: finalInfo.message,
        },
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET CURRENT CLUE
    |--------------------------------------------------------------------------
    */

    const clue = await prisma.clues.findFirst({
      where: {
        track: team.track,
        clueno: team.clueno,
      },
      orderBy: {
        clueno: "asc",
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
      completed: false,
      code: 1001,
      data: {
        clue,
        finished: false,
        qualified: false,
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
| CHECK LOCATION AND UNLOCK NEXT CLUE
|--------------------------------------------------------------------------
*/

router.post("/submit", async (req, res) => {
  try {
    const { lat, lng } = req.body;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE GPS COORDINATES
    |--------------------------------------------------------------------------
    */

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude) ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET TEAM
    |--------------------------------------------------------------------------
    */

    const team = await prisma.teamLogins.findUnique({
      where: {
        id: req.team.id,
      },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | TEAM ALREADY FINISHED
    |--------------------------------------------------------------------------
    */

    if (team.finished) {
      const finalInfo = FINAL_MESSAGES[team.track] || {
        title: "Path Completed",
        message:
          "You have already completed your path. Report to the final gathering point.",
      };

      return res.json({
        success: true,
        completed: true,
        code: 2000,
        message: finalInfo.message,
        data: {
          finished: true,
          qualified: team.qualified,
          finalTitle: finalInfo.title,
          finalMessage: finalInfo.message,
        },
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET CURRENT CLUE + FOUR CORNER GEOFENCE
    |--------------------------------------------------------------------------
    */

    const currentClue = await prisma.clues.findFirst({
      where: {
        track: team.track,
        clueno: team.clueno,
      },
      include: {
        location: true,
      },
    });

    if (!currentClue) {
      return res.status(404).json({
        success: false,
        message: "Current clue not found",
      });
    }

    if (!currentClue.location) {
      return res.status(500).json({
        success: false,
        message: "Location data is missing for this clue",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK RECTANGLE / GEOFENCE
    |--------------------------------------------------------------------------
    */

    const correctLocation = checkGeofence(
      [latitude, longitude],
      currentClue.location
    );

    if (!correctLocation) {
      return res.json({
        success: false,
        completed: false,
        message: "You are not at the correct location.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND NEXT CLUE
    |--------------------------------------------------------------------------
    |
    | No hardcoded clue count.
    | Finds the next highest clue number for this team's track.
    |
    */

    const nextClue = await prisma.clues.findFirst({
      where: {
        track: team.track,
        clueno: {
          gt: team.clueno,
        },
      },
      orderBy: {
        clueno: "asc",
      },
    });

    /*
    |--------------------------------------------------------------------------
    | NO NEXT CLUE = PATH COMPLETE
    |--------------------------------------------------------------------------
    */

    if (!nextClue) {
      const now = new Date();

      /*
      |--------------------------------------------------------------------------
      | DETERMINE QUALIFICATION
      |--------------------------------------------------------------------------
      |
      | First 4 teams to finish the overall hunt qualify.
      |
      */

      const qualifiedCount = await prisma.teamLogins.count({
        where: {
          qualified: true,
        },
      });

      const shouldQualify = qualifiedCount < 4;

      /*
      |--------------------------------------------------------------------------
      | MARK TEAM AS FINISHED
      |--------------------------------------------------------------------------
      */

      const updatedTeam = await prisma.teamLogins.update({
        where: {
          id: team.id,
        },
        data: {
          finished: true,
          finishedAt: now,
          qualified: shouldQualify,
        },
      });

      const finalInfo = FINAL_MESSAGES[team.track] || {
        title: "Path Completed",
        message:
          "You have completed your path. Report to the final gathering point.",
      };

      return res.json({
        success: true,
        completed: true,
        code: 2000,
        message: shouldQualify
          ? `${finalInfo.message} You are currently among the first four finishers!`
          : finalInfo.message,
        data: {
          finished: true,
          qualified: updatedTeam.qualified,
          finalTitle: finalInfo.title,
          finalMessage: finalInfo.message,
          finishedAt: updatedTeam.finishedAt,
        },
      });
    }

    /*
    |--------------------------------------------------------------------------
    | UNLOCK NEXT STORYLINE + CLUE
    |--------------------------------------------------------------------------
    */

    await prisma.teamLogins.update({
      where: {
        id: team.id,
      },
      data: {
        clueno: nextClue.clueno,
      },
    });

    return res.json({
      success: true,
      completed: false,
      message: "Correct location! The next part of your journey has been unlocked.",
      data: {
        clue: nextClue,
        finished: false,
        qualified: false,
      },
    });
  } catch (error) {
    console.error("CHECK LOCATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while checking your location",
    });
  }
});

export default router;