import prisma from "../utils/database.js";
import { Router } from "express";
import { checkGeofence } from "../utils/helper.js";

const router = Router();

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
      completed: false,
      data: {
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
| CHECK LOCATION AND UNLOCK NEXT CLUE
|--------------------------------------------------------------------------
*/

router.post("/submit", async (req, res) => {
  try {
    const { lat, lan } = req.body;

    // Allow 0 as a valid coordinate, so don't use !lat / !lan
    if (lat === undefined || lan === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const latitude = Number(lat);
    const longitude = Number(lan);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
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

    if (team.stopped) {
      return res.json({
        success: false,
        completed: true,
        message: "This team has already completed the treasure hunt.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET CURRENT CLUE AND ITS FOUR-POINT GEOFENCE
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
    | CHECK IF TEAM IS INSIDE THE FOUR-POINT GEOFENCE
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
        message: "You are not at the correct location",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND THE NEXT AVAILABLE CLUE FOR THIS TRACK
    |
    | No hardcoded clue numbers.
    | It simply finds the next clue in the database.
    |--------------------------------------------------------------------------
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
    | IF THERE IS NO NEXT CLUE, THE HUNT IS COMPLETE
    |--------------------------------------------------------------------------
    */

    if (!nextClue) {
      await prisma.teamLogins.update({
        where: {
          id: team.id,
        },
        data: {
          stopped: true,
        },
      });

      return res.json({
        success: true,
        completed: true,
        message: "Congratulations! You have completed all checkpoints.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | UNLOCK THE NEXT CLUE
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

    /*
    |--------------------------------------------------------------------------
    | RETURN NEXT CLUE
    |--------------------------------------------------------------------------
    */

    return res.json({
      success: true,
      completed: false,
      message: "Correct location! Next checkpoint unlocked.",
      clue: nextClue,
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