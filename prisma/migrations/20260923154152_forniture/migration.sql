-- AlterTable
ALTER TABLE "Prodotto" ADD COLUMN     "daOrdinare" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Fornitura" (
    "id" TEXT NOT NULL,
    "fornitore" TEXT NOT NULL,
    "ricevuta" BOOLEAN NOT NULL DEFAULT false,
    "ricevutaIl" TIMESTAMP(3),
    "note" TEXT,
    "creatoIl" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatoDaId" TEXT NOT NULL,

    CONSTRAINT "Fornitura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RigaFornitura" (
    "id" TEXT NOT NULL,
    "prodottoId" TEXT NOT NULL,
    "fornituraId" TEXT NOT NULL,
    "quantita" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "RigaFornitura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RigaFornitura_fornituraId_prodottoId_key" ON "RigaFornitura"("fornituraId", "prodottoId");

-- AddForeignKey
ALTER TABLE "Fornitura" ADD CONSTRAINT "Fornitura_creatoDaId_fkey" FOREIGN KEY ("creatoDaId") REFERENCES "Utente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RigaFornitura" ADD CONSTRAINT "RigaFornitura_prodottoId_fkey" FOREIGN KEY ("prodottoId") REFERENCES "Prodotto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RigaFornitura" ADD CONSTRAINT "RigaFornitura_fornituraId_fkey" FOREIGN KEY ("fornituraId") REFERENCES "Fornitura"("id") ON DELETE CASCADE ON UPDATE CASCADE;
