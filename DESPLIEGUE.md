# Cómo desplegar la Quiniela Mundial 2026 (gratis)

## Paso 1 — Crear base de datos en Supabase (gratis)

1. Ve a https://supabase.com y crea una cuenta gratis.
2. Crea un nuevo proyecto (dale un nombre, ej. "quiniela2026").
3. Espera que se inicialice (~1 min).
4. Ve a **SQL Editor** en el menú izquierdo.
5. Copia y pega todo el contenido de `supabase/schema.sql` y ejecútalo.
6. Ve a **Settings → API** y copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (¡mantén esta en secreto!)

## Paso 2 — Subir el código a GitHub

1. Crea una cuenta en https://github.com si no tienes.
2. Crea un repositorio nuevo (privado recomendado).
3. En tu carpeta QUINIELA, abre una terminal y ejecuta:
   ```
   git init
   git add .
   git commit -m "Quiniela Mundial 2026"
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```

## Paso 3 — Desplegar en Vercel (gratis)

1. Ve a https://vercel.com y crea una cuenta (usa tu cuenta de GitHub).
2. Haz clic en **"Add New Project"** e importa tu repositorio.
3. En la sección **Environment Variables**, agrega:
   ```
   NEXT_PUBLIC_SUPABASE_URL     = (tu URL de Supabase)
   NEXT_PUBLIC_SUPABASE_ANON_KEY = (tu anon key)
   SUPABASE_SERVICE_ROLE_KEY    = (tu service role key)
   JWT_SECRET                   = (una cadena aleatoria larga, ej. 32+ caracteres)
   ```
4. Haz clic en **Deploy**. En ~2 minutos tu app estará en línea.
5. Vercel te da una URL tipo: `https://quiniela-xxx.vercel.app`

## Paso 4 — Primera vez que entras

1. Ve a tu URL y entra con:
   - Usuario: `admin`
   - Contraseña: `admin123`
2. **IMPORTANTE:** Ve a Admin → Usuarios y cambia tu contraseña de inmediato.

## Paso 5 — Crear cuentas para los participantes

1. Ve a **Admin → Usuarios**.
2. Crea un usuario por cada participante (nombre, usuario, contraseña inicial).
3. Comparte la URL y sus credenciales por WhatsApp/correo.

## Notas

- La app se actualiza automáticamente cada vez que haces `git push`.
- Los resultados se ingresan desde **Admin → Resultados** después de cada partido.
- Los puntos se calculan automáticamente al guardar cada resultado.
- La tabla de posiciones se actualiza en tiempo real.

## Generador de JWT_SECRET

Puedes usar este comando en PowerShell para generar un secret seguro:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | % {[char]$_})
```
