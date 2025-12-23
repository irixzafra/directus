# Sincronizar con GitHub

Sincroniza el repositorio local con GitHub (https://github.com/irixzafra/directus).

## Instrucciones

1. Primero, muestra el estado actual del repositorio con `git status`
2. Si hay cambios sin commitear:
   - Haz `git add .` para añadir todos los cambios
   - Pregunta al usuario por un mensaje de commit descriptivo usando AskUserQuestion
   - Ejecuta `git commit` con el mensaje proporcionado
3. Ejecuta `git pull --rebase origin main` para traer cambios del remoto (si existe la rama main, si no usa master)
4. Ejecuta `git push origin` para subir los cambios
5. Muestra un resumen del estado final

## Notas
- El repositorio remoto es: https://github.com/irixzafra/directus
- Asegúrate de resolver conflictos si los hay antes de continuar
