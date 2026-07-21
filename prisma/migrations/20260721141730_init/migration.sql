-- CreateTable
CREATE TABLE "Tavolo" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "capienza" INTEGER NOT NULL,
    "posX" INTEGER NOT NULL,
    "posY" INTEGER NOT NULL,

    CONSTRAINT "Tavolo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tavolo_numero_key" ON "Tavolo"("numero");
