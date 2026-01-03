import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { verifyToken } from './jwt';

/**
 * Compara una contraseña en texto plano con una encriptada (hash)
 * También tiene el fallback para texto plano que tenías por si acaso
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    // 1. Intentar comparar con Bcrypt (Lo correcto)
    const isMatch = await bcrypt.compare(password, hash);
    if (isMatch) return true;

    // 2. Fallback: Comparación directa (Solo si aún tienes claves sin encriptar en la DB)
    if (password === hash) return true;

    return false;
  } catch (error) {
    console.error('Error al comparar contraseñas:', error);
    return false;
  }
}

/**
 * Encripta una contraseña antes de guardarla en la base de datos
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * Obtiene el usuario actual desde la cookie 'token'
 * Usar esto en Server Actions y Server Components
 */
export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    if (!payload) return null;
    
    // Devolvemos el payload normalizado. Ajustar según lo que guardes en el JWT.
    return payload as { id: string; email: string; name?: string; role?: string };
  } catch (error) {
    return null;
  }
}
