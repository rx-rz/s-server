import { customerRepository } from "./customer.repository";
import { compare, genSaltSync, hashSync } from "bcryptjs";

export const checkIfPasswordIsCorrect = async (
  plainPassword: string,
  email: string
) => {
  const hashedPasswordInDb = await customerRepository.getCustomerPassword(
    email
  );
  const passwordIsCorrect = await compare(plainPassword, hashedPasswordInDb);
  return passwordIsCorrect;
};

export const hashUserPassword = (plainPassword: string) => {
  const SALT_ROUNDS = genSaltSync(10);
  let hashedPassword = hashSync(plainPassword, SALT_ROUNDS);
  return hashedPassword;
};
