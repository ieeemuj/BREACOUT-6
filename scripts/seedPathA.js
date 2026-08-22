import prisma from "../utils/database.js";

const TRACK = "1";

const checkpoints = [
  {
    clueno: 1,
    name: "Checkpoint 1",
    storyline:
      "You have entered The Citadel. Its first secret lies hidden somewhere nearby.",
    clue:
      "Find the first checkpoint and unlock the next chapter.",

    co1: [26.841664, 75.565805],
    co2: [26.841400, 75.565790],
    co3: [26.841389, 75.565793],
    co4: [26.841669, 75.565792],
  },

  {
    clueno: 2,
    name: "Checkpoint 2",
    storyline:
      "A passage opens deeper into The Citadel. The trail continues.",
    clue:
      "Search carefully. The next location holds another piece of the mystery.",

    co1: [26.843511, 75.566976],
    co2: [26.843544, 75.567171],
    co3: [26.843682, 75.567438],
    co4: [26.843528, 75.566991],
  },

  {
    clueno: 3,
    name: "Checkpoint 3",
    storyline:
      "The walls of The Citadel have witnessed many secrets. You are getting closer.",
    clue:
      "Follow the signs and reach the next checkpoint.",

    co1: [26.842380, 75.564160],
    co2: [26.842397, 75.564243],
    co3: [26.842298, 75.564259],
    co4: [26.842285, 75.564068],
  },

  {
    clueno: 4,
    name: "Checkpoint 4",
    storyline:
      "The path is becoming more difficult, but the end is now within reach.",
    clue:
      "One more challenge awaits. Find the next marked location.",

    co1: [26.844030, 75.564937],
    co2: [26.844018, 75.565071],
    co3: [26.844032, 75.564935],
    co4: [26.844084, 75.564911],
  },

  {
    clueno: 5,
    name: "Checkpoint 5",
    storyline:
      "You have reached the final chapter of The Citadel. Your journey is complete.",
    clue:
      "Report to the common final location immediately. The first four teams to arrive qualify for the next round.",

    co1: [26.843756, 75.564416],
    co2: [26.843693, 75.564267],
    co3: [26.843755, 75.564398],
    co4: [26.843810, 75.564316],
  },
];

async function main() {
  console.log(`Seeding Track ${TRACK}...`);

  // Find all existing clues for Track 1.
  // We need their location IDs before deleting the clues.
  const existingClues = await prisma.clues.findMany({
    where: {
      track: TRACK,
    },
    select: {
      id: true,
      geolocationsId: true,
    },
  });

  const locationIds = existingClues
    .map((clue) => clue.geolocationsId)
    .filter(Boolean);

  // Delete old clues for this track.
  await prisma.clues.deleteMany({
    where: {
      track: TRACK,
    },
  });

  // Delete their associated geolocations.
  if (locationIds.length > 0) {
    await prisma.geolocations.deleteMany({
      where: {
        id: {
          in: locationIds,
        },
      },
    });
  }

  console.log("Old Track 1 testing clues deleted.");

  // Create the new checkpoints.
  for (const checkpoint of checkpoints) {
    await prisma.clues.create({
      data: {
        track: TRACK,
        clueno: checkpoint.clueno,
        name: checkpoint.name,
        storyline: checkpoint.storyline,
        clue: checkpoint.clue,

        location: {
          create: {
            coordinate1: checkpoint.co1.map(String),
            coordinate2: checkpoint.co2.map(String),
            coordinate3: checkpoint.co3.map(String),
            coordinate4: checkpoint.co4.map(String),
          },
        },
      },
    });

    console.log(
      `✓ Added Track ${TRACK}, Clue ${checkpoint.clueno}`
    );
  }

  // Reset all Track 1 teams to clue 1 for testing.
  await prisma.teamLogins.updateMany({
    where: {
      track: TRACK,
    },
    data: {
      clueno: 1,
      finished: false,
      finishedAt: null,
      qualified: false,
    },
  });

  console.log("✓ Track 1 teams reset.");
  console.log("✓ Path A: The Citadel seeded successfully.");
}

main()
  .catch((error) => {
    console.error("SEED ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });