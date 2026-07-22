-- CreateEnum
CREATE TYPE "StatoPrenotazione" AS ENUM ('IN_ATTESA', 'ANNULLATA', 'NON_PRESENTATA');

-- CreateTable
CREATE TABLE "Prenotazione" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefono" TEXT,
    "copertiPrenotati" INTEGER NOT NULL,
    "dataOra" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "stato" "StatoPrenotazione" NOT NULL DEFAULT 'IN_ATTESA',
    "tavoloId" TEXT,

    CONSTRAINT "Prenotazione_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Occupazione" (
    "id" TEXT NOT NULL,
    "tavoloId" TEXT NOT NULL,
    "prenotazioneId" TEXT,
    "copertiPresenti" INTEGER NOT NULL,
    "iniziataAlle" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terminataAlle" TIMESTAMP(3),
    "oraPagamento" TIMESTAMP(3),

    CONSTRAINT "Occupazione_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Occupazione_prenotazioneId_key" ON "Occupazione"("prenotazioneId");

-- AddForeignKey
ALTER TABLE "Prenotazione" ADD CONSTRAINT "Prenotazione_tavoloId_fkey" FOREIGN KEY ("tavoloId") REFERENCES "Tavolo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Occupazione" ADD CONSTRAINT "Occupazione_tavoloId_fkey" FOREIGN KEY ("tavoloId") REFERENCES "Tavolo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Occupazione" ADD CONSTRAINT "Occupazione_prenotazioneId_fkey" FOREIGN KEY ("prenotazioneId") REFERENCES "Prenotazione"("id") ON DELETE SET NULL ON UPDATE CASCADE;
