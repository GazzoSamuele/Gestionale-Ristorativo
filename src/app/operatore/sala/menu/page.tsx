import { prisma } from "@/lib/prisma";

export default async function Menu() {
  const categorie = await prisma.categoria.findMany({
  orderBy: { ordine: "asc" },      
    include: { 
      piatti: {
        where: { disponibile: true} 
      }
  }
});
  return (
      <section>
        <ul>
          {categorie.map((categoria) => (
            <li key={categoria.id}>
              <p>{categoria.nome}</p>
                  {categoria.piatti.map((piatto) => (
                  <li key={piatto.id}>
                    <p>{piatto.nome}</p>
                    <p>{piatto.prezzo.toString()} €</p>
                  </li>
                ))}
            </li>
            ))}
        </ul>

      </section>
    );
}