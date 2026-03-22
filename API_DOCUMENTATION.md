# 📚 Documentación de API FitManager SaaS

**Base URL:** `http://localhost:5000/api`  
**Formato de datos:** `JSON`  
**Autenticación:** JWT vía Header `Authorization: Bearer <token>` o Cookie `token`.

---

## 🔐 1. Autenticación (Auth)

### Registro Inicial (Onboarding SaaS)
*   **POST** `/auth/register`
*   **Descripción:** Crea un nuevo gimnasio y su usuario administrador inicial. No requiere token.
*   **Body:**
    ```json
    {
      "nombre": "Admin Name",
      "email": "admin@gym.com",
      "password": "secret_password",
      "nombreGimnasio": "Laguna Fitness" 
    }
    ```

### Crear Personal (Staff)
*   **POST** `/auth/staff`
*   **Protección:** Solo Admin (Requiere Token).
*   **Descripción:** Crea un nuevo empleado o administrador para el gimnasio actual.
*   **Body:**
    ```json
    {
      "nombre": "User Name",
      "email": "user@gym.com",
      "password": "user_password",
      "rol": "recepcion" // Opciones: "admin", "recepcion" (empleado)
    }
    ```

### Login
*   **POST** `/auth/login`
*   **Body:** 
    ```json
    {
      "email": "admin@gym.com", 
      "password": "secret_password"
    }
    ```
*   **Respuesta:** Devuelve `token` y objeto `user` (id_usuario, id_gimnasio, rol).

### Obtener Perfil (Me)
*   **GET** `/auth/me`
*   **Respuesta:** Datos del usuario autenticado y detalles de su gimnasio.

### Logout
*   **GET** `/auth/logout`
*   **Descripción:** Limpia la cookie del token.

### Listar Usuarios
*   **GET** `/auth/users`
*   **Descripción:** Lista todos los usuarios (staff/admin) del gimnasio actual.

---

## 👥 2. Miembros (Members)

### Listar Miembros (Paginado)
*   **GET** `/members?page=1&limit=20`
*   **Respuesta:**
    ```json
    {
      "success": true,
      "count": 150,
      "totalPages": 8,
      "currentPage": 1,
      "data": [...]
    }
    ```

### Crear Miembro
*   **POST** `/members`
*   **Body:** 
    ```json
    {
      "nombre": "Juan", 
      "apellido": "Perez", 
      "telefono": "12345678"
    }
    ```

### Detalle, Actualizar y Borrar
*   **GET** `/members/:id`
*   **PUT** `/members/:id`
*   **DELETE** `/members/:id` (Realiza **Soft Delete**, el registro persiste pero se oculta).

---

## 💳 3. Pagos y Cobranza (Payments)

### Listar Pagos (Paginado)
*   **GET** `/payments?page=1&limit=10`
*   **Respuesta:** Historial cronológico (DESC).

### Alertas de Vencidos
*   **GET** `/payments/alerts`
*   **Descripción:** Miembros cuya membresía ha expirado.

### Registrar Pago Manual (Efectivo/Transferencia)
*   **POST** `/payments`
*   **Body:**
    ```json
    {
      "id_miembro": 5,
      "id_membresia": 2,
      "monto": 500.00,
      "metodo_pago": "efectivo",
      "fecha_vencimiento": "2026-04-19"
    }
    ```

### Crear Intento de Pago (Stripe)
*   **POST** `/payments/create-intent`
*   **Body:** 
    ```json
    {
      "id_miembro": 5, 
      "id_membresia": 1, 
      "monto": 450
    }
    ```
*   **Respuesta:** `{"clientSecret": "pi_..."}`

### Webhook de Stripe (Interno)
*   **POST** `/payments/webhook`
*   **Descripción:** Endpoint para recibir notificaciones automáticas de Stripe. Requiere firma de Stripe.

---

## 🏋️ 4. Membresías (Planes)

### Listar Planes
*   **GET** `/membresias`

### Gestión de Planes (Solo Admin)
*   **POST** `/membresias`
*   **PUT** `/membresias/:id`
*   **DELETE** `/membresias/:id`
*   **Body:** 
    ```json
    {
      "nombre": "Mensualidad", 
      "precio": 450.00, 
      "duracion_dias": 30
    }
    ```

---

## 🕒 5. Visitas (Access Control)

### Listar Visitas (Paginado)
*   **GET** `/visitas?page=1&limit=20`

### Estadísticas de Hoy
*   **GET** `/visitas/stats/today`
*   **Respuesta:**
    ```json
    {
      "success": true,
      "data": {
        "hoy": 15,
        "ultimaHora": 2,
        "promedioDiario": 12
      }
    }
    ```

### Registrar Visita
*   **POST** `/visitas`
*   **Body:** 
    ```json
    { "id_miembro": 5 }
    ```

### Verificar Estado de Miembro (Check-in)
*   **GET** `/visitas/check-status/:id`
*   **Descripción:** Verifica si un miembro tiene membresía vigente antes de registrar la visita.

---

## 📱 6. Notificaciones (WhatsApp)

### Enviar Recordatorio
*   **POST** `/notifications/send-reminder/:id`
*   **Descripción:** Envía un mensaje de recordatorio vía WhatsApp al miembro.

---

## 🛡️ Manejo de Errores Estándar

Todas las respuestas fallidas siguen este formato:
```json
{
  "success": false,
  "error": "Mensaje descriptivo del error"
}
```
*   **401:** No autorizado (Token faltante o expirado).
*   **403:** Prohibido (El rol del usuario no tiene permisos para esta acción).
*   **404:** No encontrado (El recurso no existe o pertenece a otro gimnasio).
*   **400:** Solicitud incorrecta (Faltan campos obligatorios o error de validación).

---

### 💡 Tips para el Frontend:
1.  **JWT:** Inyecta el token en el header `Authorization: Bearer <token>` o como cookie.
2.  **Multitenancy:** El `id_gimnasio` es manejado automáticamente por el servidor basándose en el usuario autenticado. No es necesario enviarlo en los payloads (excepto en `/auth/register`).
