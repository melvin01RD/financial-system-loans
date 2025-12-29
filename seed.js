const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log("? Conectando a Neon para insertar usuario...");

  const user = await prisma.user.upsert({
    where: { email: "admin@yapresto.com" },
    update: { 
      password: hashedPassword,
      nombre: "Admin",
      apellido: "YaPresto" 
    },
    create: {
      email: "admin@yapresto.com",
      password: hashedPassword,
      nombre: "Admin",
      apellido: "YaPresto",
      role: "ADMIN",
    },
  });
  
  console.log("? USUARIO CREADO EN NEON:");
  console.log("?? Email:", user.email);
  console.log("?? Password: admin123");
}

main()
  .catch(e => { console.error("? ERROR:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
