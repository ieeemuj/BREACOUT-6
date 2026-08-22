import prisma from "../utils/database.js";

const tracks = [
  {
    track: "1",
    name: "Path A: The Citadel",

    checkpoints: [
      {
        clueno: 1,
        name: "Checkpoint 1",

        // ONLY shown at the start of the track
        storyline: `The Citadel is the deepest and oldest layer of Thorne's dream  a fortress that has stood since before he learned to perform. Everything here is made of stone, iron, parchment, and ruin. Nothing here is soft. This is where Thorne buried the first vow he ever broke, and it is this vow, in five buried pieces, that teams uncover as they move through the world.
The guiding voice of this world is the Warden  an ancient sentinel bound to the citadel's foundations, formed from Thorne's guilt. The Warden does not lie the way Thorne does on stage; it simply withholds, one gate at a time. Every checkpoint is a gate. Every completed challenge forces one more gate open. You are excavating a confession, one room at a time.`,

        clue: `“You stand at the gate of the oldest room in my mind. Long before I learned to deceive an audience for applause, I made a promise to one man, and I broke it here, in stone. Five gates stand between you and the truth of what I buried. Each gate opens only when you have found what the last one hid.”

“Warden's Whisper: Where the sky itself bends to stone above your head, trinkets rest that once held meaning to someone before they were sold for coin. Seek the room shaped like the heavens turned to ceiling, and find the shelf where memory is traded for rupees.”`,

        co1: [26.841664, 75.565805],
        co2: [26.841400, 75.565790],
        co3: [26.841389, 75.565793],
        co4: [26.841669, 75.565792],
      },

      {
        clueno: 2,
        name: "Checkpoint 2",

        // No storyline after the start
        storyline: "",

        clue: `“The name you seek is VAREK. He was the illusionist who trained Thorne as a boy  the first person Thorne ever made a promise to. Varek taught him one rule above all others: 'Never let an audience leave a room they did not choose to enter.' Thorne broke that rule tonight. What you stand beneath once held the last relic Varek ever gave him sold now for a few rupees to strangers who have no idea what it once meant.”

“Warden's Whisper: Among the silenced growl of engines and the smell of old iron, one box still stands that no longer keeps its cold. Seek the place where broken machines are mended, and find the door that once held frost but now holds only forgetting.”`,

        co1: [26.843511, 75.566976],
        co2: [26.843544, 75.567171],
        co3: [26.843682, 75.567438],
        co4: [26.843528, 75.566991],
      },

      {
        clueno: 3,
        name: "Checkpoint 3",

        storyline: "",

        clue: `“This is where a younger Thorne built his very first mechanical trick  and where he first learned that a locked box feels more powerful than an honest door. Varek warned him against it. Thorne sealed this place anyway, and told himself it only ever held scrap metal. It never did.”

“Warden's Whisper: Every oath must be kept somewhere, filed by hands that never forget a name. Seek the first hall of these grounds, where the welfare of the young is recorded and sealed.”`,

        co1: [26.842380, 75.564160],
        co2: [26.842397, 75.564243],
        co3: [26.842298, 75.564259],
        co4: [26.842285, 75.564068],
      },

      {
        clueno: 4,
        name: "Checkpoint 4",

        storyline: "",

        clue: `“Here lies Thorne's own handwriting: a signed oath, aged and cracked at the folds 'I will never trap another soul the way I trapped my own shadow.' No date of breaking is recorded. Only the promise, and beneath it, an ink smudge shaped like a thumbprint pressed down too hard.”

“Warden's Whisper: Here, a battle was fought and the ground never healed. Seek the open field where goals once stood tall and rings once held a ball aloft now only splinters and silence remain.”`,

        co1: [26.844030, 75.564937],
        co2: [26.844018, 75.565071],
        co3: [26.844032, 75.564935],
        co4: [26.844084, 75.564911],
      },

      {
        clueno: 5,
        name: "Checkpoint 5",

        // STORED FOR THE FINAL SCREEN.
        // The frontend will NOT show this while Clue 5 is active.
        // It is shown only after Clue 5 is successfully solved.
        storyline: `“The full truth: the 'soul' Thorne sealed in the Forge was never someone else's. It was his own the frightened, honest boy who made a promise to Varek and meant to keep it. Every illusion since has been Thorne performing over that boy's silence. The Citadel doesn't need to be escaped. It needs to be forgiven.”

”You have broken every trick this dream had to give,
chased its illusions, learned how it lives.
But no dream ends where its lies were found 
it ends where you first stepped onto its ground.
Walk back now, retrace where you began,
the exit was always the entrance's plan.`,

        clue: `“This is where it ended the first time. When Varek's oldest students learned what Thorne had sealed in the Forge, they came here to stop him. The citadel does not remember who won. It only remembers that the ground still hasn't healed, and that Thorne walked away from this arena alone.”

“Warden's Whisper: The final truth cannot be read directly it must be turned inward, like a mind studying itself. Seek the third hall of these grounds, where thought is studied and reflection is the only way to see clearly.”`,

        co1: [26.843756, 75.564416],
        co2: [26.843693, 75.564267],
        co3: [26.843755, 75.564398],
        co4: [26.843810, 75.564316],
      },
    ],
  },

  {
    track: "3",
    name: "Path C: The Nexus",

    checkpoints: [
      {
        clueno: 1,
        name: "The First Fragment",

        // THE ONE TRACK STORYLINE
        // Shown only when the team starts the track
        storyline: `The Nexus is the newest and most volatile layer of Thorne's dream a world built from circuitry, glass, static, and code. Nothing here is fixed, because this is where Thorne buried the first system he ever built to predict what comes next, and it is this system, in five fractured fragments, that teams recover as they move through the world.

The guiding voice of this world is the Nexus itself  an intelligence formed from Thorne's belief that he could engineer the future before it arrived. The Nexus does not lie the way Thorne does on stage; it calculates, releasing one coordinate only once every prior variable has been solved. Every location is a node. Every completed challenge closes one loop in the network. You are not exploring a campus you are debugging a mind, one fragment at a time.`,

        clue: `The Nexus does not begin in a room. It begins at the exact point where the world tilts upward and stops asking permission where two watchers, carved into stillness, have logged every ascent without ever once looking away. They are not guards. They are sensors. They have been counting your steps since before you knew you were being counted.

The Nexus speaks:
"Two guardians stand where the ground begins to lose its argument with gravity.
They never move, yet they watch everyone rise.
Do not search for a door. Do not search for a room.
Find the place where one step becomes another,
where the higher you go, the smaller the world below appears.
The Nexus left its first fragment beneath the watch of those who never blink."`,

        // Grand Staircase / Lion side
        co1: [26.842752, 75.565949],
        co2: [26.842431, 75.565727],
        co3: [26.842442, 75.565884],
        co4: [26.842546, 75.565674],
      },

      {
        clueno: 2,
        name: "The Second Fragment",

        storyline: "",

        clue: `Where instructions are written in a language too small to see

The Nexus was never only about machines. Its first true ambition was smaller than that smaller than anything Thorne could hold in his hand. Long before he learned to predict a system, he wanted to predict a body: to read the code written inside every living thing and catch its failures before they became irreversible. The second fragment lives exactly where that ambition still plays out in rooms where broken patterns are studied one strand at a time.

The Nexus speaks:
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

        // AB2 Cancer Research
        co1: [26.843686, 75.566916],
        co2: [26.843657, 75.566916],
        co3: [26.843712, 75.566125],
        co4: [26.843713, 75.566129],
      },

      {
        clueno: 3,
        name: "The Third Fragment",

        storyline: "",

        clue: `Even Thorne's oldest tricks eventually became part of the Nexus's design. Houdini's escapes relied on locks and chains mechanical, breakable, human. The Nexus rebuilt that same escape without a single lock in sight, replacing walls with something far harder to argue with: boundary lines that everyone agrees to obey, on a smaller stage tucked just behind a much larger one.

The Nexus speaks:
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

        // Tennis Court
        co1: [26.846225, 75.564183],
        co2: [26.846316, 75.563823],
        co3: [26.846259, 75.563711],
        co4: [26.846358, 75.563745],
      },

      {
        clueno: 4,
        name: "The Fourth Fragment",

        storyline: "",

        clue: `Not everything the Nexus buried was built. Some of it was simply left alone allowed to grow wild while the rest of the system expanded around it. Deep in that untouched green, there is a piece of the world that has never needed a single wire to hold a reflection of the sky, and never needed a single root to hold a reflection of a tree.

The Nexus speaks:
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

        // AWS Pond
        co1: [26.843539, 75.567483],
        co2: [26.843692, 75.567180],
        co3: [26.843891, 75.567456],
        co4: [26.843911, 75.567386],
      },

      {
        clueno: 5,
        name: "The Fifth Fragment",

        // STORED FOR THE FINAL SCREEN ONLY
        storyline: `Five fragments recovered. The Nexus was never a network  it was a fear Thorne coded into something that looked like intelligence: the fear of being left behind by a future he didn't control.

There is nothing left to calculate. Only the way out.

You have broken every trick this dream had to give,
chased its illusions, learned how it lives.
But no dream ends where its lies were found 
it ends where you first stepped onto its ground.
Walk back now, retrace where you began,
the exit was always the entrance's plan.`,

        clue: `“The Nexus has one final hiding place.
Not where machines are built.
Not where games are played.
Not where experiments are run.

Go where arguments have rules.
Where rights have meanings.
Where law, society and the human world become subjects of study.

But the Nexus will not give you the building’s name.
It speaks in coordinates.

The beginning of the alphabet.
Followed by the letter that follows it.
Then the number of letters in the word you seek.

LAW.

Put them together.
Now find the place where Law is not merely read 
it is studied.”`,

        // AB3 Library / Law
        co1: [26.843665, 75.564227],
        co2: [26.843667, 75.564230],
        co3: [26.843638, 75.564151],
        co4: [26.843637, 75.564154],
      },
    ],
  },
];

async function seedTrack(trackData) {
  console.log(`\nSeeding ${trackData.name}...`);

  const existingClues = await prisma.clues.findMany({
    where: {
      track: trackData.track,
    },
    select: {
      id: true,
      geolocationsId: true,
    },
  });

  const locationIds = existingClues
    .map((clue) => clue.geolocationsId)
    .filter(Boolean);

  // Delete existing clues for this track
  await prisma.clues.deleteMany({
    where: {
      track: trackData.track,
    },
  });

  // Delete their associated geolocations
  if (locationIds.length > 0) {
    await prisma.geolocations.deleteMany({
      where: {
        id: {
          in: locationIds,
        },
      },
    });
  }

  // Create all 5 clues
  for (const checkpoint of trackData.checkpoints) {
    await prisma.clues.create({
      data: {
        track: trackData.track,
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
      `✓ ${trackData.name} — Clue ${checkpoint.clueno} added`
    );
  }

  // Reset teams on this track
  await prisma.teamLogins.updateMany({
    where: {
      track: trackData.track,
    },
    data: {
      clueno: 1,
      finished: false,
      finishedAt: null,
      qualified: false,
      returning: false,
    },
  });

  console.log(`✓ ${trackData.name} teams reset`);
}

async function main() {
  console.log("Starting Breacout seed...");

  for (const trackData of tracks) {
    await seedTrack(trackData);
  }

  console.log("\n✓ All tracks seeded successfully.");
}

main()
  .catch((error) => {
    console.error("SEED ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });