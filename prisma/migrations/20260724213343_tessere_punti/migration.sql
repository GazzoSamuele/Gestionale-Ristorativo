-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefono" TEXT,
    "primaVisita" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visite" INTEGER NOT NULL DEFAULT 0,
    "punti" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Premio" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "puntiRichiesti" INTEGER NOT NULL,

    CONSTRAINT "Premio_pkey" PRIMARY KEY ("id")
);
