# Plan: SDLC Agéntico sobre GitHub (gh-aw)

## Convención de archivos

Un par SPEC+tareas por plan, vinculados por el número de issue y el mismo
nombre de archivo:

```
docs/
├── specs/
│   └── 2026-08-22-issue-123-user-auth-refactor.md  # el plan revisable
└── tasks/
    └── 2026-08-22-issue-123-user-auth-refactor.md  # checklist de ejecución
```

- `<DATE>-issue-<ISSUE_NUMBER>-<SHORT_TITLE>` es el identificador común de
  ambos archivos.
- Ambos archivos llevan **frontmatter** con metadatos: número del issue origen, estado (`planned` / `in-progress` / `blocked` / `done`), autor del issue.
- El archivo de tareas agrupa pasos tentativos y secuenciales por fases; cada
  paso usa checklist (`- [ ]` / `- [x]`) con IDs cortos (T1, T2...). Por ejemplo:

  ```markdown
  ## Fase 1: Preparación

  - [ ] T1: Identificar los módulos afectados
  - [ ] T2: Implementar el cambio de contrato

  ## Fase 2: Verificación

  - [ ] T3: Ejecutar la validación acordada
  ```

  Ese formato permite retomar tras un error: el estado queda persistido en el
  repo vía los propios commits, no en la memoria del agente.
- Cada commit referencia su tarea (`T3: ...`) para trazabilidad bidireccional commit ↔ checklist.

## Flujo completo

```
Issue + label "agent:plan"
   └─> [WF1 · Planner] agente investiga repo
        ├─ Ambigüedad material → comenta preguntas en el issue y menciona
        │  a @creador-del-issue; pausa sin crear PR. Tras responder, se vuelve
        │  a aplicar el label para reanudar el flujo.
        └─> genera AMBOS archivos en UN solo PR
        "[spec] 2026-08-22-slug" vinculado al issue
             ├─ Comentás correcciones → agente re-procesa y actualiza el PR
             └─ Aprobación + merge a main
                  └─> [WF2 · Dispatcher] push a main con paths docs/specs/**
                       → lee frontmatter del spec → asigna el issue origen a Copilot cloud
                            └─> [Copilot coding agent]
                                 rama sdlc/2026-08-22-slug
                                 ejecuta T1→Tn secuencialmente, commit atómico por tarea,
                                 marca checkbox correspondiente en cada commit
                                      ├─ Bloqueo → comenta en el issue origen
                                      │            tagueándote (@creador-del-issue)
                                      │            esperás resolución o indicás saltar
                                      └─ Tn completa → abre 1 único PR hacia main
                                           → CI + tu aprobación → merge → issue se cierra
```

## WF1 · Planner

- **Trigger**: únicamente el label `agent:plan` sobre issues. Nada de disparar en toda apertura de issue.
- **Agente**: investiga el repo a partir del issue y produce los dos archivos en el mismo PR — son una unidad de revisión inseparable (no tiene sentido aprobar un spec sin sus tareas).
- **Ambigüedades**: antes de escribir, si falta una definición material, comenta
  las preguntas concretas en el issue origen y menciona a su autor. No adivina,
  no crea archivos ni PR, y espera una respuesta seguida de una nueva aplicación
  del label disparador.
- **Iteración**: los comentarios sobre el PR permiten pedir correcciones al agente en la rama de planificación.
- **Safe outputs**: `add-comment` para solicitar aclaraciones y
  `create-pull-request` para proponer el par SPEC+tareas; permisos read-only
  salvo esas salidas.

## WF2 · Dispatcher (workflow liviano, casi sin IA)

- **Trigger**: `push` a main filtrando `docs/specs/**`. Determinístico: el merge ES la señal.
- **Trabajo**: leer el frontmatter del spec recién mergeado, recuperar el número de issue origen y asignarlo a **Copilot cloud** (`assign-to-user`). Es orquestación simple; acá el costo de IA debería ser mínimo o nulo.
- Nota: delegar en Copilot cloud implica que la ejecución pesada corre en infraestructura de GitHub, no en tus runners de Actions — solo pagás la asignación/orquestación.

## Ejecución · Copilot cloud agent

- Trabaja en rama dedicada (`sdlc/<date>-issue-<number>-<slug>`), ejecuta las fases y tareas del checklist en orden estricto, un commit atómico por tarea, actualizando el checkbox en el propio commit.
- **Recuperación ante fallos**: como las tareas viven en el repo y cada commit refleja el avance, cualquier reejecución (misma sesión de Copilot o re-asignación del issue) puede detectar la última tarea completada y continuar desde ahí. La fuente de verdad es el diff, nunca la conversación.
- **Protocolo de bloqueo**: al trabarse en una tarea, comenta en el **issue origen** taggeando a quien lo creó (el frontmatter lo sabe), explica el bloqueo y pausa. Vos respondés en el issue: resolvés o indicás "saltear T4"; el agente continúa con el resto.
- **Cierre**: completadas todas las tareas, abre **un único PR** hacia main con `Closes #N` referenciando el issue. CI corre, vos aprobás y mergeás; el issue se cierra automáticamente.
- Los comentarios tuyos sobre ese PR también llegan a Copilot cloud, así que la iteración post-PR usa el canal estándar de GitHub.

## Guardarraíles transversales

1. Branch protection en main: tu aprobación obligatoria en ambos tipos de PR (plan y código). Nadie excepto vos merguea.
2. Permisos read-all + safe-outputs sanitizados en los workflows gh-aw; Copilot cloud opera bajo sus propios límites de permisos de repo.
3. Labels de trazabilidad: `[spec]`, `[ai-generated]`, y estado en frontmatter del spec que el dispatcher puede actualizar.
4. Límites: timeout en WF1, `max` en safe-outputs, y protección contra doble-disparo de WF2 si mergean varios specs juntos (concurrencia por slug).

## Decisiones tomadas vs. pendientes

| Punto | Decisión |
|---|---|
| Trigger WF1 | Label específico ✔ |
| Modelo | Se define al crear cada workflow ✔ |
| Multi-PR | Un solo PR al final (multi-PR a futuro) ✔ |
| Ejecutor | Copilot cloud agent ✔ |
| Estrategia | Secuencial, rama propia, commits atómicos ✔ |

**Pendientes menores**: nombre exacto del label disparador, formato fino del checklist (¿incluye tests/criterios por tarea?), y qué hace WF2 si el issue origen fue cerrado o borrado antes del merge del spec.

## Próximos pasos

1. Implementar WF1 + convención de archivos; verificar el loop de revisión/comentarios del spec PR.
2. Implementar WF2 + delegación a Copilot cloud.
3. Validar recuperación ante crasheo y protocolo de bloqueo end-to-end.
