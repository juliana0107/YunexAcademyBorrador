# BACKLOG REFINADO — ESCUELA DE FORMACIÓN

## Introducción

Este documento es el resultado del refinamiento del backlog de la **Escuela de Formación**, una plataforma interna de gestión de capacitaciones para los colaboradores de la empresa. La solución permite almacenar cursos, gestionar videos, administrar evaluaciones dinámicas, controlar permisos por roles, proteger el contenido contra capturas no autorizadas y **visualizar indicadores de progreso y desempeño mediante un dashboard operacional**.

El backlog original plantea dos actores principales: **Administrador** (gestiona contenido, usuarios, roles, evaluaciones y permisos) y **Estudiante** (trabajador que consume capacitaciones y presenta evaluaciones). Esta versión incorpora un tercer bloque funcional: el **Dashboard**, que consume datos de todas las historias anteriores para mostrar métricas de avance, desempeño y uso de la plataforma.

El alcance incluye la creación de capacitaciones con submódulos, videos, evaluaciones con múltiples tipos de preguntas, un sistema de protección de contenido y un dashboard con indicadores operacionales para el administrador.

---

## Objetivo

Refinar el backlog de la Escuela de Formación para:

- Detectar y resolver ambigüedades funcionales en la gestión de capacitaciones, evaluaciones, permisos y dashboard.
- Modelar las entidades de negocio: Capacitación, Submódulo, Video, Pregunta, Evaluación, Intento, Usuario, Rol, Permiso, ProgresoVideo, IntentoCaptura.
- Definir reglas de negocio claras para creación de contenido, asignación de permisos, evaluación y visualización de indicadores.
- Establecer criterios de aceptación verificables.
- Descomponer el trabajo en actividades técnicas ejecutables.
- Estimar el esfuerzo por área.
- Priorizar el alcance del MVP frente a funcionalidades opcionales.
- Justificar las decisiones funcionales y técnicas adoptadas.
- Stack tecnológico más adecuado para cumplir con los requisitos de interactividad, seguridad y buenas prácticas.

---

## Alcance del MVP

Las historias de usuario que componen el alcance mínimo son:

- **HU-001** Gestión de Capacitaciones y Submódulos.
- **HU-002** Gestión de Videos y Visualización Secuencial.
- **HU-003** Gestión de Evaluaciones Dinámicas.
- **HU-004** Gestión de Usuarios, Roles y Permisos.
- **HU-005** Protección de Contenido (bloqueo de capturas).
- **HU-006** Dashboard Operacional.

Las funcionalidades adicionales (gamificación, notificaciones, exportación de reportes, app móvil) quedan fuera del alcance del MVP y se documentan como mejoras futuras.

---

# HU-001 — Gestión de Capacitaciones y Submódulos

## Historia de Usuario

- **Como** administrador
- **Quiero** crear y gestionar capacitaciones con sus submódulos
- **Para** organizar el contenido formativo de la empresa de manera estructurada.

---

## 1. Análisis

### 1.1 Ambigüedades

- El verbo "gestionar" no define el alcance real. Puede implicar crear, consultar, actualizar, publicar, archivar o eliminar. El backlog no aclara cuál de estas operaciones es obligatoria.
- No se especifica qué atributos componen una capacitación (título, descripción, imagen de portada, categoría, duración estimada).
- No se define si un submódulo puede contener otros submódulos (anidamiento) o solo es un nivel plano.
- No se aclara si una capacitación puede tener cero submódulos (solo título y descripción) o si es obligatorio al menos uno.
- No se define el estado de una capacitación: ¿borrador, publicada, archivada? ¿El estudiante ve capacitaciones en borrador?
- No se especifica si el orden de los submódulos es configurable o se asigna automáticamente por fecha de creación.
- No se define si el sidebar se genera automáticamente al publicar la capacitación o si requiere una acción manual.
- No se aclara qué sucede con los videos existentes si se elimina un submódulo.
- No se define el formato de errores ni el comportamiento de la API ante conflictos.

### 1.2 Dependencias

- Es la historia base del sistema. No depende de ninguna otra historia funcional.
- De ella dependen directamente:
  - **HU-002 Gestión de Videos**, porque los videos se asocian a capacitaciones o submódulos.
  - **HU-003 Gestión de Evaluaciones**, porque las evaluaciones se asocian a capacitaciones.
  - **HU-004 Gestión de Usuarios y Permisos**, porque los permisos determinan qué capacitaciones ve cada rol.
  - **HU-006 Dashboard**, porque los indicadores de capacitaciones se calculan sobre esta entidad.
- Dependencia transversal: módulo de autenticación y autorización por roles (HU-000 Auth).
- Dependencia transversal: contrato de error estandarizado y contrato de paginación.

### 1.3 Riesgos

- **R-01**: Si una capacitación puede publicarse sin submódulos ni videos, el estudiante vería contenido vacío, rompiendo la experiencia.
- **R-02**: Si el sidebar no se actualiza automáticamente al crear una capacitación, el administrador tendría que refrescar manualmente, generando confusión.
- **R-03**: Si el orden de los submódulos no es configurable, el contenido podría presentarse en un orden no pedagógico.
- **R-04**: Si no se valida el título único, podrían crearse capacitaciones duplicadas.
- **R-05**: Si el administrador elimina un submódulo con videos asociados, se perderían los archivos sin advertencia.
- **R-06**: Si cualquier usuario autenticado puede crear capacitaciones, se rompe la segregación de funciones.

### 1.4 Supuestos

- Cada capacitación tiene un **título único**, descripción, estado (BORRADOR, PUBLICADA, ARCHIVADA) y fecha de creación.
- Cada capacitación puede tener **cero o más submódulos**. Si no tiene submódulos, la capacitación se muestra como un bloque único de contenido.
- Un submódulo tiene título, descripción, orden de presentación (secuencial) y puede contener uno o más videos.
- El sidebar se genera automáticamente al publicar la capacitación, mostrando la capacitación y sus submódulos en orden.
- Solo el rol **ADMINISTRADOR** puede crear, editar, publicar o archivar capacitaciones.
- El estado por defecto al crear una capacitación es **BORRADOR**.
- Las capacitaciones en estado BORRADOR no son visibles para estudiantes.
- El contrato de error estándar sigue el formato `code`, `message`, `details`.
- Supuesto transversal: todos los listados usan paginación estándar con `page` y `size`.
- Supuesto transversal: el orden por defecto del listado de capacitaciones es por fecha de creación descendente.

---

## 2. Refinamiento

### 2.1 Entidades involucradas

- **Capacitación**: entidad principal. Representa un curso formativo completo.
- **Submódulo**: entidad que agrupa contenido dentro de una capacitación.
- **Video**: entidad que contiene el material audiovisual (detallada en HU-002).
- **Usuario**: administrador que gestiona el contenido (detallada en HU-004).

### 2.2 Reglas de negocio

- **RN-01**: El título de una capacitación debe ser único en el sistema.
- **RN-02**: Una capacitación debe tener título y descripción obligatorios.
- **RN-03**: Solo usuarios con rol ADMINISTRADOR pueden crear, editar, publicar o archivar capacitaciones.
- **RN-04**: Una capacitación en estado BORRADOR no es visible para estudiantes.
- **RN-05**: Al publicar una capacitación, se genera automáticamente la entrada en el sidebar con sus submódulos en orden.
- **RN-06**: El orden de los submódulos es configurable mediante un campo `orden` entero.
- **RN-07**: No se puede eliminar un submódulo que contenga videos asociados. Primero deben reasignarse o eliminarse.
- **RN-08**: Una capacitación archivada no es visible para estudiantes, pero se conserva para trazabilidad.
- **RN-09**: Toda operación de escritura registra `createdBy`, `updatedBy`, `createdAt`, `updatedAt`.
- **RN-10**: El título tiene máximo 150 caracteres y la descripción máximo 1000 caracteres.
- **RN-11**: El listado de capacitaciones se devuelve paginado, con orden por defecto por fecha de creación descendente.
- **RN-12**: Los endpoints POST y PATCH son no idempotentes. PUT es idempotente.

### 2.3 Estados

- **BORRADOR**: capacitación en construcción, no visible para estudiantes.
- **PUBLICADA**: capacitación visible para estudiantes, con sidebar generado.
- **ARCHIVADA**: capacitación retirada, visible solo para administradores.

### 2.4 Relaciones

- Una Capacitación tiene muchos Submódulos.
- Un Submódulo pertenece a una Capacitación.
- Un Submódulo tiene muchos Videos.
- Un Usuario (ADMINISTRADOR) gestiona muchas Capacitaciones.

### 2.5 Flujo funcional

1. El administrador se autentica y accede al módulo de capacitaciones.
2. El administrador crea una nueva capacitación con título y descripción. El sistema asigna estado BORRADOR.
3. El sistema pregunta si desea agregar un submódulo. El administrador puede agregar uno o varios.
4. Cada submódulo se registra con título, descripción y orden.
5. El administrador agrega videos a cada submódulo (flujo detallado en HU-002).
6. El administrador publica la capacitación. El sistema cambia el estado a PUBLICADA y genera la entrada en el sidebar.
7. Si el administrador archiva la capacitación, el sistema cambia el estado a ARCHIVADA y la retira del sidebar visible para estudiantes.

---

## 3. Criterios de aceptación

- **CA-01**: Dado un administrador autenticado, cuando crea una capacitación con título y descripción válidos, entonces el sistema la registra con estado BORRADOR y responde 201.
- **CA-02**: Dado un administrador autenticado, cuando intenta crear una capacitación con un título ya existente, entonces el sistema rechaza con 409.
- **CA-03**: Dado un administrador autenticado, cuando intenta crear una capacitación sin título o sin descripción, entonces el sistema rechaza con 400.
- **CA-04**: Dado un administrador autenticado, cuando agrega un submódulo a una capacitación existente, entonces el sistema lo registra y responde 201.
- **CA-05**: Dado un administrador autenticado, cuando publica una capacitación con al menos un submódulo y un video, entonces el sistema cambia el estado a PUBLICADA y genera la entrada en el sidebar.
- **CA-06**: Dado un administrador autenticado, cuando intenta publicar una capacitación sin submódulos ni videos, entonces el sistema rechaza con 409 y un mensaje descriptivo.
- **CA-07**: Dado un administrador autenticado, cuando intenta eliminar un submódulo con videos asociados, entonces el sistema rechaza con 409.
- **CA-08**: Dado un administrador autenticado, cuando reordena los submódulos de una capacitación, entonces el sistema persiste el nuevo orden y responde 200.
- **CA-09**: Dado un administrador autenticado, cuando archiva una capacitación publicada, entonces el sistema cambia el estado a ARCHIVADA y la retira del sidebar de estudiantes.
- **CA-10**: Dado un usuario con rol ESTUDIANTE, cuando intenta crear una capacitación, entonces el sistema rechaza con 403.
- **CA-11**: Dado un administrador autenticado, cuando consulta el listado de capacitaciones con `page=2&size=10`, entonces el sistema devuelve los 10 registros correspondientes junto con el total y los metadatos de paginación.
- **CA-12**: Dado un administrador autenticado, cuando intenta crear una capacitación con título mayor a 150 caracteres o descripción mayor a 1000 caracteres, entonces el sistema rechaza con 400.

---

## 4. Descomposición técnica

### 4.1 Backend

- Definir el modelo Capacitación con los atributos: id, titulo, descripcion, estado, createdBy, updatedBy, createdAt, updatedAt (S).
- Definir el modelo Submódulo con los atributos: id, capacitacionId, titulo, descripcion, orden, createdAt, updatedAt (S).
- Definir el enum de estados de capacitación: BORRADOR, PUBLICADA, ARCHIVADA (XS).
- Crear la migración de la tabla capacitaciones con restricción UNIQUE sobre titulo e índices sobre estado y fechaCreacion. Incluir migración de rollback (S).
- Crear la migración de la tabla submodulos con clave foránea a capacitaciones e índice compuesto sobre (capacitacionId, orden) (S).
- Implementar el endpoint GET /api/capacitaciones con paginación, filtros por estado y ordenamiento (M).
- Implementar el endpoint GET /api/capacitaciones/:id con detalle y submódulos ordenados (S).
- Implementar el endpoint POST /api/capacitaciones con validación de campos obligatorios, longitudes y unicidad (M).
- Implementar el endpoint PUT /api/capacitaciones/:id con validaciones y comportamiento idempotente (M).
- Implementar el endpoint POST /api/capacitaciones/:id/submodulos para agregar submódulos (S).
- Implementar el endpoint PUT /api/capacitaciones/:id/submodulos/:subId para editar submódulos (S).
- Implementar el endpoint DELETE /api/capacitaciones/:id/submodulos/:subId con validación de videos asociados (S).
- Implementar el endpoint PATCH /api/capacitaciones/:id/estado con validación de transiciones (S).
- Implementar el endpoint PATCH /api/capacitaciones/:id/submodulos/reordenar con validación de orden (S).
- Implementar la capa de servicio con las reglas RN-01 a RN-12 (M).
- Reutilizar el middleware de manejo de errores y el helper de paginación (XS).

### 4.2 Frontend

- Crear la vista de listado de capacitaciones con paginación, filtros y acciones (M).
- Crear el formulario de creación/edición de capacitación con validación de longitudes (M).
- Crear el componente de gestión de submódulos con drag-and-drop para reordenar (M).
- Crear la vista de detalle con previsualización del sidebar (S).
- Implementar el consumo de endpoints con Axios y manejo centralizado de errores (M).
- Implementar estados de carga, vacío y error (S).

### 4.3 Persistencia

- Crear índice UNIQUE sobre titulo de capacitaciones (XS).
- Crear índice compuesto sobre (capacitacionId, orden) en submodulos (XS).
- Crear seed inicial de capacitaciones de ejemplo con submódulos (S).

### 4.4 Seguridad

- Reutilizar middleware de autenticación JWT (XS).
- Implementar autorización que restrinja creación/edición/publicación a ADMINISTRADOR (S).

### 4.5 Testing

- Pruebas unitarias del servicio con RN-01 a RN-12 (M).
- Pruebas de integración de los endpoints con códigos 201, 200, 400, 401, 403, 404, 409 (M).
- Pruebas de componente del frontend para listado y formulario (M).
- Smoke test end-to-end de creación y publicación de capacitación (S).
- Umbral de cobertura mínimo del 80% en la capa de servicio (XS).

### 4.6 Docker

- Reutilizar configuración de healthcheck, depends_on y arranque automático (XS).
- Verificar que migraciones y seeds corran automáticamente al iniciar (S).

---

## 5. Estimación

- **Backend**: M (modelos S, migraciones S, endpoints M, servicio M).
- **Frontend**: M (listado M, formulario M, submódulos M, detalle S).
- **Persistencia**: S (índices XS, seeds S).
- **Seguridad**: S (auth XS, autorización S).
- **Testing**: M (unitarias M, integración M, componente M, smoke S).
- **Docker**: XS.

---

## 6. Priorización

### MVP

- Modelos Capacitación y Submódulo, enums y migraciones con rollback.
- Endpoints CRUD de capacitaciones y submódulos.
- Validaciones de título único, longitudes y campos obligatorios.
- Autenticación y autorización por rol.
- Publicación con generación de sidebar.
- Reordenamiento de submódulos.
- Frontend funcional: listado, formulario y detalle.
- Pruebas unitarias y de integración.
- Docker con arranque automático.

### Funcionalidades opcionales

- Drag-and-drop para reordenar submódulos.
- Vista previa del sidebar en el detalle.
- Seeds adicionales para pruebas.

### Mejoras futuras

- Categorías de capacitaciones.
- Etiquetas (tags).
- Imagen de portada.
- Búsqueda de texto completo.
- Duplicar capacitación existente.

---

## 7. Justificación

### 7.1 Actividades agregadas

- Se agregó la entidad Submódulo como entidad propia, porque el enunciado menciona explícitamente la posibilidad de crear submódulos dentro de una capacitación.
- Se agregó la validación de título único y longitudes máximas.
- Se agregó el reordenamiento de submódulos con campo `orden`.
- Se agregó la paginación estándar en el listado.

### 7.2 Actividades eliminadas

- Se eliminó la gestión de categorías y etiquetas en el MVP.
- Se eliminó la búsqueda de texto completo en el MVP.
- Se eliminó la imagen de portada en el MVP.

### 7.3 Decisiones tomadas

- Se decidió que las capacitaciones tengan estado BORRADOR, PUBLICADA y ARCHIVADA.
- Se decidió que el sidebar se genere automáticamente al publicar.
- Se decidió que no se pueda publicar sin contenido mínimo.
- Se decidió que no se pueda eliminar un submódulo con videos asociados.

---

# HU-002 — Gestión de Videos y Visualización Secuencial

## Historia de Usuario

- **Como** administrador
- **Quiero** agregar videos a las capacitaciones y submódulos
- **Para** que los estudiantes puedan visualizar el contenido formativo.

- **Como** estudiante
- **Quiero** visualizar los videos de forma secuencial
- **Para** completar la capacitación sin omitir contenido.

---

## 1. Análisis

### 1.1 Ambigüedades

- No se define el formato de video permitido (MP4, WebM, streaming externo).
- No se aclara si el video se sube al servidor o se referencia mediante URL externa.
- No se define el tamaño máximo de archivo.
- No se especifica si el estudiante debe ver el video completo para desbloquear el siguiente.
- No se define qué sucede si el estudiante sale de la aplicación durante un video.
- No se aclara si el progreso se guarda por video, por submódulo o por capacitación.
- No se define si hay tiempo mínimo de visualización o basta con reproducir hasta el final.
- No se especifica si se registra el tiempo de visualización o solo un booleano.
- No se define si el video tiene transcripción o subtítulos.
- No se aclara si los videos se pueden reemplazar sin perder el progreso.

### 1.2 Dependencias

- Depende de HU-001 Gestión de Capacitaciones.
- Depende de HU-005 Protección de Contenido.
- Es prerequisito de HU-003 Evaluaciones.
- Consumida por HU-006 Dashboard.
- Dependencia transversal: HU-000 Auth.

### 1.3 Riesgos

- **R-01**: Si el video se sirve como estático público, cualquiera con la URL accede.
- **R-02**: Si no se valida visualización completa, el estudiante podría saltar al final.
- **R-03**: Si el progreso se pierde al salir, el estudiante tendría que empezar de nuevo.
- **R-04**: Si los videos se suben sin límite, el servidor podría llenarse.
- **R-05**: Si el video se reemplaza, los estudiantes que ya lo vieron perderían progreso.
- **R-06**: Si no se registra progreso por video, no se sabe qué falta.

### 1.4 Supuestos

- Los videos se almacenan localmente en fase MVP y se migrarán a S3/VdoCipher cuando haya aval.
- El formato permitido es MP4 (H.264).
- El tamaño máximo por video es de 500 MB.
- El progreso se registra por video con un booleano `completado`.
- Se marca completado al alcanzar el 95% de reproducción.
- La navegación es secuencial: no se desbloquea el siguiente hasta completar el actual.
- Al salir, los videos completados se conservan; el video en curso se reinicia.
- Se registra `fechaCompletado` por video.
- Se implementa un `StorageService` abstracto con implementación local y futura S3/VdoCipher.
- Los videos se sirven con endpoint autenticado que valida permisos y soporta HTTP Range.
- Se aplica watermark básico con FFmpeg al subir (best effort).

---

## 2. Refinamiento

### 2.1 Entidades involucradas

- **Video**: entidad principal.
- **Capacitación**: entidad contenedora.
- **Submódulo**: entidad contenedora opcional.
- **ProgresoVideo**: entidad que registra estado de visualización.
- **StorageService**: servicio abstracto de almacenamiento.

### 2.2 Reglas de negocio

- **RN-01**: Un video debe estar asociado a una capacitación o a un submódulo.
- **RN-02**: El título del video es obligatorio.
- **RN-03**: El formato permitido es MP4 (H.264).
- **RN-04**: El tamaño máximo por archivo es de 500 MB.
- **RN-05**: Un video se marca como completado al 95% de reproducción.
- **RN-06**: No se puede acceder al siguiente video sin completar el anterior.
- **RN-07**: El progreso se registra por estudiante y video.
- **RN-08**: Al reemplazar un video, los progresos existentes se conservan.
- **RN-09**: Solo ADMINISTRADOR puede subir, editar o eliminar videos.
- **RN-10**: El estudiante no puede descargar ni acceder a la URL directa.
- **RN-11**: El video se sirve con endpoint autenticado y soporte de Range.
- **RN-12**: El acceso se valida contra permisos del rol.
- **RN-13**: Se aplica watermark básico con el ID del usuario (fase local).

### 2.3 Estados

- **PENDIENTE**: video no iniciado.
- **EN_PROGRESO**: video iniciado pero no completado.
- **COMPLETADO**: video visto al 95% o más.

### 2.4 Relaciones

- Un Video pertenece a una Capacitación o Submódulo.
- Un Estudiante tiene muchos ProgresosVideo.
- Un Video tiene muchos ProgresosVideo.

### 2.5 Flujo funcional

1. El administrador agrega un video a una capacitación o submódulo.
2. El sistema valida formato y tamaño, aplica watermark y almacena el video.
3. El estudiante accede y ve los videos en orden.
4. El sistema muestra el primer video pendiente. Al reproducirlo, pasa a EN_PROGRESO.
5. Al alcanzar 95%, se marca COMPLETADO y se desbloquea el siguiente.
6. Si el estudiante sale, el video en curso queda en EN_PROGRESO; los completados se conservan.
7. Al completar todos los videos, se desbloquea la evaluación (HU-003).

---

## 3. Criterios de aceptación

- **CA-01**: Dado un administrador autenticado, cuando sube un video MP4 de menos de 500 MB, entonces el sistema lo almacena y responde 201.
- **CA-02**: Dado un administrador autenticado, cuando intenta subir un formato no permitido, entonces el sistema rechaza con 400.
- **CA-03**: Dado un administrador autenticado, cuando intenta subir un archivo mayor a 500 MB, entonces el sistema rechaza con 413.
- **CA-04**: Dado un estudiante autenticado, cuando reproduce un video hasta el 95%, entonces el sistema lo marca COMPLETADO y desbloquea el siguiente.
- **CA-05**: Dado un estudiante autenticado, cuando intenta acceder a un video posterior sin completar el anterior, entonces el sistema rechaza con 403.
- **CA-06**: Dado un estudiante autenticado, cuando sale durante un video, entonces el progreso de ese video queda EN_PROGRESO y los completados se conservan.
- **CA-07**: Dado un estudiante autenticado, cuando completa todos los videos de una capacitación, entonces el sistema desbloquea la evaluación.
- **CA-08**: Dado un administrador autenticado, cuando reemplaza un video, entonces el sistema conserva el progreso de los estudiantes que lo completaron.
- **CA-09**: Dado un estudiante autenticado, cuando intenta descargar el video desde la URL directa, entonces el sistema deniega el acceso.
- **CA-10**: Dado un estudiante autenticado, cuando solicita un rango de bytes al endpoint de streaming, entonces el sistema responde 206 con el fragmento solicitado.

---

## 4. Descomposición técnica

### 4.1 Backend

- Definir el modelo Video con id, capacitacionId, submoduloId, titulo, descripcion, rutaArchivo, tamanoBytes, duracion, mimeType, orden, createdAt, updatedAt (S).
- Definir el modelo ProgresoVideo con id, usuarioId, videoId, estado, fechaCompletado, createdAt, updatedAt (S).
- Crear migración de tabla videos con FK a capacitaciones y submodulos, índices sobre capacitacionId y submoduloId (S).
- Crear migración de tabla progreso_videos con UNIQUE (usuarioId, videoId) (S).
- Implementar `StorageService` con interfaz abstracta y `LocalStorageService` (M).
- Implementar endpoint POST /api/videos con validación de formato, tamaño y watermark FFmpeg (M).
- Implementar endpoint GET /api/videos/:id/stream con auth, validación de permisos, validación secuencial y soporte Range (M).
- Implementar endpoint PATCH /api/progreso/:videoId con registro de progreso (S).
- Implementar endpoint DELETE /api/videos/:id con validación de permisos (S).
- Implementar la capa de servicio con reglas RN-01 a RN-13 (M).
- Configurar `.gitignore` para `uploads/` (XS).

### 4.2 Frontend

- Crear componente de subida de video con barra de progreso (M).
- Crear reproductor con control de progreso y bloqueo secuencial (M).
- Implementar consumo del endpoint de streaming con soporte de Range (S).
- Implementar mensaje de salida durante evaluación (S).
- Implementar estados de carga, vacío y error (S).

### 4.3 Persistencia

- Crear índices sobre capacitacionId, submoduloId en videos (XS).
- Crear UNIQUE (usuarioId, videoId) en progreso_videos (XS).
- Crear seed de videos de ejemplo (S).

### 4.4 Seguridad

- Validar permisos en el endpoint de streaming (S).
- Validar navegación secuencial en el backend (S).
- Bloquear descarga directa de archivos (S).

### 4.5 Testing

- Pruebas unitarias del StorageService (M).
- Pruebas unitarias de la validación secuencial (S).
- Pruebas de integración del endpoint de streaming con Range (M).
- Pruebas de componente del reproductor (M).
- Smoke test de subida y visualización (S).
- Cobertura mínima 80% (XS).

### 4.6 Docker

- Configurar volumen para `uploads/` en docker-compose (S).
- Verificar que migraciones y seeds corran al iniciar (S).

---

## 5. Estimación

- **Backend**: M (modelos S, migraciones S, StorageService M, endpoints M, servicio M).
- **Frontend**: M (subida M, reproductor M, streaming S).
- **Persistencia**: S (índices XS, seeds S).
- **Seguridad**: S (permisos S, secuencial S, descarga S).
- **Testing**: M (StorageService M, integración M, componente M, smoke S).
- **Docker**: S (volumen S, migraciones S).

---

## 6. Priorización

### MVP

- Modelos Video y ProgresoVideo, migraciones.
- StorageService con implementación local.
- Endpoint de subida con validación y watermark básico.
- Endpoint de streaming con auth, permisos, Range y validación secuencial.
- Endpoint de registro de progreso.
- Reproductor con bloqueo secuencial.
- Mensaje de salida durante evaluación.
- Docker con volumen persistente.

### Funcionalidades opcionales

- Watermark dinámico por sesión.
- Subtítulos/transcripción.
- Seeds adicionales de videos.

### Mejoras futuras

- Migración a S3 + CloudFront con URLs firmadas.
- Migración a VdoCipher con DRM.
- Modo offline con descarga cifrada.
- Analítica de tiempo por video.

---

## 7. Justificación

### 7.1 Actividades agregadas

- Se agregó `StorageService` abstracto con implementación local, para migrar a S3/VdoCipher sin refactor.
- Se agregó endpoint de streaming con auth, permisos, Range y validación secuencial.
- Se agregó watermark básico con FFmpeg.
- Se agregó registro de progreso por video.
- Se agregó mensaje de salida durante evaluación.

### 7.2 Actividades eliminadas

- Se eliminó la subida directa a S3 en el MVP.
- Se eliminó DRM en el MVP.
- Se eliminó transcripción en el MVP.

### 7.3 Decisiones tomadas

- Se decidió almacenamiento local con StorageService abstracto.
- Se decidió endpoint autenticado con Range en lugar de estático.
- Se decidió watermark básico con FFmpeg.
- Se decidió validación secuencial en backend.
- Se decidió `.gitignore` para `uploads/`.

### 7.4 Riesgos identificados

- **R-01**: Exposición de videos → mitigado con endpoint autenticado y bloqueo de descarga.
- **R-02**: Salto de contenido → mitigado con validación secuencial en backend.
- **R-03**: Pérdida de progreso → mitigado con registro por video.
- **R-04**: Disco lleno → mitigado con límite de 500 MB.
- **R-05**: Reemplazo de video → mitigado conservando progreso por ID.
- **R-06**: Falta de trazabilidad → mitigado con ProgresoVideo.

---

# HU-003 — Gestión de Evaluaciones Dinámicas

## Historia de Usuario

- **Como** administrador
- **Quiero** crear evaluaciones con diferentes tipos de preguntas y configurar intentos
- **Para** medir el aprendizaje de los colaboradores de forma efectiva.

- **Como** estudiante
- **Quiero** presentar evaluaciones con preguntas variadas
- **Para** demostrar lo que he aprendido al finalizar una capacitación.

---

## 1. Análisis

### 1.1 Ambigüedades

- No se define el número mínimo ni máximo de preguntas por evaluación.
- No se aclara si la evaluación se desbloquea automáticamente o el administrador la habilita.
- No se define la puntuación mínima para aprobar.
- No se especifica si el estudiante puede ver las respuestas correctas.
- No se define el tiempo límite.
- No se aclara si las preguntas se seleccionan aleatoriamente o se fijan.
- No se define qué sucede si el estudiante sale de la evaluación (el enunciado dice que no se guarda).
- No se especifica el formato de retroalimentación.
- No se define si el administrador puede editar después de intentos.
- No se aclara cuántos intentos permite y cómo se registran.

### 1.2 Tipos de preguntas requeridos

- **Opción múltiple**: Una respuesta correcta entre varias.
- **Selección múltiple**: Varias respuestas correctas.
- **Verdadero o falso**: Dos opciones.
- **Completa espacios en blanco**: Similar a ahorcado: líneas según letras.
- **Respuestas abiertas**: Evaluación manual del administrador.
- **Tabla de relleno**: Menú desplegable por celda.
- **Arrastra y suelta**: Ordenar o clasificar.
- **Menú desplegable**: Selección en desplegable.
- **Categorizar**: Agrupar en categorías.
- **Reordenar**: Ordenar elementos.
- **Relacionar**: Emparejar columnas.
- **Cuadrícula de tabla coincidente**: Relacionar en formato tabla.

### 1.3 Dependencias

- Depende de HU-002 Gestión de Videos.
- Depende de HU-001 Gestión de Capacitaciones.
- Depende de HU-004 Gestión de Usuarios y Permisos.
- Consumida por HU-006 Dashboard.

### 1.4 Riesgos

- **R-01**: Banco pequeño permite memorizar respuestas.
- **R-02**: Pérdida de progreso al salir (comportamiento esperado, pero debe comunicarse).
- **R-03**: Evaluación sin bloqueo de videos.
- **R-04**: Preguntas abiertas sin corregir.
- **R-05**: Edición de preguntas afecta puntajes históricos.
- **R-06**: Falta de trazabilidad de intentos.

### 1.5 Supuestos

- Cada evaluación tiene banco de **50 preguntas** por defecto, con **4 opciones** cada una.
- Número de preguntas por intento configurable (5-50).
- Selección aleatoria del banco en cada intento.
- Puntaje mínimo configurable (default 70%).
- Máximo de intentos configurable (default 3).
- Evaluación se desbloquea al completar todos los videos.
- Al salir, el progreso no se guarda. Se muestra mensaje informativo.
- Cada tipo de pregunta tiene componente React específico.
- Preguntas abiertas requieren evaluación manual.
- Se muestra mini video de resolución tras respuesta incorrecta (opcional de omitir).
- Se registra cada intento con puntaje, respuestas, fecha y tiempo.

---

## 2. Refinamiento

### 2.1 Entidades involucradas

- **Evaluación**, **Pregunta**, **TipoPregunta**, **Opción**, **Intento**, **RespuestaIntento**, **VideoResolucion**.

### 2.2 Reglas de negocio

- **RN-01**: Cada evaluación se asocia a una capacitación.
- **RN-02**: Banco mínimo de 50 preguntas.
- **RN-03**: Número de preguntas por intento configurable (5-50).
- **RN-04**: Puntaje mínimo configurable (0-100).
- **RN-05**: Máximo de intentos configurable (1-10).
- **RN-06**: Evaluación se desbloquea solo con videos COMPLETADOS.
- **RN-07**: Al salir, el intento se descarta.
- **RN-08**: Selección aleatoria sin repetición dentro del intento.
- **RN-09**: Preguntas ABIERTA requieren evaluación manual.
- **RN-10**: Tras respuesta incorrecta, se muestra video de resolución si existe, con opción de omitir.
- **RN-11**: El estudiante no ve respuestas correctas hasta agotar intentos o autorización del admin.
- **RN-12**: Se registra cada intento con puntaje, respuestas y fecha.
- **RN-13**: Si el admin edita una pregunta, los intentos previos conservan snapshot.

### 2.3 Estados

- **BLOQUEADA**, **DISPONIBLE**, **EN_PROGRESO** (no persistente), **COMPLETADA**, **APROBADA**, **REPROBADA**.

### 2.4 Relaciones

- Una Evaluación pertenece a una Capacitación.
- Una Evaluación tiene muchas Preguntas.
- Una Pregunta tiene muchas Opciones.
- Una Pregunta puede tener VideoResolucion.
- Un Estudiante tiene muchos Intentos.
- Un Intento tiene muchas RespuestasIntento.

### 2.5 Flujo funcional

1. El administrador crea evaluación asociada a capacitación.
2. Agrega preguntas al banco con tipo y opciones.
3. Configura número de preguntas, puntaje mínimo y máximo de intentos.
4. El estudiante completa todos los videos. Se desbloquea la evaluación.
5. El estudiante inicia. Se muestra mensaje de que si sale no se guarda.
6. El sistema selecciona preguntas aleatorias.
7. Tras respuesta incorrecta, se muestra video de resolución (opcional).
8. Al finalizar, se calcula puntaje y se muestra.
9. Si aprueba, se marca APROBADA. Si no, puede reintentar.
10. El administrador puede ver resultados y evaluar preguntas abiertas.

---

## 3. Criterios de aceptación

- **CA-01**: Dado un administrador autenticado, cuando crea una evaluación con 50 preguntas, entonces el sistema la registra y responde 201.
- **CA-02**: Dado un administrador autenticado, cuando configura número de preguntas por intento entre 5 y 50, entonces el sistema persiste la configuración.
- **CA-03**: Dado un estudiante autenticado, cuando completa todos los videos, entonces el sistema desbloquea la evaluación.
- **CA-04**: Dado un estudiante autenticado, cuando inicia una evaluación, entonces el sistema muestra el mensaje de que al salir no se guarda el progreso.
- **CA-05**: Dado un estudiante autenticado, cuando responde incorrectamente una pregunta con video de resolución, entonces el sistema muestra el video con opción de omitir.
- **CA-06**: Dado un estudiante autenticado, cuando sale antes de enviar, entonces el sistema descarta el intento y no lo registra.
- **CA-07**: Dado un estudiante autenticado, cuando envía la evaluación, entonces el sistema calcula el puntaje y lo muestra.
- **CA-08**: Dado un estudiante autenticado, cuando aprueba, entonces el sistema marca la capacitación como COMPLETADA.
- **CA-09**: Dado un estudiante autenticado, cuando reprueba y le quedan intentos, entonces el sistema permite nuevo intento con preguntas diferentes.
- **CA-10**: Dado un administrador autenticado, cuando evalúa manualmente una pregunta abierta, entonces el sistema actualiza el puntaje del intento.
- **CA-11**: Dado un estudiante autenticado, cuando intenta acceder a la evaluación sin completar los videos, entonces el sistema rechaza con 403.
- **CA-12**: Dado un administrador autenticado, cuando intenta crear una evaluación con menos de 50 preguntas en el banco, entonces el sistema rechaza con 409.

---

## 4. Descomposición técnica

### 4.1 Backend

- Definir modelo Evaluacion con id, capacitacionId, numPreguntasPorIntento, puntajeMinimo, maxIntentos, createdAt, updatedAt (S).
- Definir modelo Pregunta con id, evaluacionId, tipo, enunciado, orden, videoResolucionId, createdAt, updatedAt (S).
- Definir modelo Opcion con id, preguntaId, texto, esCorrecta, orden (S).
- Definir enum TipoPregunta con los 12 tipos (XS).
- Definir modelo Intento con id, evaluacionId, usuarioId, puntaje, estado, fechaInicio, fechaFin, createdAt (S).
- Definir modelo RespuestaIntento con id, intentoId, preguntaId, respuestaJson, esCorrecta, puntajeObtenido (S).
- Crear migraciones con índices y FKs (S).
- Implementar endpoint GET /api/evaluaciones/:id para consulta (S).
- Implementar endpoint POST /api/evaluaciones con validación de banco mínimo (M).
- Implementar endpoint POST /api/evaluaciones/:id/intentos para iniciar intento, validando desbloqueo (M).
- Implementar endpoint POST /api/evaluaciones/:id/intentos/:intentoId/respuestas para registrar respuestas (M).
- Implementar endpoint POST /api/evaluaciones/:id/intentos/:intentoId/enviar para calcular puntaje (M).
- Implementar endpoint GET /api/evaluaciones/:id/intentos para que el admin vea resultados (S).
- Implementar endpoint PATCH /api/evaluaciones/:id/intentos/:intentoId/preguntas-abiertas para evaluación manual (S).
- Implementar la capa de servicio con reglas RN-01 a RN-13 (M).
- Implementar selección aleatoria de preguntas sin repetición (S).

### 4.2 Frontend

- Crear componente de gestión de banco de preguntas con los 12 tipos (L).
- Crear componente de configuración de evaluación (M).
- Crear componente de presentación de evaluación con los 12 tipos renderizados (L).
- Crear componente de video de resolución tras respuesta incorrecta (S).
- Crear componente de resultado con puntaje (S).
- Implementar mensaje de salida durante evaluación (S).
- Implementar panel de resultados para el admin (M).
- Implementar evaluación manual de preguntas abiertas (S).

### 4.3 Persistencia

- Índices sobre evaluacionId, intentoId, usuarioId (XS).
- Seed de evaluación de ejemplo con 50 preguntas (S).

### 4.4 Seguridad

- Validar permisos para iniciar intento (S).
- Validar desbloqueo por videos completados (S).
- Validar máximo de intentos (S).
- Validar que el estudiante no vea respuestas correctas (S).

### 4.5 Testing

- Pruebas unitarias del cálculo de puntaje (M).
- Pruebas unitarias de selección aleatoria (S).
- Pruebas unitarias de validación de intentos (S).
- Pruebas de integración de endpoints de evaluación (M).
- Pruebas de componente de los 12 tipos (L).
- Smoke test de flujo completo (S).
- Cobertura mínima 80% (XS).

### 4.6 Docker

- Reutilizar configuración (XS).
- Verificar migraciones y seeds (S).

---

## 5. Estimación

- **Backend**: L (modelos M, migraciones S, endpoints L, servicio M, selección aleatoria S).
- **Frontend**: L (banco L, presentación L, resultados M).
- **Persistencia**: S (índices XS, seeds S).
- **Seguridad**: S (permisos S, desbloqueo S, intentos S).
- **Testing**: L (unitarias M, integración M, componente L, smoke S).
- **Docker**: XS.

---

## 6. Priorización

### MVP

- Modelos Evaluacion, Pregunta, Opcion, Intento, RespuestaIntento.
- Enum TipoPregunta con 12 tipos.
- Endpoints de creación, inicio, respuestas, envío y resultados.
- Selección aleatoria de preguntas.
- Desbloqueo por videos completados.
- Mensaje de salida.
- Video de resolución tras respuesta incorrecta.
- Evaluación manual de preguntas abiertas.
- Frontend con los 12 tipos.
- Pruebas unitarias e integración.

### Funcionalidades opcionales

- Pruebas de componente exhaustivas.
- Banco ampliado de preguntas.
- Seeds adicionales.

### Mejoras futuras

- Tiempo límite por evaluación.
- Retroalimentación automática por pregunta.
- Generación automática de preguntas con IA.
- Analítica de preguntas más falladas.

---

## 7. Justificación

### 7.1 Actividades agregadas

- Se agregaron los 12 tipos de preguntas como componentes específicos.
- Se agregó selección aleatoria sin repetición.
- Se agregó video de resolución tras respuesta incorrecta.
- Se agregó evaluación manual de preguntas abiertas.
- Se agregó mensaje de salida durante evaluación.
- Se agregó snapshot de preguntas para intentos previos.

### 7.2 Actividades eliminadas

- Se eliminó tiempo límite en el MVP.
- Se eliminó retroalimentación automática en el MVP.
- Se eliminó generación con IA en el MVP.

### 7.3 Decisiones tomadas

- Se decidió banco mínimo de 50 preguntas.
- Se decidió selección aleatoria en cada intento.
- Se decidió descartar intento al salir.
- Se decidió evaluación manual de preguntas abiertas.
- Se decidió video de resolución opcional.
- Se decidió no mostrar respuestas correctas hasta agotar intentos.

---

# HU-004 — Gestión de Usuarios, Roles y Permisos

## Historia de Usuario

- **Como** administrador
- **Quiero** gestionar usuarios, crear roles y asignar permisos
- **Para** controlar el acceso a las capacitaciones según el perfil de cada colaborador.

- **Como** usuario
- **Quiero** acceder a mi perfil y cambiar mi contraseña
- **Para** mantener mis datos actualizados y seguros.

---

## 1. Análisis

### 1.1 Ambigüedades

- No se define la granularidad de permisos.
- No se especifica si un usuario puede tener múltiples roles.
- No se aclara si los roles son fijos o personalizables.
- No se define si el admin puede crear permisos granulares.
- No se especifica si hay grupos de usuarios.
- No se aclara si un usuario pertenece a múltiples grupos.
- No se define el flujo de recuperación de contraseña.
- No se especifica si el admin puede forzar cambio de contraseña.
- No se aclara qué datos del perfil son editables.
- No se define si el admin puede desactivar usuarios.
- No se especifica si hay audit log.

### 1.2 Dependencias

- Prerequisito de todas las historias.
- Depende de HU-001, HU-002, HU-003 para entidades sobre las que se aplican permisos.
- Consumida por HU-006 Dashboard.

### 1.3 Riesgos

- **R-01**: Permisos no validados en backend.
- **R-02**: Falta de trazabilidad de quién otorgó permiso.
- **R-03**: Admin no puede desactivar usuarios.
- **R-04**: Política de contraseñas débil.
- **R-05**: Email inválido.

### 1.4 Supuestos

- Roles base: **ADMINISTRADOR** y **ESTUDIANTE**. Admin puede crear roles adicionales.
- Permisos se asignan a roles, no a usuarios.
- Un permiso es recurso + acción (ej: `capacitacion:ver`).
- Un usuario tiene un rol (o múltiples en el futuro).
- Admin puede cambiar contraseña de cualquier usuario.
- Cada usuario actualiza su propio perfil.
- Contraseña mínimo 8 caracteres, mayúscula y número.
- Se registra `lastLogin`.

---

## 2. Refinamiento

### 2.1 Entidades involucradas

- **Usuario**, **Rol**, **Permiso**, **UsuarioRol**, **Grupo** (opcional).

### 2.2 Reglas de negocio

- **RN-01**: Email único.
- **RN-02**: Política de contraseña (8+, mayúscula, número).
- **RN-03**: Solo ADMINISTRADOR crea/edita/desactiva usuarios.
- **RN-04**: Solo ADMINISTRADOR crea roles y asigna permisos.
- **RN-05**: ESTUDIANTE solo ve capacitaciones permitidas.
- **RN-06**: ADMINISTRADOR tiene acceso completo.
- **RN-07**: Admin puede cambiar contraseña de cualquier usuario.
- **RN-08**: Cada usuario actualiza su perfil.
- **RN-09**: Usuarios no se eliminan, se desactivan.
- **RN-10**: Se registra auditoría.
- **RN-11**: Permisos se validan siempre en backend.

### 2.3 Estados

- **ACTIVO**, **INACTIVO**.

### 2.4 Relaciones

- Un Usuario tiene un Rol.
- Un Rol tiene muchos Permisos.
- Un Permiso pertenece a muchos Roles.
- Un Usuario pertenece a muchos Grupos (opcional).

### 2.5 Flujo funcional

1. El administrador accede al módulo de usuarios.
2. Crea usuario con nombre, email, contraseña temporal y rol.
3. El sistema envía email con credenciales.
4. El administrador crea rol y asigna permisos.
5. Asigna rol al usuario.
6. El usuario inicia sesión y ve capacitaciones permitidas.
7. El usuario actualiza su perfil.
8. El usuario cambia su contraseña.
9. El admin puede cambiar contraseña de un usuario.
10. El admin puede desactivar un usuario.

---

## 3. Criterios de aceptación

- **CA-01**: Dado un administrador autenticado, cuando crea un usuario con email único y contraseña válida, entonces el sistema lo registra con estado ACTIVO y responde 201.
- **CA-02**: Dado un administrador autenticado, cuando intenta crear un usuario con email existente, entonces el sistema rechaza con 409.
- **CA-03**: Dado un administrador autenticado, cuando crea un usuario con contraseña que no cumple la política, entonces el sistema rechaza con 400.
- **CA-04**: Dado un administrador autenticado, cuando desactiva un usuario, entonces el sistema cambia su estado a INACTIVO y el usuario no puede iniciar sesión.
- **CA-05**: Dado un administrador autenticado, cuando crea un rol con permisos, entonces el sistema lo registra y los usuarios con ese rol ven solo el contenido permitido.
- **CA-06**: Dado un usuario autenticado, cuando actualiza su perfil con datos válidos, entonces el sistema persiste los cambios y responde 200.
- **CA-07**: Dado un usuario autenticado, cuando cambia su contraseña con una válida, entonces el sistema la actualiza y responde 200.
- **CA-08**: Dado un administrador autenticado, cuando cambia la contraseña de un usuario, entonces el sistema la actualiza.
- **CA-09**: Dado un usuario con rol ESTUDIANTE, cuando intenta acceder al módulo de administración, entonces el sistema rechaza con 403.
- **CA-10**: Dado un usuario autenticado, cuando intenta acceder a una capacitación sin permiso, entonces el sistema rechaza con 403.

---

## 4. Descomposición técnica

### 4.1 Backend

- Definir modelos Usuario, Rol, Permiso, UsuarioRol con atributos e índices (S).
- Crear migraciones con UNIQUE sobre email y nombre de rol (S).
- Implementar endpoint POST /api/usuarios con validación de email único y contraseña (M).
- Implementar endpoint GET /api/usuarios con paginación y filtros (S).
- Implementar endpoint PUT /api/usuarios/:id (S).
- Implementar endpoint PATCH /api/usuarios/:id/estado (S).
- Implementar endpoint POST /api/roles con permisos (S).
- Implementar endpoint GET /api/roles (XS).
- Implementar endpoint PATCH /api/usuarios/:id/password (S).
- Implementar endpoint PATCH /api/usuarios/me/password (S).
- Implementar endpoint PUT /api/usuarios/me (S).
- Implementar middleware de autorización por rol (S).
- Implementar política de contraseñas (S).
- Implementar la capa de servicio con RN-01 a RN-11 (M).

### 4.2 Frontend

- Crear vista de listado de usuarios con paginación y filtros (M).
- Crear formulario de creación/edición de usuario (M).
- Crear vista de gestión de roles y permisos (M).
- Crear vista de perfil con edición (S).
- Crear formulario de cambio de contraseña (S).
- Implementar consumo de endpoints con Axios (M).

### 4.3 Persistencia

- Índices UNIQUE sobre email y nombre de rol (XS).
- Seed de usuarios ADMINISTRADOR, ESTUDIANTE y roles base (S).

### 4.4 Seguridad

- Validar permisos siempre en backend (S).
- Política de contraseñas (S).
- Hash con bcrypt (S).
- JWT con expiración (S).

### 4.5 Testing

- Pruebas unitarias de la política de contraseñas (S).
- Pruebas unitarias de autorización (M).
- Pruebas de integración de endpoints (M).
- Pruebas de componente del frontend (M).
- Cobertura mínima 80% (XS).

### 4.6 Docker

- Reutilizar configuración (XS).
- Verificar seeds (S).

---

## 5. Estimación

- **Backend**: M (modelos S, migraciones S, endpoints M, middleware S, servicio M).
- **Frontend**: M (listado M, formulario M, roles M, perfil S).
- **Persistencia**: S (índices XS, seeds S).
- **Seguridad**: M (validación S, política S, hash S, JWT S).
- **Testing**: M (unitarias S, integración M, componente M).
- **Docker**: XS.

---

## 6. Priorización

### MVP

- Modelos Usuario, Rol, Permiso.
- Endpoints de gestión de usuarios, roles y permisos.
- Política de contraseñas.
- Autenticación JWT.
- Perfil de usuario.
- Cambio de contraseña.
- Autorización por rol.
- Frontend funcional.

### Funcionalidades opcionales

- Grupos de usuarios.
- Múltiples roles por usuario.
- Audit log visible.

### Mejoras futuras

- Recuperación de contraseña por email.
- Integración LDAP/AD.
- 2FA.
- Avatares.

---

## 7. Justificación

### 7.1 Actividades agregadas

- Se agregó política de contraseñas.
- Se agregó hash con bcrypt.
- Se agregó JWT con expiración.
- Se agregó cambio de contraseña por admin.
- Se agregó perfil editable.
- Se agregó desactivación en lugar de eliminación.

### 7.2 Actividades eliminadas

- Se eliminó recuperación por email en MVP.
- Se eliminó 2FA en MVP.
- Se eliminó integración LDAP en MVP.
- Se eliminaron grupos de usuarios en MVP.

### 7.3 Decisiones tomadas

- Se decidió roles base ADMINISTRADOR y ESTUDIANTE.
- Se decidió permisos a roles, no a usuarios.
- Se decidió validación en backend.
- Se decidió hash con bcrypt.
- Se decidió desactivación en lugar de eliminación.

---

# HU-005 — Protección de Contenido (Bloqueo de Capturas)

## Historia de Usuario

- **Como** administrador
- **Quiero** que la plataforma bloquee las capturas de pantalla dentro de la aplicación
- **Para** proteger el contenido de las capacitaciones.

---

## 1. Análisis

### 1.1 Ambigüedades

- No se define si el bloqueo es completo o advertencia.
- No se especifica si aplica a toda la app o solo videos/evaluaciones.
- No se aclara qué sucede si el usuario intenta capturar.
- No se define el mecanismo técnico.
- No se especifica si es best effort o garantía.
- No se aclara si se permite captura desde herramientas de desarrollo.
- No se define si hay registro de intentos.
- No se especifica si el admin ve los intentos.

### 1.2 Limitaciones técnicas (documentar)

- Navegadores web no pueden bloquear capturas a nivel SO.
- La protección web es best effort.
- Para protección robusta se requiere DRM.
- VdoCipher ofrece DRM y watermarking dinámico.

### 1.3 Dependencias

- Aplica transversalmente a HU-002 (videos) y HU-003 (evaluaciones).
- Depende de decisión de arquitectura (DRM externo o JS).

### 1.4 Riesgos

- **R-01**: Prometer bloqueo completo y no cumplir.
- **R-02**: Bloquear funcionalidades legítimas.
- **R-03**: No documentar limitaciones.

### 1.5 Supuestos

- Protección best effort: bloquea atajos, menú contextual, selección.
- Watermark dinámico con ID de usuario en videos.
- DRM ligero con HLS (opcional en MVP).
- Se registra log de intentos.
- Bloqueo aplica a rutas de video y evaluación.
- Admin puede ver log de intentos (opcional).

---

## 2. Refinamiento

### 2.1 Entidades involucradas

- **IntentoCaptura**, **Usuario**.

### 2.2 Reglas de negocio

- **RN-01**: Se bloquean atajos de captura (PrintScreen, Ctrl+Shift+S, Cmd+Shift+3/4/5).
- **RN-02**: Se bloquea menú contextual en videos y evaluaciones.
- **RN-03**: Se bloquea selección de texto en evaluaciones.
- **RN-04**: Se muestra advertencia al intentar capturar.
- **RN-05**: Se registra cada intento con usuario, timestamp y ruta.
- **RN-06**: Videos muestran watermark dinámico con ID de usuario.
- **RN-07**: Protección best effort; no garantía en todos los dispositivos.
- **RN-08**: Admin puede ver log de intentos en dashboard.

### 2.3 Relaciones

- Un Usuario tiene muchos IntentosCaptura.

### 2.4 Flujo funcional

1. El estudiante accede a video o evaluación.
2. El sistema activa protección.
3. Si intenta PrintScreen, se bloquea, se advierte y se registra.
4. Si usa herramienta externa, no se puede bloquear (limitación documentada).
5. El video muestra watermark dinámico.
6. El admin consulta log de intentos.

---

## 3. Criterios de aceptación

- **CA-01**: Dado un estudiante viendo un video, cuando presiona PrintScreen, entonces el sistema bloquea y muestra advertencia.
- **CA-02**: Dado un estudiante viendo un video, cuando hace clic derecho, entonces el sistema bloquea el menú contextual.
- **CA-03**: Dado un estudiante en evaluación, cuando intenta seleccionar texto, entonces el sistema bloquea la selección.
- **CA-04**: Dado un estudiante que intenta capturar, entonces el sistema registra el intento.
- **CA-05**: Dado un video reproduciéndose, entonces el sistema muestra watermark con ID del usuario.
- **CA-06**: Dado un administrador autenticado, cuando consulta el log de intentos, entonces el sistema muestra los registros.
- **CA-07**: Dado un estudiante usando herramienta externa, entonces el sistema no puede bloquear pero queda documentado.

---

## 4. Descomposición técnica

### 4.1 Backend

- Definir modelo IntentoCaptura con id, usuarioId, ruta, timestamp, userAgent (S).
- Crear migración con índice sobre usuarioId y timestamp (XS).
- Implementar endpoint POST /api/intentos-captura para registrar (S).
- Implementar endpoint GET /api/intentos-captura para admin (S).

### 4.2 Frontend

- Implementar hook `useScreenshotProtection` que bloquee atajos y menú contextual (M).
- Implementar componente de advertencia al intentar capturar (S).
- Implementar watermark dinámico en el reproductor (S).
- Implementar envío del intento al backend (S).

### 4.3 Persistencia

- Índice sobre usuarioId y timestamp (XS).

### 4.4 Seguridad

- Validar que el intento se registre con usuario autenticado (XS).

### 4.5 Testing

- Pruebas unitarias del hook de protección (M).
- Pruebas de integración del registro de intentos (S).
- Smoke test de intento de captura (S).

### 4.6 Docker

- Reutilizar configuración (XS).

---

## 5. Estimación

- **Backend**: S (modelo XS, migración XS, endpoints S).
- **Frontend**: M (hook M, advertencia S, watermark S).
- **Persistencia**: XS.
- **Seguridad**: XS.
- **Testing**: S.
- **Docker**: XS.

---

## 6. Priorización

### MVP

- Hook de protección de capturas.
- Registro de intentos en backend.
- Watermark básico en videos.
- Advertencia visual.
- Documentación de limitaciones.

### Funcionalidades opcionales

- Log de intentos visible en dashboard.
- Watermark dinámico por sesión.

### Mejoras futuras

- DRM con VdoCipher.
- Cifrado HLS.
- Bloqueo nativo en app móvil.

---

## 7. Justificación

### 7.1 Actividades agregadas

- Se agregó hook de protección de capturas.
- Se agregó registro de intentos.
- Se agregó watermark básico.
- Se agregó documentación de limitaciones.

### 7.2 Actividades eliminadas

- Se eliminó DRM en MVP.
- Se eliminó cifrado HLS en MVP.

### 7.3 Decisiones tomadas

- Se decidió protección best effort.
- Se decidió registrar intentos.
- Se decidió documentar limitaciones.
- Se decidió watermark básico con FFmpeg.

### 7.4 Riesgos identificados

- **R-01**: Expectativa irreal → mitigado con documentación.
- **R-02**: Bloqueo de funcionalidad legítima → mitigado con configuración por ruta.
- **R-03**: Falta de documentación → mitigado con README.

---

# HU-006 — Dashboard Operacional

## Historia de Usuario

- **Como** administrador
- **Quiero** visualizar indicadores de progreso y desempeño de la plataforma
- **Para** conocer el estado general de las capacitaciones y el avance de los colaboradores.

---

## 1. Análisis

### 1.1 Ambigüedades

- El término "indicadores" es ambiguo. No se especifica cuáles son los mínimos, su unidad ni periodicidad.
- No se define el nivel de agregación: ¿global, por capacitación, por usuario, por rol?
- No se aclara si es en tiempo real o con retraso aceptable.
- No se define el rango temporal por defecto.
- No se especifica si se puede filtrar por capacitación, rol o rango de fechas.
- No se aclara si se exporta (CSV, PDF) o solo se visualiza.
- No se define si se refresca automáticamente o bajo demanda.
- No se define si es exclusivo del ADMINISTRADOR o si otros roles acceden.
- No se define el formato de errores ante fallos parciales.
- No se define si se calcula en backend en tiempo real o precalculado.
- No se define si muestra tendencias o solo valores absolutos.
- No se aclara si incluye indicadores de intentos de captura (HU-005).
- No se define si incluye porcentajes además de absolutos.
- No se define el comportamiento cuando el rango no tiene datos.
- No se define si el rango temporal aplica a capacitaciones por fecha de creación o a intentos por fecha.

### 1.2 Dependencias

- Depende directamente de HU-001, HU-002, HU-003, HU-004 y HU-005.
- Consumida por ADMINISTRADOR y potencialmente COORDINADOR.
- Dependencia transversal: HU-000 Auth, contrato de error estandarizado.

### 1.3 Riesgos

- **R-01**: Consultas pesadas degradan el rendimiento.
- **R-02**: Rango temporal no definido confunde al usuario.
- **R-03**: Sin control de acceso, cualquier usuario ve información sensible.
- **R-04**: Datos inconsistentes producen cifras erróneas.
- **R-05**: Rango abusivo degrada el sistema.
- **R-06**: Fallo parcial rompe todo el dashboard.
- **R-07**: Formato inconsistente de indicadores.
- **R-08**: Alcance creciente sin definir mínimos.
- **R-09**: Ambigüedad tiempo real vs precalculado.
- **R-10**: Orden inconsistente en listados.
- **R-11**: Rango sin datos interpretado como error.
- **R-12**: Capacitaciones archivadas contadas como activas.
- **R-13**: Carga de usuarios sin filtro temporal.

### 1.4 Supuestos

- El dashboard es de solo lectura.
- Indicadores mínimos del MVP:
  1. **Capacitaciones por estado** (BORRADOR, PUBLICADA, ARCHIVADA).
  2. **Capacitaciones por cantidad de videos** (rango).
  3. **Usuarios por rol** (ADMINISTRADOR, ESTUDIANTE, otros).
  4. **Usuarios activos vs inactivos**.
  5. **Progreso de videos por capacitación** (porcentaje de estudiantes que completaron).
  6. **Evaluaciones por estado** (BLOQUEADA, DISPONIBLE, COMPLETADA, APROBADA, REPROBADA).
  7. **Puntaje promedio por capacitación**.
  8. **Tasa de aprobación por capacitación**.
  9. **Intentos promedio por estudiante**.
  10. **Top 5 capacitaciones con mayor tasa de reprobación**.
  11. **Top 5 estudiantes con mayor progreso**.
  12. **Intentos de captura registrados** (por usuario y por capacitación).
  13. **Tiempo promedio de visualización por video**.
  14. **Preguntas más falladas** (top 10).
- Rango temporal por defecto: mes en curso.
- Rango configurable con `fechaDesde` y `fechaHasta` en ISO 8601.
- Rango máximo de 365 días.
- Indicadores calculados en backend en tiempo real con índices y cacheo de 30 segundos.
- Disponible para ADMINISTRADOR. Otros roles no autorizados reciben 403.
- No incluye exportación en MVP.
- No incluye refresco automático en MVP.
- No incluye comparación con periodos anteriores en MVP.
- Respuesta agregada única.
- Fallo parcial reportado como `null` con campo de error.
- Rango sin datos devuelve valores 0 y sin error.
- Capacitaciones ARCHIVADAS se reportan en categoría separada.
- Se devuelven valores absolutos; el frontend calcula porcentajes.
- Orden fijo definido por el backend.

---

## 2. Refinamiento

### 2.1 Entidades involucradas

- **Capacitación**, **Submódulo**, **Video**, **Evaluación**, **Intento**, **ProgresoVideo**, **Usuario**, **Rol**, **IntentoCaptura**.

### 2.2 Reglas de negocio

- **RN-01**: El dashboard es de solo lectura.
- **RN-02**: Solo ADMINISTRADOR accede. Otros roles reciben 403.
- **RN-03**: Rango por defecto: mes en curso (primer día del mes hasta hoy).
- **RN-04**: Rango configurable con `fechaDesde` y `fechaHasta` en ISO 8601.
- **RN-05**: `fechaDesde` no puede ser posterior a `fechaHasta`. Si se incumple, 400.
- **RN-06**: Rango máximo 365 días. Si se excede, 400.
- **RN-07**: Indicadores mínimos: los 14 listados en supuestos.
- **RN-08**: Respuesta agregada única.
- **RN-09**: Fallo parcial reportado como `null` con campo de error.
- **RN-10**: Indicadores calculados en tiempo real sobre columnas indexadas.
- **RN-11**: Indicadores de intentos se filtran por `fechaInicio` en el rango.
- **RN-12**: Indicador de progreso de videos se calcula sobre `ProgresoVideo` con `estado = COMPLETADO`.
- **RN-13**: Dashboard no incluye paginación.
- **RN-14**: Dashboard no incluye exportación en MVP.
- **RN-15**: Dashboard no incluye refresco automático en MVP.
- **RN-16**: Dashboard no incluye comparación con periodos anteriores en MVP.
- **RN-17**: Endpoint devuelve 200, 400, 401, 403, 405, 500 según corresponda.
- **RN-18**: Rango sin datos devuelve 0 y sin error.
- **RN-19**: Capacitaciones ARCHIVADAS se reportan en categoría separada.
- **RN-20**: Orden fijo de indicadores definido por el backend.
- **RN-21**: Valores absolutos; el frontend calcula porcentajes.
- **RN-22**: Cacheo en memoria de 30 segundos por rango temporal y rol.
- **RN-23**: Intentos de captura se cuentan por usuario y por capacitación.
- **RN-24**: Preguntas más falladas se calculan sobre `RespuestaIntento` con `esCorrecta = false`, agrupadas por `preguntaId`.

### 2.3 Estados

El dashboard no gestiona estados propios. Consume estados de HU-001, HU-002, HU-003, HU-004 y HU-005.

### 2.4 Relaciones

- Capacitación contribuye a indicadores de estado, videos y evaluaciones.
- Video y ProgresoVideo contribuyen a indicadores de progreso.
- Evaluación e Intento contribuyen a indicadores de desempeño.
- Usuario y Rol contribuyen a indicadores de usuarios.
- IntentoCaptura contribuye a indicadores de seguridad.

### 2.5 Flujo funcional

1. El administrador se autentica y accede al dashboard.
2. Ve los indicadores con rango por defecto (mes en curso).
3. Puede ajustar el rango con `fechaDesde` y `fechaHasta`.
4. El frontend envía una única solicitud.
5. El backend verifica cacheo. Si hay respuesta válida (<30s), la devuelve.
6. Si no, calcula todos los indicadores en una pasada con consultas agregadas e índices.
7. Devuelve respuesta agregada con orden fijo y fallo parcial si aplica.
8. El frontend renderiza tarjetas o gráficos y calcula porcentajes.
9. Si no hay datos, muestra 0 con mensaje de "sin datos en el periodo".
10. Si rango inválido, 400. Si rol no autorizado, 403. Si método no GET, 405. Si fallo completo, 500.

---

## 3. Criterios de aceptación

- **CA-01**: Dado un administrador autenticado, cuando consulta el dashboard sin parámetros, entonces el sistema devuelve los indicadores del mes en curso con 200.
- **CA-02**: Dado un administrador autenticado, cuando consulta con `fechaDesde` y `fechaHasta` válidos, entonces el sistema devuelve los indicadores del rango con 200.
- **CA-03**: Dado un administrador autenticado, cuando consulta con `fechaDesde` posterior a `fechaHasta`, entonces el sistema rechaza con 400.
- **CA-04**: Dado un administrador autenticado, cuando consulta con rango mayor a 365 días, entonces el sistema rechaza con 400.
- **CA-05**: Dado un usuario con rol ESTUDIANTE, cuando intenta acceder al dashboard, entonces el sistema rechaza con 403.
- **CA-06**: Dado un usuario no autenticado, cuando intenta acceder al dashboard, entonces el sistema rechaza con 401.
- **CA-07**: Dado un administrador autenticado, cuando consulta el dashboard, entonces la respuesta incluye el indicador de capacitaciones por estado.
- **CA-08**: Dado un administrador autenticado, cuando consulta el dashboard, entonces la respuesta incluye el indicador de capacitaciones por cantidad de videos.
- **CA-09**: Dado un administrador autenticado, cuando consulta el dashboard, entonces la respuesta incluye el indicador de usuarios por rol.
- **CA-10**: Dado un administrador autenticado, cuando consulta el dashboard, entonces la respuesta incluye el indicador de usuarios activos vs inactivos.
- **CA-11**: Dado un administrador autenticado, cuando consulta el dashboard, entonces la respuesta incluye el indicador de progreso de videos por capacitación.
- **CA-12**: Dado un administrador autenticado, cuando consulta el dashboard, entonces la respuesta incluye el indicador de evaluaciones por estado.
- **CA-13**: Dado un administrador autenticado, cuando consulta el dashboard, entonces la respuesta incluye el indicador de puntaje promedio por capacitación.
- **CA-14**: Dado un administrador autenticado, cuando consulta el dashboard, entonces la respuesta incluye el indicador de tasa de aprobación por capacitación.
- **CA-15**: Dado un administrador autenticado, cuando consulta el dashboard, entonces la respuesta incluye el indicador de intentos promedio por estudiante.
- **CA-16**: Dado un administrador autenticado, cuando consulta el dashboard, entonces la respuesta incluye el top 5 de capacitaciones con mayor tasa de reprobación.
- **CA-17**: Dado un administrador autenticado, cuando consulta el dashboard, entonces la respuesta incluye el top 5 de estudiantes con mayor progreso.
- **CA-18**: Dado un administrador autenticado, cuando consulta el dashboard, entonces la respuesta incluye el indicador de intentos de captura registrados.
- **CA-19**: Dado un administrador autenticado, cuando consulta el dashboard, entonces la respuesta incluye el indicador de tiempo promedio de visualización por video.
- **CA-20**: Dado un administrador autenticado, cuando consulta el dashboard, entonces la respuesta incluye el top 10 de preguntas más falladas.
- **CA-21**: Dado un administrador autenticado, cuando un indicador falla, entonces el resto se devuelve y el fallido se reporta como `null` con campo de error.
- **CA-22**: Dado un administrador autenticado, cuando consulta el dashboard, entonces el sistema responde 200 con una única respuesta agregada.
- **CA-23**: Dado un administrador autenticado, cuando consulta el dashboard, entonces el tiempo de respuesta no supera los 3 segundos sobre el volumen del seed.
- **CA-24**: Dado un error de validación, autorización o fallo completo, entonces el cuerpo del error sigue el formato `code`, `message`, `details`.
- **CA-25**: Dado un administrador autenticado, cuando intenta crear, editar o eliminar desde el dashboard, entonces el sistema rechaza con 405.
- **CA-26**: Dado un administrador autenticado, cuando consulta con `fechaDesde` válida pero sin `fechaHasta`, entonces el sistema usa la fecha actual como `fechaHasta`.
- **CA-27**: Dado un administrador autenticado, cuando consulta con `fechaHasta` válida pero sin `fechaDesde`, entonces el sistema usa el primer día del mes en curso como `fechaDesde`.
- **CA-28**: Dado un administrador autenticado, cuando consulta el dashboard, entonces los indicadores de intentos reflejan solo el rango solicitado.
- **CA-29**: Dado un administrador autenticado, cuando consulta con rango sin datos, entonces el sistema devuelve indicadores con valor 0 y sin error, con 200.
- **CA-30**: Dado un administrador autenticado, cuando consulta el dashboard, entonces el indicador de capacitaciones por estado separa ARCHIVADAS del resto.
- **CA-31**: Dado un administrador autenticado, cuando consulta el dashboard, entonces el indicador de progreso de videos solo cuenta `ProgresoVideo` con `estado = COMPLETADO`.
- **CA-32**: Dado un administrador autenticado, cuando consulta el dashboard, entonces la respuesta devuelve los indicadores en el orden fijo definido por el backend.
- **CA-33**: Dado un administrador autenticado, cuando repite la consulta con el mismo rango dentro de 30 segundos, entonces el sistema devuelve la respuesta cacheada sin recalcular.
- **CA-34**: Dado un administrador autenticado, cuando realiza POST, PUT o DELETE al endpoint, entonces el sistema rechaza con 405 y formato estándar.
- **CA-35**: Dado un administrador autenticado, cuando consulta el dashboard, entonces el indicador de preguntas más falladas se calcula sobre `RespuestaIntento` con `esCorrecta = false`.

---

## 4. Descomposición técnica

### 4.1 Backend

- Definir DTO de respuesta agregada con los 14 indicadores mínimos, campo de error parcial y orden fijo (S).
- Implementar endpoint GET /api/dashboard con validación de rango, control de acceso por rol, rechazo de métodos no GET y respuesta agregada (M).
- Implementar consulta agregada de capacitaciones por estado (S).
- Implementar consulta agregada de capacitaciones por cantidad de videos (S).
- Implementar consulta agregada de usuarios por rol (S).
- Implementar consulta agregada de usuarios activos vs inactivos (S).
- Implementar consulta agregada de progreso de videos por capacitación (S).
- Implementar consulta agregada de evaluaciones por estado (S).
- Implementar consulta agregada de puntaje promedio por capacitación (S).
- Implementar consulta agregada de tasa de aprobación por capacitación (S).
- Implementar consulta agregada de intentos promedio por estudiante (S).
- Implementar consulta agregada de top 5 capacitaciones con mayor tasa de reprobación (S).
- Implementar consulta agregada de top 5 estudiantes con mayor progreso (S).
- Implementar consulta agregada de intentos de captura registrados (S).
- Implementar consulta agregada de tiempo promedio de visualización por video (S).
- Implementar consulta agregada de top 10 preguntas más falladas (S).
- Implementar manejo de fallo parcial por indicador (S).
- Implementar manejo de rango sin datos con valores 0 (S).
- Implementar cacheo en memoria con TTL de 30 segundos por rango y rol (S).
- Implementar la capa de servicio del dashboard que orquesta consultas en paralelo y arma la respuesta con orden fijo (M).
- Reutilizar middleware de manejo de errores, autenticación JWT y autorización por rol (XS).
- Extender autorización para restringir el dashboard a ADMINISTRADOR (S).

### 4.2 Frontend

- Crear vista del dashboard con tarjetas o gráficos para cada indicador, respetando el orden fijo (M).
- Implementar consumo del endpoint con Axios, interceptor JWT y manejo de errores 400, 401, 403, 405, 500 (M).
- Implementar selector de rango temporal con valores por defecto y validación (S).
- Implementar cálculo de porcentajes a partir de absolutos (S).
- Implementar manejo de fallo parcial: si un indicador llega `null`, mostrar "no disponible" sin romper el resto (S).
- Implementar manejo de rango sin datos: mostrar 0 con mensaje "sin datos en el periodo" (S).
- Implementar estados de carga (skeleton), vacío y error (S).
- Implementar vista responsiva con breakpoints (S).
- Considerar librería de gráficos como Recharts o Chart.js (S).

### 4.3 Persistencia

- Verificar índices sobre campos usados: estado, tipo, prioridad, fechas (XS).
- Crear índice compuesto sobre `intentos(estado, fechaInicio)` (XS).
- Crear índice compuesto sobre `progreso_videos(estado, videoId)` (XS).
- Crear índice compuesto sobre `respuesta_intento(preguntaId, esCorrecta)` (XS).
- Crear índice sobre `intentos_captura(usuarioId, timestamp)` (XS).
- Reutilizar seeds de HU-001 a HU-005 (XS).

### 4.4 Seguridad

- Reutilizar middleware de autenticación JWT (XS).
- Extender autorización para restringir dashboard a ADMINISTRADOR (S).
- Garantizar rechazo de métodos distintos de GET con 405 (S).

### 4.5 Testing

- Pruebas unitarias del servicio del dashboard para cada indicador (M).
- Pruebas unitarias de validación de rango (S).
- Pruebas unitarias de fallo parcial (S).
- Pruebas unitarias de rango sin datos (S).
- Pruebas unitarias del indicador de capacitaciones por estado separando ARCHIVADAS (S).
- Pruebas unitarias del indicador de progreso de videos (S).
- Pruebas unitarias del indicador de preguntas más falladas (S).
- Pruebas unitarias del cacheo con TTL de 30 segundos (S).
- Pruebas de integración del endpoint /api/dashboard con códigos 200, 400, 401, 403, 405, 500 (M).
- Pruebas de componente del frontend para la vista, selector y fallo parcial (M).
- Smoke test end-to-end: autenticarse, consultar dashboard con rango por defecto, con rango personalizado, verificar cacheo (S).
- Cobertura mínima 80% en la capa de servicio (XS).

### 4.6 Docker

- Reutilizar configuración de healthcheck, depends_on y arranque automático (XS).
- Verificar que los nuevos índices se creen al iniciar (S).
- Documentar endpoints y variables de entorno en README (XS).

---

## 5. Estimación

- **Backend**: L (DTO S, endpoint M, 14 consultas agregadas S cada una, manejo de fallo parcial S, rango sin datos S, cacheo S, servicio M, reutilización XS, autorización S).
- **Frontend**: L (vista dashboard M, Axios M, selector rango S, cálculo porcentajes S, fallo parcial S, rango sin datos S, estados de carga S, responsivo S, gráficos S).
- **Persistencia**: S (verificación XS, índices compuestos XS, reutilización seeds XS).
- **Seguridad**: S (reutilización auth XS, autorización extendida S, rechazo métodos S).
- **Testing**: L (unitarias M, rango S, fallo parcial S, rango sin datos S, capacitaciones por estado S, progreso videos S, preguntas falladas S, cacheo S, integración M, componente M, smoke S, cobertura XS).
- **Docker**: XS.

---

## 6. Priorización

### MVP

- DTO de respuesta agregada con 14 indicadores, campo de error parcial y orden fijo.
- Endpoint GET /api/dashboard con validación de rango, control de acceso y rechazo de métodos no GET.
- 14 consultas agregadas.
- Manejo de fallo parcial.
- Manejo de rango sin datos con valores 0.
- Indicador de capacitaciones por estado separando ARCHIVADAS.
- Indicador de progreso de videos solo con COMPLETADO.
- Indicador de preguntas más falladas.
- Cacheo en memoria con TTL de 30 segundos.
- Índices compuestos para consultas más costosas.
- Frontend funcional: vista, selector de rango, fallo parcial, rango sin datos, estados de carga.
- Pruebas unitarias del servicio y validación de rango.
- Pruebas de integración del endpoint.
- Docker con arranque automático.

### Funcionalidades opcionales

- Pruebas de componente del frontend.
- Smoke test end-to-end.
- Estados de carga mediante skeleton.
- Diseño responsive completo.
- Refresco automático cada N segundos.
- Exportación a CSV.
- Gráficos avanzados (Recharts, Chart.js).

### Mejoras futuras

- Comparación con periodos anteriores y tendencias.
- Exportación a PDF.
- Filtros adicionales por tipo de capacitación y por usuario.
- Panel configurable por el usuario.
- Indicadores de SLA y tiempo medio de completado.
- Logging estructurado con correlation ID.
- Rate limiting en la API.
- Precalculado en background para volúmenes grandes.
- Cacheo distribuido en Redis.
- Alertas automáticas cuando la tasa de reprobación supera un umbral.
- Notificaciones al administrador sobre intentos de captura recurrentes.

---

## 7. Justificación

### 7.1 Actividades agregadas

- Se agregó el DTO de respuesta agregada del dashboard para estandarizar el contrato.
- Se agregaron los 14 indicadores mínimos, cubriendo capacitaciones, usuarios, progreso, evaluaciones, desempeño y seguridad.
- Se agregó validación de rango temporal (fechaDesde no posterior a fechaHasta, máximo 365 días, valores por defecto).
- Se agregó manejo de fallo parcial por indicador.
- Se agregó manejo de rango sin datos con valores 0 y sin error.
- Se agregó separación de capacitaciones ARCHIVADAS en el indicador de estado.
- Se agregó filtro por rango temporal en indicadores de intentos.
- Se agregó indicador de progreso de videos solo con `estado = COMPLETADO`.
- Se agregó indicador de preguntas más falladas.
- Se agregó cacheo en memoria con TTL de 30 segundos.
- Se agregó orden fijo de indicadores.
- Se agregaron índices compuestos para las consultas más costosas.
- Se agregaron reglas RN-01 a RN-24 y criterios CA-01 a CA-35 para cerrar trazabilidad.
- Se agregó rechazo explícito de métodos distintos de GET con 405.
- Se agregó reutilización de middlewares de autenticación, autorización y manejo de errores.
- Se agregó autorización extendida para restringir el dashboard a ADMINISTRADOR.

### 7.2 Actividades eliminadas

- Se eliminó exportación a CSV y PDF del MVP.
- Se eliminó refresco automático del MVP.
- Se eliminó comparación con periodos anteriores del MVP.
- Se eliminó panel configurable por el usuario del MVP.
- Se eliminó paginación del dashboard (respuesta agregada única).
- Se eliminó cálculo de porcentajes en backend (dejado al frontend).

### 7.3 Decisiones tomadas

- Se decidió que el dashboard sea de solo lectura y rechace métodos distintos de GET con 405.
- Se decidió rango por defecto: mes en curso.
- Se decidió rango máximo de 365 días.
- Se decidió respuesta agregada única.
- Se decidió fallo parcial como `null` con campo de error.
- Se decidió rango sin datos con valores 0 y sin error.
- Se decidió separar capacitaciones ARCHIVADAS.
- Se decidió filtrar indicadores de intentos por rango temporal.
- Se decidió cacheo de 30 segundos por rango y rol.
- Se decidió orden fijo de indicadores.
- Se decidió cálculo en tiempo real sobre columnas indexadas.
- Se decidió incluir 14 indicadores mínimos cubriendo todas las áreas.
- Se decidió disponibilidad solo para ADMINISTRADOR.
- Se decidió excluir exportación, refresco automático y comparación del MVP.
- Se decidió backend devuelve valores absolutos y frontend calcula porcentajes.
- Se decidió reutilizar middlewares y contratos de HU-001.
- Se decidió formato de fechas ISO 8601.

### 7.4 Riesgos identificados

- **R-01** (degradación de rendimiento): mitigado con índices compuestos, límite de 365 días y cacheo de 30 segundos; CA-23 verifica tiempo de respuesta.
- **R-02** (rango temporal inconsistente): mitigado con rango por defecto; CA-01 lo verifica.
- **R-03** (acceso no autorizado): mitigado con autorización a ADMINISTRADOR; CA-05 y CA-06 lo verifican.
- **R-04** (datos inconsistentes): mitigado reutilizando las mismas tablas y claves foráneas.
- **R-05** (rango abusivo): mitigado con límite de 365 días; CA-04 lo verifica.
- **R-06** (fallo total por un indicador): mitigado con fallo parcial; CA-21 lo verifica.
- **R-07** (formato inconsistente): mitigado con DTO definido.
- **R-08** (alcance creciente): mitigado con 14 indicadores mínimos; CA-07 a CA-20 lo verifican.
- **R-09** (tiempo real vs precalculado): mitigado con RN-10.
- **R-10** (orden inconsistente): mitigado con orden fijo; CA-32 lo verifica.
- **R-11** (rango sin datos como error): mitigado con RN-18; CA-29 lo verifica.
- **R-12** (capacitaciones archivadas contadas como activas): mitigado con RN-19; CA-30 lo verifica.
- **R-13** (carga de usuarios sin filtro temporal): mitigado con RN-11; CA-28 lo verifica.

---

# Stack Tecnológico 

## Frontend

- **React + Vite + TypeScript**: Stack moderno, rápido, con tipado fuerte.
- **TailwindCSS**: Estilado rápido y responsivo.
- **TanStack Query**: Manejo eficiente del estado del servidor, caché, refetching.
- **React Router**: Enrutamiento dinámico para sidebar y rutas.
- **Recharts o Chart.js**: Gráficos para el dashboard.
- **dnd-kit**: Drag-and-drop para reordenar submódulos y preguntas.
- **H5P (opcional)**: Para tipos de preguntas interactivas complejas ya empaquetadas.

## Backend

- **Node.js + Express + TypeScript**: Stack ampliamente probado en LMS.
- **PostgreSQL (Neon)**: Base de datos relacional robusta.
- **BetterAuth**: Autenticación moderna con roles.
- **JWT + HTTP-only cookies**: Seguridad en autenticación.
- **Multer / @fastify/multipart**: Subida de archivos.
- **fluent-ffmpeg**: Watermark y procesamiento de video.
- **node-cache**: Cacheo en memoria con TTL para el dashboard.

## Video y Protección

- **Almacenamiento local (MVP)**: Cero costo, con StorageService abstracto.
- **AWS S3 + CloudFront (futuro)**: URLs firmadas, escalable.
- **VdoCipher (futuro)**: DRM y watermarking dinámico.
- **Screenshot Privacy Protection Web**: Bloqueo de atajos y menú contextual.

## Infraestructura

- **Docker + docker-compose**: Consistencia en desarrollo y despliegue.
- **GitHub Actions**: CI/CD automatizado.
- **Vercel / Render / Railway**: Despliegue simplificado para MVP.
- **Jest + React Testing Library + Supertest**: Testing unitario e integración.

## Resumen del stack
