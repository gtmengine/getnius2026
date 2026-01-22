# Getnius - Guía de GitHub (Paywall + Match/Not Match)

Documento operativo con comandos listos para copiar/pegar. Incluye: (1) flujo para subir tu rama, mergear a master y limpiar ramas; (2) flujo completo para que Georgy trabaje en Match/Not Match desde master.

## Suposiciones

- Repo remoto `origin` apunta a tu repositorio en GitHub
- Rama principal remota `master` (ajusta si tu repo usa `main`)
- Gestor de paquetes `pnpm`
- Sistema macOS/Linux (comandos iguales en la mayoría de casos)

---

## 1) Tu flujo - subir tu rama local, merge a master, sincronizar y limpiar

**Objetivo:** publicar los cambios actuales (paywall) desde tu rama de trabajo, hacer merge a master en GitHub, actualizar tu master local y eliminar ramas temporales tanto local como remoto.

### 1.1 Verifica estado y actualiza tu master local antes de merge

Esto evita conflictos sorpresa si tu rama fue creada hace tiempo.

```bash
# Asegura que no tengas cambios sin commit
git status

# Cambia a master y trae lo ultimo de GitHub
git checkout master
git pull origin master
```

### 1.2 Regresa a tu rama de trabajo y rebasea (opcional, recomendado)

Si tu rama se atraso, rebase sobre master para un historial limpio. Si prefieres merge, omite el rebase.

```bash
# Cambia a tu rama de trabajo (ejemplo)
git checkout feat/paywall-ui-polish

# Rebasea contra master actualizado
git rebase master
```

### 1.3 Corre validaciones locales

Checklist minima antes de subir a GitHub.

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test # si existe
pnpm dev # verifica: search -> resultados -> paywall 7s; modal close; subscribe modal
```

### 1.4 Commit sugerido

Usa un commit claro y orientado a cambios de UI (manteniendo el tono del repo).

```bash
git add -A
git commit -m "Paywall: polish modal UI, pricing options, and plan cards layout"
```

### 1.5 Push de tu rama a GitHub

```bash
# Primera vez que subes la rama
git push -u origin feat/paywall-ui-polish
```

### 1.6 Merge a master en GitHub (recomendado via Pull Request)

En GitHub: abre Pull Request desde tu rama -> master. Revisa el diff, ejecuta checks, y mergea (Squash o Merge segun tu preferencia).

Si necesitas hacerlo por terminal y tienes permiso:

```bash
# Trae refs remotas
git fetch origin

# Asegura master actualizado
git checkout master
git pull origin master

# Mergea la rama (sin reescribir historial)
git merge --no-ff origin/feat/paywall-ui-polish

# Empuja master a GitHub
git push origin master
```

### 1.7 Sincroniza tu master local despues del merge

```bash
git checkout master
git pull origin master
```

### 1.8 Borra ramas adicionales (local y remoto)

Solo borra la rama si ya fue mergeada y no la necesitas.

```bash
# Borra rama local
git branch -d feat/paywall-ui-polish

# Borra rama remota en GitHub
git push origin --delete feat/paywall-ui-polish

# Limpia referencias remotas locales
git fetch -p
```

---

## 2) Flujo para Georgy - trabajar en Match / Not Match

**Objetivo:** Georgy baja lo ultimo de master desde GitHub, crea una rama de trabajo, implementa cambios de Match/Not Match con ayuda de Codex, sube la rama, hace PR a master y limpia ramas.

### 2.1 Clonar repo (si aun no lo tiene)

```bash
# Opcion A: clonar por HTTPS
git clone <REPO_URL>
cd <REPO_FOLDER>

# Opcion B: si ya existe el repo local, entra a la carpeta
cd <REPO_FOLDER>
```

### 2.2 Asegurar que origin apunte al repo correcto

```bash
git remote -v

# Si origin esta mal, corrige:
# git remote set-url origin <REPO_URL>
```

### 2.3 Actualizar master local con lo ultimo de GitHub

```bash
git checkout master
git pull origin master
```

### 2.4 Crear una nueva rama de trabajo

Nombre sugerido (ajustable): `feat/match-notmatch-ui`

```bash
git checkout -b feat/match-notmatch-ui
```

### 2.5 Prompt ejemplo para Codex (Match / Not Match)

Copia/pega este prompt en Codex. Ajusta rutas/archivos si tu estructura difiere.

```
You are working in the Getnius Next.js app. Implement UI/UX improvements for the "Match / Not Match" in the Companies (and any other relevant) results table, keeping the existing Getnius visual system.

Goals:
1) Make Match and Not Match actions clearer and safer:
   - Provide a visible selected-row count.
   - Disable actions when no rows are selected.
   - Add a lightweight confirmation only for Not Match (since it is destructive to pipeline),
   but keep it fast (modal or popover).

2) Row state:
   - Add/update a "matchStatus" field per row with values: "match" | "not_match" | null.
   - When the user clicks Match, set matchStatus="match" for all selected rows.
   - When the user clicks Not Match, set matchStatus="not_match" for all selected rows.
   - Persist the change in the same way Getnius currently persists table data (localStorage or existing

3) Visual cues:
   - Show a small chip/badge in the "MATCH" column reflecting the status:
     Match -> green chip, Not Match -> red chip, null -> empty or subtle placeholder.
   - Ensure contrast meets accessibility guidelines.

4) Keyboard + accessibility:
   - Actions must be reachable via keyboard.
   - Buttons must have aria-labels; confirm dialog must trap focus and close on Escape.

5) No breaking changes:
   - Do NOT change existing table layout/columns beyond adding the badge/chip behavior.
   - Keep styling consistent with Getnius (purple accent, rounded corners, subtle borders/shadows).

Deliverables:
- Update or create components as needed.
- Update types if necessary.
- Include brief comments in code for new logic.
- After implementation: run typecheck/lint and fix issues.

Return:
- The exact files changed with a short summary of what changed
```

### 2.6 Desarrollar y validar cambios

```bash
# Instalar dependencias
pnpm install

# Verificar que funciona antes de commit
pnpm dev

# Correr validaciones
pnpm lint
pnpm typecheck
pnpm test # si existe
```

### 2.7 Commit y push de cambios

```bash
# Agregar cambios
git add -A

# Commit descriptivo
git commit -m "feat: implement Match/Not Match UI improvements with status badges and confirmations"

# Push a GitHub
git push -u origin feat/match-notmatch-ui
```

### 2.8 Crear Pull Request en GitHub

- Ve a GitHub y abre un Pull Request desde `feat/match-notmatch-ui` -> `master`
- Revisa el diff y ejecuta los checks automáticos
- Una vez aprobado, mergea el PR (Squash o Merge según preferencia)

### 2.9 Limpiar ramas después del merge

```bash
# Cambiar a master y actualizar
git checkout master
git pull origin master

# Borrar rama local
git branch -d feat/match-notmatch-ui

# Borrar rama remota
git push origin --delete feat/match-notmatch-ui

# Limpiar referencias
git fetch -p
```

---

## Comandos de utilidad adicionales

### Ver estado del repo
```bash
# Ver todas las ramas
git branch -a

# Ver estado detallado
git status -v

# Ver historial reciente
git log --oneline -10
```

### Resolver conflictos de merge
```bash
# Si hay conflictos durante rebase/merge
git status
# Edita los archivos conflictivos
git add <archivo_conflictivo>
git rebase --continue  # o git merge --continue
```

### Resetear cambios locales (cuidado!)
```bash
# Descartar cambios no commited
git checkout -- .

# Resetear al ultimo commit
git reset --hard HEAD
```

---

**Nota:** Recuerda ajustar `<REPO_URL>` y nombres de ramas según tu configuración específica. Mantén la comunicación con el equipo durante los merges para evitar conflictos.
