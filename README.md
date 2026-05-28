# Óptica Zeus — Frontend

Sistema web de gestión de citas para Óptica Zeus, Linares. Permite a pacientes agendar horas en línea, a profesionales administrar su agenda y a administradores gestionar el sistema completo.

---

## Requisitos

- Node.js ≥ 18
- npm ≥ 9
- API backend corriendo (por defecto en `http://localhost:3000`)

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000
```

## Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo → http://localhost:5173
npm run build     # Compilar para producción
npm run preview   # Previsualizar build de producción
npm run lint      # Verificar calidad de código
```

---

## Stack

- **React 19** — Framework de UI
- **React Router DOM 7** — Enrutamiento SPA
- **Tailwind CSS 3** — Estilos utilitarios
- **Vite 8** — Bundler y servidor de desarrollo

---

## Estructura del proyecto

```
src/
├── api/
│   └── client.js           # Capa HTTP centralizada + token JWT
├── context/
│   └── AuthContext.jsx      # Estado global de autenticación
├── components/
│   ├── AppLayout.jsx        # Layout con sidebar fijo
│   ├── Sidebar.jsx          # Navegación lateral dinámica por rol
│   ├── ProtectedRoute.jsx   # Guard de rutas por autenticación y rol
│   └── ui/                  # Componentes reutilizables (Button, Input, Card, etc.)
└── pages/                   # Páginas de la aplicación
```

---

## Roles del sistema

| Rol | Acceso |
|---|---|
| `PACIENTE` | Agendar citas, ver historial, cancelar |
| `PROFESIONAL` | Ver citas asignadas, gestionar agenda, registrar pacientes |
| `ADMIN` | Acceso completo: panel, citas, agenda de todos, usuarios |

---

## Autenticación

El sistema usa JWT. El token se guarda en `localStorage` (`optica_zeus_token`) y se envía en cada petición como `Authorization: Bearer <token>`.
