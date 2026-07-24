-- CreateEnum
CREATE TYPE "FonteOrdine" AS ENUM ('SALA', 'ASPORTO');

-- CreateEnum
CREATE TYPE "StatoOrdine" AS ENUM ('NUOVI_ARRIVATI', 'IN_CORSO', 'PRONTI');

-- CreateTable
CREATE TABLE "Ordine" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "fonte" "FonteOrdine" NOT NULL,
    "stato" "StatoOrdine" NOT NULL DEFAULT 'NUOVI_ARRIVATI',
    "creatoIl" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statoDalle" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nomeCliente" TEXT,
    "occupazioneId" TEXT,

    CONSTRAINT "Ordine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RigaOrdine" (
    "id" TEXT NOT NULL,
    "piattoId" TEXT NOT NULL,
    "ordineId" TEXT NOT NULL,
    "quantita" INTEGER NOT NULL DEFAULT 1,
    "prezzoUnitario" DECIMAL(10,2) NOT NULL,
    "note" TEXT,

    CONSTRAINT "RigaOrdine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ordine_numero_key" ON "Ordine"("numero");

-- AddForeignKey
ALTER TABLE "Ordine" ADD CONSTRAINT "Ordine_occupazioneId_fkey" FOREIGN KEY ("occupazioneId") REFERENCES "Occupazione"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RigaOrdine" ADD CONSTRAINT "RigaOrdine_piattoId_fkey" FOREIGN KEY ("piattoId") REFERENCES "Piatto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RigaOrdine" ADD CONSTRAINT "RigaOrdine_ordineId_fkey" FOREIGN KEY ("ordineId") REFERENCES "Ordine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
