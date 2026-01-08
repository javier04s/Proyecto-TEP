# UCAB Tasks - API REST para Gestión de Notas

API REST desarrollada con NestJS para la gestión de notas de texto. Este proyecto es parte del curso de Tópicos Especiales de Programación (NRC 15997).

## 📋 Descripción

UCAB Tasks es una API REST que permite realizar operaciones CRUD (Create, Read, Update, Delete) sobre notas de texto. Las notas pueden ser filtradas y ordenadas según diferentes criterios. La aplicación utiliza archivos JSON como fuente de datos y sigue el patrón de diseño Repository para facilitar el cambio de fuente de datos.

## 🚀 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado lo siguiente:

- **Node.js**: Versión 18.x o superior
- **npm**: Versión 8.x o superior (incluido con Node.js)

**Nota**: No se requiere ninguna base de datos adicional, ya que el proyecto utiliza archivos JSON para almacenar los datos.

## 📦 Instalación

1. **Clonar el repositorio** (o asegúrate de estar en el directorio del proyecto):
   ```bash
   cd topicos
   ```

2. **Instalar las dependencias**:
   ```bash
   npm install
   ```

3. **Configuración de datos**:
   
   El proyecto crea automáticamente un directorio `data/` en la raíz del proyecto para almacenar las notas en formato JSON. No es necesario configurar nada adicional.

   Los datos se almacenan en el archivo `data/notes.json` que se crea automáticamente la primera vez que ejecutes la aplicación.

## 🏃 Ejecución del Proyecto

### Modo Desarrollo

Para ejecutar el proyecto en modo desarrollo con recarga automática:

```bash
npm run start:dev
```

El servidor estará disponible en `http://localhost:3000`

### Modo Producción

Para compilar y ejecutar el proyecto en modo producción:

```bash
# Compilar
npm run build

# Ejecutar
npm run start:prod
```

### Otros comandos disponibles

```bash
# Iniciar en modo debug
npm run start:debug

# Compilar el proyecto
npm run build

# Ejecutar pruebas unitarias
npm test

# Ejecutar pruebas con cobertura
npm run test:cov

# Ejecutar pruebas end-to-end
npm run test:e2e

# Formatear código
npm run format

# Ejecutar linter
npm run lint
```

## 📚 Documentación de la API

Una vez que el servidor esté ejecutándose, puedes acceder a la documentación interactiva de Swagger en:

**http://localhost:3000/api**

La documentación de Swagger incluye:
- Descripción de todos los endpoints
- Esquemas de los DTOs (Data Transfer Objects)
- Capacidad de probar los endpoints directamente desde el navegador

## 🔌 Endpoints Disponibles

### Obtener todas las notas (sin contenido)

```
GET /notes
```

**Query Parameters:**
- `orderBy` (opcional): Campo por el cual ordenar (`title`, `createdAt`, `modifiedAt`)
- `order` (opcional): Orden de clasificación (`asc`, `desc`). Por defecto: `asc`

**Ejemplo:**
```
GET /notes?orderBy=title&order=asc
GET /notes?orderBy=createdAt&order=desc
```

**Respuesta:** Array de notas sin el campo `content`

### Obtener una nota específica (con contenido)

```
GET /notes/:id
```

**Ejemplo:**
```
GET /notes/1234567890-abc123
```

**Respuesta:** Objeto nota completo incluyendo `content`

### Crear una nueva nota

```
POST /notes
```

**Body (JSON):**
```json
{
  "title": "Título de la nota",
  "content": "Contenido de la nota"
}
```

**Respuesta:** Nota creada con todos sus datos incluyendo el ID único generado

### Actualizar una nota

```
PATCH /notes/:id
```

**Body (JSON):**
```json
{
  "title": "Nuevo título",
  "content": "Nuevo contenido"
}
```

**Nota:** Puedes actualizar solo el título, solo el contenido, o ambos. El campo `modifiedAt` se actualiza automáticamente.

### Eliminar nota(s)

El endpoint de eliminación soporta dos formas:

**1. Eliminar una nota por ID en la URL:**
```
DELETE /notes/:id
```

**2. Eliminar múltiples notas por IDs en el body:**
```
DELETE /notes
```

**Body (JSON):**
```json
{
  "ids": ["id1", "id2", "id3"]
}
```

**Respuesta:**
```json
{
  "deletedCount": 2
}
```

## 🏗️ Estructura del Proyecto

```
src/
├── notes/
│   ├── dto/                      # Data Transfer Objects
│   │   ├── create-note.dto.ts
│   │   ├── update-note.dto.ts
│   │   └── note-response.dto.ts
│   ├── interfaces/               # Interfaces y tipos
│   │   └── note.interface.ts
│   ├── repositories/             # Implementación del patrón Repository
│   │   ├── note.repository.ts
│   │   └── note.repository.spec.ts
│   ├── schemas/                  # Esquemas de MongoDB
│   │   └── note.schema.ts
│   ├── notes.controller.ts       # Controlador REST
│   ├── notes.controller.spec.ts  # Pruebas del controlador
│   ├── notes.service.ts          # Lógica de negocio
│   ├── notes.service.spec.ts     # Pruebas del servicio
│   └── notes.module.ts           # Módulo de NestJS
├── app.module.ts                 # Módulo principal
└── main.ts                       # Punto de entrada de la aplicación
```

## 🧪 Pruebas

El proyecto incluye pruebas unitarias y de integración:

- **Pruebas Unitarias**: Para servicios y repositorios
- **Pruebas de Integración (E2E)**: Para los endpoints completos

Ejecutar todas las pruebas:
```bash
npm test
```

Ejecutar pruebas con cobertura:
```bash
npm run test:cov
```

## 🎯 Características Implementadas

✅ CRUD completo de notas
✅ Dos endpoints para obtener notas:
   - Listado general (sin contenido, con filtrado y ordenamiento)
   - Búsqueda específica por ID (con todos los datos)
✅ Filtrado y ordenamiento por:
   - Título (orden alfabético)
   - Fecha de creación
   - Fecha de modificación
✅ Actualización automática de `modifiedAt` al modificar una nota
✅ Eliminación de una o múltiples notas
✅ Patrón Repository para fácil cambio de fuente de datos
✅ Validación de datos con class-validator
✅ Documentación con Swagger
✅ JSDoc en todas las funciones y métodos
✅ Pruebas unitarias y de integración

## 🔧 Tecnologías Utilizadas

- **NestJS**: Framework para Node.js
- **TypeScript**: Lenguaje de programación
- **Archivos JSON**: Almacenamiento de datos en formato JSON
- **Node.js FS**: Módulo nativo de Node.js para manejo de archivos
- **Swagger**: Documentación de API
- **Jest**: Framework de pruebas
- **class-validator**: Validación de DTOs
- **class-transformer**: Transformación de objetos

## 📝 Notas de Desarrollo

### Patrón Repository

El proyecto implementa el patrón Repository mediante la interfaz `INoteRepository`, lo que permite cambiar fácilmente la fuente de datos (archivos JSON, archivos de texto, base de datos) sin modificar la lógica de negocio. Actualmente utiliza archivos JSON para el almacenamiento.

### Actualización Automática de Fechas

El campo `modifiedAt` se actualiza automáticamente cada vez que se modifica una nota. Solo los campos `title` y `content` pueden ser editados por el usuario.

### Identificadores Únicos

Cada nota tiene un identificador único (`id`) generado automáticamente que se utiliza para todas las operaciones que requieren identificación.

## 👥 Autores

Proyecto desarrollado para el curso de Tópicos Especiales de Programación - NRC 15997.

## 📄 Licencia

Este proyecto es privado y está destinado únicamente para fines académicos.
