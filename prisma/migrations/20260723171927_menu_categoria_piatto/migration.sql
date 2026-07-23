-- CreateTable
CREATE TABLE "Piatto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "prezzo" DECIMAL(10,2) NOT NULL,
    "disponibile" BOOLEAN NOT NULL DEFAULT true,
    "categoriaId" TEXT NOT NULL,

    CONSTRAINT "Piatto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordine" INTEGER NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Piatto" ADD CONSTRAINT "Piatto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
