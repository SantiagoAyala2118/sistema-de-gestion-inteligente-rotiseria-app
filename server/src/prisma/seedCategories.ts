import prisma from "./client";

const main = async () => {
  const categorias = ["Comidas", "Bebidas", "Combos"];

  for (const nombre of categorias) {
    await prisma.categoria.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  console.log("Categorías creadas correctamente");
};

try {
  main();
} catch (err: any) {
  console.error(err.message);
} finally {
  prisma.$disconnect();
}
