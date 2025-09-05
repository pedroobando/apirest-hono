import { decode, sign, verify } from 'hono/jwt';

const JWT_SECRET_DUMMY = 'my-secret-key';

export const generateToken = async (payload: any, JWT_SECRET: string = JWT_SECRET_DUMMY, JWT_EXPIRES: number = 30) => {
  const payloadNew = generarPayload(payload, JWT_EXPIRES);
  return await sign(payloadNew, JWT_SECRET);
};

export const verifyToken = async (JWT_SECRET: string = JWT_SECRET_DUMMY, token: string) => {
  return await verify(token, JWT_SECRET);
};

export const decodetoken = (tokenToDecode: string) => decode(tokenToDecode);

const generarPayload = (payload: any, minutesExp: number) => {
  return {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * minutesExp, // Token expires in 5 minutes
  };
};
