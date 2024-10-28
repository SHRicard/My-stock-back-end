# My-stock-back-end 🛠️

## Instalación

### Prerrequisitos
Antes de comenzar, asegúrate de tener instalados los siguientes componentes en tu sistema:

- **Node.js** (versión 14 o superior)
- **npm** (viene incluido con Node.js)
- **Git**

### Clonar el Repositorio
Si aún no lo has hecho, clona el repositorio vacío desde GitHub:

git clone https://github.com/tu-usuario/my-stock-back-end.git

### Navegar al Directorio del Proyecto
cd my-stock-back-end


### Instalar las Dependencias
npm install

## ⚙️ Configuración

Crea un archivo `.env` en la raíz del proyecto con las variables necesarias. A continuación se muestra un ejemplo de las variables que podrías necesitar:

Puerto en el que correrá la aplicación
PORT=3000

Configuración de la base de datos
DB_HOST=localhost DB_PORT=3306 DB_USER=tu_usuario DB_PASS=tu_contraseña DB_NAME=my_stock_db

URL del front-end
FRONTEND_URL=http://localhost:4200

**Nota**: Asegúrate de reemplazar los valores de ejemplo con los correspondientes a tu entorno.

## 📜 Scripts Disponibles

- `npm run start`: Inicia la aplicación en modo producción.
- `npm run dev`: Inicia la aplicación en modo desarrollo con recarga en caliente.
- `npm run build`: Compila el código TypeScript a JavaScript.
- `npm run lint`: Analiza el código en busca de errores y problemas de estilo.
- `npm run test`: Ejecuta las pruebas unitarias.
- `npm run migrate`: Ejecuta las migraciones de la base de datos.

## 🚀 Ejecución en Modo Desarrollo

Para iniciar la aplicación en modo desarrollo, utiliza el siguiente comando:

npm run dev

Esto iniciará el servidor con recarga en caliente, permitiendo ver los cambios en tiempo real sin reiniciar manualmente.

## 🗃️ Estructura del Proyecto

my-stock-back-end/ ├── src/ │ ├── controllers/ │ ├── models/ │ ├── repositories/ │ ├── datasources/ │ ├── middlewares/ │ ├── services/ │ ├── index.ts │ └── application.ts ├── tests/ ├── .env ├── .gitignore ├── package.json ├── tsconfig.json └── README.md

- **controllers/**: Contiene los controladores que manejan las solicitudes HTTP.
- **models/**: Define los modelos de datos de la aplicación.
- **repositories/**: Maneja la interacción con la base de datos.
- **datasources/**: Configuración de las fuentes de datos.
- **middlewares/**: Middleware personalizados para la aplicación.
- **services/**: Servicios que encapsulan la lógica de negocio.
- **index.ts**: Punto de entrada de la aplicación.
- **application.ts**: Configuración principal de la aplicación LoopBack.

## 🧪 Pruebas

Para ejecutar las pruebas unitarias, utiliza el siguiente comando:

npm run test

**Tip**: Asegúrate de tener configurada una base de datos de pruebas o utiliza mocks para las pruebas.

## 🌐 API Endpoints Disponibles

A continuación, se detallan los endpoints disponibles en la API:

- `GET /api/stocks`: Obtiene la lista de acciones.
- `POST /api/stocks`: Crea una nueva acción.
- `GET /api/stocks/{id}`: Obtiene detalles de una acción específica.
- `PUT /api/stocks/{id}`: Actualiza una acción existente.
- `DELETE /api/stocks/{id}`: Elimina una acción.

### Documentación de la API

Puedes acceder a la documentación interactiva de la API generada por LoopBack4 en:

http://localhost:3000/explorer

**Nota**: Asegúrate de que la aplicación esté corriendo para acceder al explorador de API.

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, sigue estos pasos para contribuir:

1. Haz un Fork del Repositorio.
2. Crea una Rama para tu Feature:

git checkout -b feature/nueva-feature

3. Realiza tus Cambios y Haz Commit:

git commit -m "Añadir nueva feature"

markdown
Copiar código

4. Empuja la Rama al Repositorio Remoto:

git push origin feature/nueva-feature

5. Abre un Pull Request en GitHub.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

## 📞 Contacto

Para cualquier duda o comentario, puedes contactarme a través de [ricardo.23.09.2022@gmail.com](mailto:ricardo.23.09.2022@gmail.com).
