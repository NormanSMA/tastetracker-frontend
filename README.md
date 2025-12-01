# 🍽️ TasteTracker Frontend

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-FFD859?style=for-the-badge&logo=picpay&logoColor=black)

**Cliente Web SPA para la Gestión Integral de Pedidos de Restaurante**

[Características](#-características) •
[Instalación](#-instalación) •
[Uso](#-uso) •
[Estructura](#-estructura-del-proyecto) •
[Tecnologías](#-tecnologías-utilizadas)

</div>

---

## 📋 Descripción

**TasteTracker Frontend** es una aplicación web moderna de página única (SPA) desarrollada con Vue 3 y TypeScript, diseñada para optimizar el flujo de trabajo en restaurantes. Se conecta a la [API Laravel Backend](https://github.com/NormanSMA/tastetracker-backend) y ofrece interfaces especializadas para meseros, cocina y administradores.

### ✨ Características Principales

- 📊 **Dashboard Interactivo**: Métricas en tiempo real con gráficas y KPIs de ventas, pedidos activos y rendimiento por mesero
- 🛒 **Punto de Venta (POS)**: Interfaz optimizada tipo restaurante con menú visual y ticket en tiempo real
- 👨‍🍳 **Gestión de Cocina**: Tablero tipo Kanban con filtros por estado (Pendiente → Preparando → Listo → Servido)
- 🍔 **CRUD de Menú**: Administración completa de productos y categorías con carga de imágenes
- 👥 **Control de Usuarios**: Gestión de roles (Admin, Mesero, Cocina) con fotos de perfil
- 🌓 **Modo Oscuro**: Tema adaptable con persistencia en localStorage
- 🎨 **UX Moderna**: Notificaciones toast, skeletons de carga, transiciones suaves y animaciones

---

## 🚀 Instalación

### Prerrequisitos

- **Node.js** >= 18.x
- **pnpm** >= 8.x (gestor de paquetes recomendado)
- Backend TasteTracker corriendo (Laravel API)

### Pasos de Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/NormanSMA/tastetracker-frontend.git
   cd tastetracker-frontend
   ```

2. **Instalar dependencias**

   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**

   Crea un archivo `.env` en la raíz del proyecto:

   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

   > ⚠️ Asegúrate de que `VITE_API_URL` coincida con la URL de tu backend Laravel

4. **Ejecutar en modo desarrollo**

   ```bash
   pnpm dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

5. **Compilar para producción**

   ```bash
   pnpm build
   ```

   Los archivos optimizados se generarán en la carpeta `dist/`

---

## 💻 Uso

### Comandos Disponibles

| Comando        | Descripción                                    |
| -------------- | ---------------------------------------------- |
| `pnpm dev`     | Inicia servidor de desarrollo con hot-reload   |
| `pnpm build`   | Compila la aplicación para producción          |
| `pnpm preview` | Previsualiza la build de producción localmente |
| `pnpm lint`    | Ejecuta el linter para verificar el código     |

### Credenciales de Prueba

Consulta la documentación del backend para obtener las credenciales de los usuarios de prueba.

---

## 📁 Estructura del Proyecto

```
tastetracker-frontend/
├── src/
│   ├── api/              # Configuración de Axios y cliente HTTP
│   ├── components/       # Componentes reutilizables
│   │   └── common/       # Componentes globales (Modal, ThemeToggle)
│   ├── layouts/          # Layouts de páginas (MainLayout)
│   ├── router/           # Configuración de Vue Router
│   ├── stores/           # Stores de Pinia (auth, products, cart, orders, users)
│   ├── views/            # Vistas principales de la aplicación
│   │   ├── auth/         # Login y autenticación
│   │   ├── dashboard/    # Dashboard principal
│   │   ├── products/     # Gestión de menú y productos
│   │   ├── orders/       # Crear pedidos y vista de cocina
│   │   └── users/        # Administración de usuarios
│   ├── App.vue           # Componente raíz
│   ├── main.ts           # Punto de entrada de la aplicación
│   └── style.css         # Estilos globales con TailwindCSS
├── public/               # Archivos estáticos
├── .env                  # Variables de entorno (crear manualmente)
└── vite.config.ts        # Configuración de Vite
```

### 🗂️ Descripción de Carpetas Clave

- **`stores/`**: Gestión de estado global con Pinia (auth, products, cart, orders, users)
- **`views/`**: Páginas principales organizadas por módulo
- **`layouts/`**: Estructura base con navegación, sidebar y header
- **`api/`**: Cliente HTTP configurado con Axios e interceptores
- **`components/common/`**: Componentes reutilizables (modales, botones, toggles)

---

## 🛠️ Tecnologías Utilizadas

<div align="center">

| Tecnología                                                                                                                               | Versión | Descripción                              |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------- |
| <img src="https://vuejs.org/images/logo.png" width="40" height="40"> **Vue 3**                                                           | ^3.5    | Framework progresivo con Composition API |
| <img src="https://raw.githubusercontent.com/github/explore/main/topics/typescript/typescript.png" width="40" height="40"> **TypeScript** | ^5.6    | Tipado estático para JavaScript          |
| <img src="https://vitejs.dev/logo.svg" width="40" height="40"> **Vite**                                                                  | ^6.0    | Build tool ultrarrápido                  |
| <img src="https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg" width="40" height="40"> **TailwindCSS**                    | ^4.0.0  | Framework de utilidades CSS              |
| <img src="https://pinia.vuejs.org/logo.svg" width="40" height="40"> **Pinia**                                                            | ^2.3    | Store de estado oficial para Vue         |
| **Axios**                                                                                                                                | ^1.7    | Cliente HTTP basado en promesas          |
| **Vue Router**                                                                                                                           | ^4.5    | Enrutador oficial de Vue.js              |
| **Lucide Vue**                                                                                                                           | ^0.468  | Biblioteca de iconos SVG                 |
| **Vue Sonner**                                                                                                                           | ^1.2    | Sistema de notificaciones toast          |

</div>

### 🎨 Características de Diseño

- **TailwindCSS v4** con variables CSS nativas
- **Dark Mode** implementado con `@theme` directives
- **Animaciones** suaves y transiciones de página
- **Componentes** responsivos optimizados para móviles y escritorio
- **Skeletons** de carga para mejor UX

---

## 🔐 Autenticación y Seguridad

- Autenticación basada en **JWT tokens** (Laravel Sanctum)
- **Interceptores Axios** para agregar tokens automáticamente
- Rutas protegidas con **guards de Vue Router**
- **Control de roles** (Admin, Mesero, Cocina) desde el frontend

---

## 🌐 Conexión con el Backend

El frontend se comunica con el [TasteTracker Backend](https://github.com/NormanSMA/tastetracker-backend) mediante una API RESTful.

**Endpoints principales consumidos:**

- `POST /api/login` - Autenticación de usuarios
- `GET /api/products` - Listado de productos
- `POST /api/orders` - Creación de pedidos
- `PUT /api/orders/{id}` - Actualización de estado de pedidos
- `GET /api/dashboard` - Estadísticas del dashboard

> **Nota**: Asegúrate de configurar CORS en el backend para permitir peticiones desde el frontend.

---

## 👥 Autores

Este proyecto fue desarrollado por:

- **Hoowerts Gross** - Desarrollo Frontend
- **Antony Maltez** - Desarrollo Backend & API
- **Jorge Rodriguez** - Arquitectura & Integración
- **Norman Acevedo** - Desarrollo Fullstack & UI/UX

---
