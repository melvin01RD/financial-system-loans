import bcrypt from 'bcryptjs';

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