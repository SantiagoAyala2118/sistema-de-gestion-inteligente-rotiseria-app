import prisma from "./client";
import { hashPassword } from "../helpers/bcrypt";

export const main = async () => {
  const hash = await hashPassword("admin123", process.env.SALTS as string);

  await prisma.usuario.upsert({
    create: {
      nombre: "Administrador",
      email: "admin@rotiseria.com",
      password: hash,
      rol: "ADMINISTRADOR",
    },
    update: {},
    where: { email: "admin@rotiseria.com" },
  });

  console.log("Usuario admin creado correctamente");

  try {
    main();
  } catch (err: any) {
    console.error(err.message);
  } finally {
    prisma.$disconnect;
  }
};
