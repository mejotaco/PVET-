# PVET
HAZ CTRL + SHIFT + V PARA VISUALIZARLO MEJOR


PVET es una aplicación móvil desarrollada con React Native y Expo orientada a la gestión de mascotas dentro de un entorno veterinario. El sistema permite registrar animales, visualizar su información, administrar citas y mantener un seguimiento del estado de cada mascota.

El proyecto está estructurado de forma modular para facilitar el mantenimiento, la escalabilidad y la colaboración entre desarrolladores.

---

# Descripción del proyecto

La aplicación permite gestionar información relacionada con mascotas mediante:

* Registro y administración de mascotas
* Visualización de perfiles de animales
* Gestión de citas
* Registro de información de salud
* Personalización de temas visuales
* Navegación mediante pestañas

El sistema utiliza componentes reutilizables y una arquitectura organizada para mejorar la mantenibilidad del código.

---

# Tecnologías utilizadas

* React Native
* Expo
* TypeScript
* Context API
* Node.js
* npm
* Git
* GitHub

---

# Requisitos previos

Antes de ejecutar o contribuir al proyecto es necesario instalar las siguientes herramientas.

## 1. Node.js

Instalar Node.js versión 18 o superior.

[https://nodejs.org](https://nodejs.org)

Verificar instalación:

```
node -v
npm -v
```

---

## 2. Git

Instalar Git para el control de versiones.

[https://git-scm.com](https://git-scm.com)

Verificar instalación:

```
git --version
```

---

## 3. Expo CLI

Instalar Expo CLI de forma global:

```
npm install -g expo-cli
```

Verificar instalación:

```
expo --version
```

---

## 4. Editor de código

Se recomienda utilizar Visual Studio Code.

[https://code.visualstudio.com](https://code.visualstudio.com)

Extensiones recomendadas:

* ESLint
* Prettier
* TypeScript
* React Native Tools

---

## 5. Expo Go

Para ejecutar la aplicación en un dispositivo móvil.

Android:
[https://play.google.com/store/apps/details?id=host.exp.exponent](https://play.google.com/store/apps/details?id=host.exp.exponent)

iOS:
[https://apps.apple.com/app/expo-go/id982107779](https://apps.apple.com/app/expo-go/id982107779)

---

# Instalación del proyecto

## 1. Clonar el repositorio

```
git clone https://github.com/mejotaco/PVET.git
```

---

## 2. Entrar al directorio del proyecto

```
cd PVET
```

---

## 3. Instalar dependencias

```
npm install
```

---

## 4. Ejecutar el proyecto

```
npm start
```

o

```
npx expo start
```

---

# Ejecución de la aplicación

Una vez iniciado el proyecto se abrirá el panel de Expo.

Opciones disponibles:

### Ejecutar en celular

1. Abrir la aplicación Expo Go.
2. Escanear el código QR mostrado en la terminal o navegador.

### Ejecutar en Android

```
npm run android
```

### Ejecutar en iOS (solo macOS)

```
npm run ios
```

---

# Estructura del proyecto

```
PVET
│
├── app
│   ├── (tabs)
│   │   ├── index.tsx
│   │   ├── pets.tsx
│   │   ├── appointments.tsx
│   │   ├── health.tsx
│   │   ├── settings.tsx
│   │
│   └── _layout.tsx
│
├── components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── FormField.tsx
│
├── constants
│   └── theme.ts
│
├── hooks
│   └── useTheme.ts
│
└── README.md
```

---

# Flujo de trabajo para colaboradores

## 1. Actualizar repositorio

```
git pull origin main
```

---

## 2. Crear una rama de trabajo

```
git checkout -b nombre-de-la-rama
```

Ejemplo:

```
git checkout -b feature-mascotas
```

---

## 3. Verificar cambios

```
git status
```

---

## 4. Agregar archivos

```
git add .
```

Agregar archivo específico:

```
git add nombre-del-archivo
```

---

## 5. Crear commit

```
git commit -m "Descripción clara del cambio"
```

Ejemplo:

```
git commit -m "Mejoras en manejo de vistas y soporte para modo oscuro"
```

---

## 6. Subir cambios

```
git push origin nombre-de-la-rama
```

Ejemplo:

```
git push origin feature-mascotas
```

---

## 7. Crear Pull Request

1. Ir al repositorio en GitHub.
2. Seleccionar la rama subida.
3. Crear un Pull Request hacia main.
4. Esperar revisión antes de fusionar los cambios.

---

# Convenciones de commits

Se recomienda utilizar mensajes claros.

Ejemplos:

```
feat: agregar registro de mascotas
fix: corregir error en vista de salud
style: mejorar estilos de componentes
refactor: reorganizar estructura del proyecto
docs: actualizar documentación
```

---

# Actualizar dependencias

```
npm update
```

---

# Reinstalación limpia (si hay errores)

Eliminar dependencias y reinstalar:

```
rm -rf node_modules
rm package-lock.json
npm install
```

---

# Licencia

Este proyecto se distribuye bajo la licencia MIT.
