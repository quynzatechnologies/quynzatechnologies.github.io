/**
 * ============================================================
 *  progreso_state.js
 *  Lógica interna del progreso por curso (front-end)
 * ============================================================
 *
 *   Este módulo:
 *     - Usa ProgresoAPI para leer/escribir en backend
 *     - Mantiene estado local por curso
 *     - Mezcla datos locales + remotos
 *     - Expone funciones:
 *
 *       ProgresoState.init(courseId, estructuraJSON)
 *       ProgresoState.onLessonChange(courseId, lessonId)
 *       ProgresoState.marcarComoCompletado(courseId, lessonId)
 *       ProgresoState.getState(courseId)
 *
 *   No modifica la UI. Eso irá aparte si quieres.
 *
 * ============================================================
 */

(function (window) {
  "use strict";

  const LOCAL_KEY_PREFIX = "progreso_local_";

  /**
   * Estructura interna por curso:
   * state[courseId] = {
   *   ready: false,
   *   ultima_leccion: "mod1.sec1...",
   *   completadas: Set([...]),
   *   registros: {},
   *   allLessons: [...], // Extraído del JSON
   * }
   */
  const state = {};

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function getLocalKey(courseId) {
    return LOCAL_KEY_PREFIX + courseId;
  }

  function loadLocal(courseId) {
    try {
      const raw = localStorage.getItem(getLocalKey(courseId));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveLocal(courseId, st) {
    const minimal = {
      ultima_leccion: st.ultima_leccion,
      completadas: [...st.completadas],
      registros: st.registros,
    };
    localStorage.setItem(getLocalKey(courseId), JSON.stringify(minimal));
  }

  function extractAllLessonsFromJSON(estructura) {
    const result = [];

    function collect(node) {
      if (node.archivo) result.push(node.id);
      if (node.items) node.items.forEach(collect);
    }

    estructura.forEach(collect);
    return result;
  }

  // ----------------------------------------------------------
  // Mezclar progreso local + remoto
  // ----------------------------------------------------------
  function mergeProgress(remote, local, allLessons) {
    const completadas = new Set();

    if (Array.isArray(local?.completadas)) {
      local.completadas.forEach((x) => completadas.add(x));
    }
    if (Array.isArray(remote?.completadas)) {
      remote.completadas.forEach((x) => completadas.add(x));
    }

    const registros = {};
    if (local?.registros) Object.assign(registros, local.registros);
    if (remote?.registros) Object.assign(registros, remote.registros);

    const ultima_leccion = remote?.ultima_leccion || local?.ultima_leccion || null;

    return {
      ultima_leccion,
      completadas,
      registros,
      allLessons,
    };
  }

  // ----------------------------------------------------------
  // Inicializar estado del curso
  // ----------------------------------------------------------
  async function init(courseId, estructuraJSON) {
    const allLessons = extractAllLessonsFromJSON(estructuraJSON);
    const local = loadLocal(courseId);

    let remote = null;
    if (ProgresoAPI.isLoggedIn(courseId)) {
      const res = await ProgresoAPI.obtenerProgreso(courseId);
      if (res.ok) {
        remote = res.data;
      }
    }

    const merged = mergeProgress(remote, local, allLessons);

    state[courseId] = {
      ready: true,
      ultima_leccion: merged.ultima_leccion,
      completadas: merged.completadas,
      registros: merged.registros,
      allLessons: merged.allLessons,
    };

    saveLocal(courseId, state[courseId]);

    return state[courseId];
  }

  // ----------------------------------------------------------
  // Registrar cambio de lección
  // ----------------------------------------------------------
  async function onLessonChange(courseId, lessonId) {
    const st = state[courseId];
    if (!st?.ready) return;

    st.ultima_leccion = lessonId;

    if (!st.registros[lessonId]) {
      st.registros[lessonId] = {
        leccion_id: lessonId,
        ultima_visita: new Date().toISOString(),
        completado: false,
        tiempo_lectura_seg: 0,
      };
    } else {
      st.registros[lessonId].ultima_visita = new Date().toISOString();
    }

    saveLocal(courseId, st);

    if (ProgresoAPI.isLoggedIn(courseId)) {
      ProgresoAPI.guardarProgreso(courseId, {
        leccion_id: lessonId,
        completado: st.registros[lessonId].completado,
        ultima_visita: st.registros[lessonId].ultima_visita,
        tiempo_lectura_seg: st.registros[lessonId].tiempo_lectura_seg,
      });
    }
  }

  // ----------------------------------------------------------
  // Marcar completado
  // ----------------------------------------------------------
  async function marcarComoCompletado(courseId, lessonId) {
    const st = state[courseId];
    if (!st?.ready) return;

    st.completadas.add(lessonId);

    if (!st.registros[lessonId]) {
      st.registros[lessonId] = {
        leccion_id: lessonId,
        ultima_visita: new Date().toISOString(),
        completado: true,
        tiempo_lectura_seg: 0,
      };
    } else {
      st.registros[lessonId].completado = true;
      st.registros[lessonId].ultima_visita = new Date().toISOString();
    }

    saveLocal(courseId, st);

    if (ProgresoAPI.isLoggedIn(courseId)) {
      ProgresoAPI.guardarProgreso(courseId, {
        leccion_id: lessonId,
        completado: true,
        ultima_visita: st.registros[lessonId].ultima_visita,
        tiempo_lectura_seg: st.registros[lessonId].tiempo_lectura_seg,
      });
    }
  }

  function getState(courseId) {
    return state[courseId] || null;
  }

  async function toggleCompletado(courseId, lessonId) {
    const st = state[courseId];
    if (!st?.ready) return;

    const isCompleted = st.completadas.has(lessonId);

    if (isCompleted) {
        // Quitar completado
        st.completadas.delete(lessonId);
        if (st.registros[lessonId]) {
            st.registros[lessonId].completado = false;
        }
    } else {
        // Marcar completado
        st.completadas.add(lessonId);

        if (!st.registros[lessonId]) {
            st.registros[lessonId] = {
                leccion_id: lessonId,
                ultima_visita: new Date().toISOString(),
                completado: true,
                tiempo_lectura_seg: 0,
            };
        } else {
            st.registros[lessonId].completado = true;
            st.registros[lessonId].ultima_visita = new Date().toISOString();
        }
    }

    saveLocal(courseId, st);

    // Intentar sincronizar con backend (si logueado)
    if (ProgresoAPI.isLoggedIn(courseId)) {
        await ProgresoAPI.guardarProgreso(courseId, {
            leccion_id: lessonId,
            completado: !isCompleted,
            ultima_visita: st.registros[lessonId].ultima_visita,
            tiempo_lectura_seg: st.registros[lessonId].tiempo_lectura_seg,
        });
    }
}

  // ----------------------------------------------------------
  // Exponer API
  // ----------------------------------------------------------
  window.ProgresoState = {
    init,
    onLessonChange,
    marcarComoCompletado,
    toggleCompletado,
    getState,
  };
})(window);
