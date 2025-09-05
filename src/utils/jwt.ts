import { decode, sign, verify } from 'hono/jwt';

const JWT_SECRET_DUMMY = 'my-secret-key';

export const generateToken = async (JWT_SECRET: string = JWT_SECRET_DUMMY, payload: any) => {
  return await sign(payload, JWT_SECRET);
};

export const verifyToken = async (JWT_SECRET: string = JWT_SECRET_DUMMY, token: string) => {
  return await verify(token, JWT_SECRET);
};

export const decodetoken = (tokenToDecode: string) => decode(tokenToDecode);

export const generarPayload = (payload: any) => {
  return {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
  };
};
