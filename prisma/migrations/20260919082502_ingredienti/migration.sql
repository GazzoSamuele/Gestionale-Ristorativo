-- CreateTable
CREATE TABLE "Ingrediente" (
    "id" TEXT NOT NULL,
    "prodottoId" TEXT NOT NULL,
    "piattoId" TEXT NOT NULL,
    "quantita" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "Ingrediente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ingrediente_piattoId_prodottoId_key" ON "Ingrediente"("piattoId", "prodottoId");

-- AddForeignKey
ALTER TABLE "Ingrediente" ADD CONSTRAINT "Ingrediente_prodottoId_fkey" FOREIGN KEY ("prodottoId") REFERENCES "Prodotto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingrediente" ADD CONSTRAINT "Ingrediente_piattoId_fkey" FOREIGN KEY ("piattoId") REFERENCES "Piatto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
