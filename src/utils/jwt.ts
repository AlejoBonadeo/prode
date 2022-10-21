import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const createUserToken = (user: User): string => {
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
      },
      process.env.JWT_SEED!,
    );
    return token;
  };
  
  export const verifyUserToken = (token: string = ""): Promise<User | null> => {
    return new Promise((resolve) => {
      jwt.verify(token, process.env.JWT_SEED!, (err, payload) => {
        if (err) {
          resolve(null);
        }
        resolve(payload as User);
      });
    });
  };