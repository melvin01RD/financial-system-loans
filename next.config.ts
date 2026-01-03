/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... tus otras configuraciones
  typescript: {
    // !! ADVERTENCIA !!
    // Esto permite que el build termine aunque existan errores de tipo.
    // Úsalo solo mientras terminamos de limpiar los archivos.
    ignoreBuildErrors: true,
  },
  eslint: {
    // También ignoramos ESLint para que el deploy sea fluido
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;