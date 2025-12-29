import { SignJWT, jwtVerify } from 'jose';

// Esta es la llave secreta. Asegúrate de tener JWT_SECRET en tu .env
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'YAPRESTO_CLAVE_UNICA_2025'
);

// Función para FIRMAR el token (Se usa en el Login)
export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h') // El oficial tendrá 8 horas de sesión
    .sign(SECRET);
}

// Función para VERIFICAR el token (Se usa en el Middleware)
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch (error) {
    return null; // Si el token es falso o expiró, devuelve null
  }
}