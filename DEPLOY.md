# Despliegue automático a cPanel

El sitio se publica solo: cada cambio que llega a la rama `main` se sube a cPanel
por FTP mediante GitHub Actions (ver `.github/workflows/deploy.yml`).

## Configuración (una sola vez)

1. En GitHub, entrá al repositorio → **Settings** → **Secrets and variables** →
   **Actions** → botón **New repository secret**.
2. Creá estos 3 secrets (los valores los sacás de cPanel → *Cuentas FTP*):

   | Nombre        | Valor                                                        |
   |---------------|--------------------------------------------------------------|
   | `FTP_SERVER`  | El host FTP, ej: `ftp.tudominio.com` (sin `ftp://`)          |
   | `FTP_USERNAME`| El usuario FTP completo, ej: `usuario@tudominio.com`         |
   | `FTP_PASSWORD`| La contraseña de esa cuenta FTP                              |

   > Los secrets quedan guardados y cifrados en GitHub. Nunca van en el código ni en el chat.

3. Revisá en `.github/workflows/deploy.yml` el campo **`server-dir`**:
   - Si usás la cuenta FTP principal de cPanel → dejá `./public_html/`.
   - Si creaste una cuenta FTP que ya entra directo a la carpeta del sitio → poné `./`.

4. Si tu hosting no soporta FTPS, cambiá `protocol: ftps` por `protocol: ftp`.

## Cómo se usa a partir de ahora

- Editás los archivos (HTML, CSS, imágenes, etc.) y los subís a `main`.
- En la pestaña **Actions** de GitHub vas a ver el despliegue corriendo.
- Cuando termina (tilde verde), el sitio ya está actualizado en cPanel.

También podés lanzarlo a mano desde **Actions** → *Deploy a cPanel (FTP)* →
**Run workflow**.
