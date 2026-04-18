import bcrypt from "bcryptjs";

export const hashPassword = (password: string, salts: string) => {
  const hashedPassword = bcrypt.hash(password, Number(salts));
  return hashedPassword;
};

export const comparePassword = (password: string, hashedPassword: string) => {
  const correctPassword = bcrypt.compare(password, hashedPassword);
  return correctPassword;
};
