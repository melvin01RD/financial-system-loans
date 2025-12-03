# 💰 MLBF Financial System (Sistema de Gestión de Préstamos)

Este repositorio contiene el código fuente completo del Sistema de Gestión y Administración de Préstamos (LMS) para el control interno de operaciones financieras.

El sistema está diseñado para ser utilizado exclusivamente por administradores, enfocándose en la precisión de la lógica de amortización, la gestión de abonos a capital, y la generación de reportes detallados.

---

## 🚀 Stack Tecnológico

El proyecto está construido utilizando un stack moderno, robusto y escalable, ideal para el manejo de datos transaccionales críticos.

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework** | **Next.js (App Router)** | Backend y Frontend integrados (Full-Stack). Provee renderizado del lado del servidor (SSR) para velocidad y eficiencia. |
| **Lenguaje** | **TypeScript** | Añade tipado estático para prevenir errores, crucial en la lógica financiera y la manipulación de números. |
| **Base de Datos** | **PostgreSQL** | Base de datos relacional elegida por su solidez, integridad ACID y manejo avanzado de transacciones. |
| **ORM** | **Prisma** | Mapeador Objeto-Relacional que facilita la interacción con PostgreSQL de forma segura y con tipado. |
| **Estilos** | **Tailwind CSS + shadcn/ui** | Framework CSS utilitario y componentes React de alta calidad para construir un dashboard administrativo responsivo. |
| **Hosting (DB)** | **Supabase / Neon** | Servicios administrados de PostgreSQL. |
| **Hosting (App)** | **Vercel** | Plataforma de despliegue optimizada para Next.js. |

---

## 🧩 Funcionalidades Principales

El sistema cubre todos los aspectos de la administración de préstamos:

1.  **Gestión de Clientes:**
    * CRUD (Crear, Leer, Actualizar, Borrar) de perfiles con información personal (nombre, dirección, teléfono).
2.  **Gestión de Préstamos:**
    * Registro de préstamos con Principal, Tasa de Interés, Plazo y especificación de Garantías.
    * Cálculo automático de la Cuota Fija Mensual.
3.  **Transacciones y Pagos (Core Financiero):**
    * Registro de pagos de cuotas regulares con desglose de Capital e Intereses.
    * Manejo de **Abonos a Capital** (Pagos Parciales): La lógica financiera recalcula el **Plazo Restante** de la deuda.
    * Manejo de **Liquidación Total:** Cálculo preciso del monto para saldar la deuda anticipadamente.
4.  **Historial y Reportes:**
    * Historial completo de pagos por préstamo.
    * Generación de balances y reportes de estado de cuenta en formato **PDF**.
5.  **Seguridad y Auditoría:**
    * Control de acceso para administradores (Melvin y Brayan).
    * Sistema de **AuditLog** para registrar quién, qué y cuándo realizó una acción en los datos críticos.

---

## ⚙️ Configuración y Ejecución Local

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Requisitos Previos

* Node.js (versión LTS recomendada)
* npm o yarn
* Cuenta de Supabase/Neon para el host de PostgreSQL.

### 1. Clonar el Repositorio

```bash
git clone [https://github.com/TU_USUARIO/MLBF-financial-system.git](https://github.com/TU_USUARIO/MLBF-financial-system.git)
cd MLBF-financial-system
