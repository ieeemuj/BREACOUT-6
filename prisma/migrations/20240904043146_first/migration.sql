-- CreateTable
CREATE TABLE "TeamLogins" (
    "id" TEXT NOT NULL,
    "track" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "credential" TEXT NOT NULL,

    CONSTRAINT "TeamLogins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Geolocations" (
    "id" TEXT NOT NULL,
    "track" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "coordinate1" TEXT[],
    "coordinate2" TEXT[],
    "coordinate3" TEXT[],
    "coordinate4" TEXT[],
    "clue" TEXT NOT NULL,

    CONSTRAINT "Geolocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamLogins_credential_key" ON "TeamLogins"("credential");
