import prisma from "../utils/database.js";

const TRACK_A = "1";
const TRACK_C = "3";

const trackA = [
    {
        clueno: 1,
        name: "Checkpoint 1",
        storyline:
            "You have entered The Citadel. Its first secret lies hidden somewhere nearby.",
        clue:
            "Find the first checkpoint and unlock the next chapter.",

        co1: [26.841664, 75.565805],
        co2: [26.8414, 75.56579],
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

        co1: [26.84238, 75.56416],
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

        co1: [26.84403, 75.564937],
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
        co4: [26.84381, 75.564316],
    },
];

const trackC = [
    {
        clueno: 1,
        name: "The First Fragment",

        storyline: `The Nexus is the newest and most volatile layer of Thorne's dream — a world built from circuitry, glass, static, and code. Nothing here is fixed, because this is where Thorne buried the first system he ever built to predict what comes next, and it is this system, in five fractured fragments, that teams recover as they move through the world.

The guiding voice of this world is the Nexus itself — an intelligence formed from Thorne's belief that he could engineer the future before it arrived. The Nexus does not lie the way Thorne does on stage; it calculates, releasing one coordinate only once every prior variable has been solved. Every location is a node. Every completed challenge closes one loop in the network. You are not exploring a campus — you are debugging a mind, one fragment at a time.`,

        clue: `The Nexus does not begin in a room. It begins at the exact point where the world tilts upward and stops asking permission, where two watchers, carved into stillness, have logged every ascent without ever once looking away. They are not guards. They are sensors. They have been counting your steps since before you knew you were being counted.

The Nexus speaks:

"Two guardians stand where the ground begins to lose its argument with gravity.
They never move, yet they watch everyone rise.
Do not search for a door. Do not search for a room.
Find the place where one step becomes another,
where the higher you go, the smaller the world below appears.
The Nexus left its first fragment beneath the watch of those who never blink."`,


        co1: [26.842752, 75.565949],
        co2: [26.842431, 75.565727],
        co3: [26.842442, 75.565884],
        co4: [26.842546, 75.565674],
    },

    {
        clueno: 2,
        name: "Where Instructions Are Written",
        storyline: `The Nexus was never only about machines. Its first true ambition was smaller than that smaller than anything Thorne could hold in his hand.

Long before he learned to predict a system, he wanted to predict a body: to read the code written inside every living thing and catch its failures before they became irreversible.

The second fragment lives exactly where that ambition still plays out in rooms where broken patterns are studied one strand at a time.`,

        clue: `The Nexus speaks:

"The answer is hidden in something smaller than a grain of sand,
yet the story it carries can belong to an entire body.
Find the place where tiny instructions are read,
where broken patterns matter,
and where scientists chase a disease before it can take another step.

The Nexus needs you to find the house of a battle fought at the smallest scale.

The Nexus speaks in coordinates.
Take the first two letters of the alphabet.
Then take the number of letters in the word 'AB'.
Put them together.

Now find the place where this battle is studied."`,

        co1: [26.843686, 75.566916],
        co2: [26.843657, 75.566916],
        co3: [26.843712, 75.566125],
        co4: [26.843713, 75.566129],
    },

    {
        clueno: 3,
        name: "The Houdini Fragment",
        storyline: `Even Thorne's oldest tricks eventually became part of the Nexus's design. Houdini's escapes relied on locks and chains mechanical, breakable, human.

The Nexus rebuilt that same escape without a single lock in sight, replacing walls with something far harder to argue with: boundary lines that everyone agrees to obey, on a smaller stage tucked just behind a much larger one.`,

        clue: `The Nexus speaks:

"Houdini had many ways out.
But this time, there are no chains, no locks, no walls.
Only lines.

A magician could disappear on grass,
but this escape was never meant for grass.

Look for the ground that may wear green,
or orange, or even blue,
where the surface changes, but the rules do not.

A smaller kingdom sits behind a larger one.
Find the place where a ball must stay inside the lines,
and Houdini would know exactly where to make his escape."`,

        co1: [26.846225, 75.564183],
        co2: [26.846316, 75.563823],
        co3: [26.846259, 75.563711],
        co4: [26.846358, 75.563745],
    },

    {
        clueno: 4,
        name: "The Quiet Reflection",
        storyline: `Not everything the Nexus buried was built. Some of it was simply left alone allowed to grow wild while the rest of the system expanded around it.

Deep in that untouched green, there is a piece of the world that has never needed a single wire to hold a reflection of the sky, and never needed a single root to hold a reflection of a tree.`,

        clue: `The Nexus speaks:

"The Nexus has hidden something where the campus grows wild.
You will not find it beneath a roof.
You will not find it beside a court.

Follow the green until the path becomes quieter.
Look past the bushes.

There, something waits that does not move,
yet moves whenever the sky does.

It holds clouds without being above you.
It holds trees without having roots.

No fountain. No swimming pool.
Just a quiet piece of water
hiding where you least expect it."`,

        co1: [26.843539, 75.567483],
        co2: [26.843692, 75.56718],
        co3: [26.843891, 75.567456],
        co4: [26.843911, 75.567386],
    },

    {
        clueno: 5,
        name: "The Final Fragment",
        storyline: `The Nexus has one final hiding place.

Not where machines are built.
Not where games are played.
Not where experiments are run.`,

        clue: `Go where arguments have rules.
Where rights have meanings.
Where law, society and the human world become subjects of study.

But the Nexus will not give you the building's name.
It speaks in coordinates.

The beginning of the alphabet.
Followed by the letter that follows it.
Then the number of letters in the word you seek.

LAW.

Put them together.
Now find the place where Law is not merely read it is studied.`,

        co1: [26.843665, 75.564227],
        co2: [26.843667, 75.56423],
        co3: [26.843638, 75.564151],
        co4: [26.843637, 75.564154],
    },
];

async function clearTrack(track) {
    const existingClues = await prisma.clues.findMany({
        where: {
            track,
        },
        select: {
            geolocationsId: true,
        },
    });

    const locationIds = existingClues
        .map((clue) => clue.geolocationsId)
        .filter(Boolean);

    await prisma.clues.deleteMany({
        where: {
            track,
        },
    });

    if (locationIds.length > 0) {
        await prisma.geolocations.deleteMany({
            where: {
                id: {
                    in: locationIds,
                },
            },
        });
    }
}

async function seedTrack(track, checkpoints) {
    console.log(`\nSeeding Track ${track}...`);

    await clearTrack(track);

    for (const checkpoint of checkpoints) {
        await prisma.clues.create({
            data: {
                track,
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

        console.log(`✓ Added Track ${track}, Clue ${checkpoint.clueno}`);
    }

    await prisma.teamLogins.updateMany({
        where: {
            track,
        },
        data: {
            clueno: 1,
            finished: false,
            finishedAt: null,
            qualified: false,
        },
    });

    console.log(`✓ Track ${track} teams reset.`);
}

async function main() {
    console.log("Starting clue seeding...");

    await seedTrack(TRACK_A, trackA);
    await seedTrack(TRACK_C, trackC);

    console.log("\n✓ Path A: The Citadel seeded successfully.");
    console.log("✓ Path C: The Nexus seeded successfully.");
    console.log("\nAll done.");
}

main()
    .catch((error) => {
        console.error("SEED ERROR:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });