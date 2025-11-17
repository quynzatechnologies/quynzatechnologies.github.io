/**
 * ============================================================
 *  progreso_api.js
 *  Capa de acceso al backend de progreso por curso
 * ============================================================
 *
 *  Expone:
 *    - ProgresoAPI.isLoggedIn(courseId)
 *    - ProgresoAPI.getUserId(courseId)
 *    - ProgresoAPI.obtenerProgreso(courseId)
 *    - ProgresoAPI.guardarProgreso(courseId, payload)
 *
 *  courseId: "iot" | "logica" | "micropython"
 *
 *  NOTA: este archivo solo habla con el backend.
 *  La lógica de estado local y cálculo de % irá en progreso_state.js
 * ============================================================
 */

(function (window) {
  "use strict";

  // ------------------------------------------------------------------
  // CONFIGURACIÓN BÁSICA
  // ------------------------------------------------------------------
  const API_BASE = "https://backend-quynza-pages.vercel.app/api";

  // Por si en el futuro quieres cambiar nombres de claves de sesión
  const SESSION_KEYS = {
    iot: {
      logged: "logueado-iot",
      userId: "iot_user_id",
      username: "iot_username",
    },
    logica: {
      logged: "logueado-logica",
      userId: "logica_user_id",
      username: "logica_username",
    },
    micropython: {
      logged: "logueado-micropython",
      userId: "micropython_user_id",
      username: "micropython_username",
    },
  };

  // ------------------------------------------------------------------
  // HELPERS DE SESIÓN
  // ------------------------------------------------------------------
  function isLoggedIn(courseId) {
    const cfg = SESSION_KEYS[courseId];
    if (!cfg) return false;
    return sessionStorage.getItem(cfg.logged) === "true";
  }

  function getUserId(courseId) {
    const cfg = SESSION_KEYS[courseId];
    if (!cfg) return null;
    return sessionStorage.getItem(cfg.userId);
  }

  function getUsername(courseId) {
    const cfg = SESSION_KEYS[courseId];
    if (!cfg) return null;
    return sessionStorage.getItem(cfg.username);
  }

  // ------------------------------------------------------------------
  // LLAMADAS AL BACKEND
  // ------------------------------------------------------------------
  /**
   * Obtener progreso desde el backend.
   *
   * Esperado desde backend (sugerencia):
   *  GET /api/progreso/obtener?course_id=iot&user_id=...
   *
   * Respuesta recomendada:
   *  {
   *    ultima_leccion: "mod1.sec2.sub1" | null,
   *    completadas: ["mod1.sec1.sub1", ...],
   *    registros: [
   *      { leccion_id, completado, fecha_completado, ultima_visita, tiempo_lectura_seg },
   *      ...
   *    ]
   *  }
   */
  async function obtenerProgreso(courseId) {
    const userId = getUserId(courseId);

    // Si no hay usuario identificado para este curso, devolvemos vacío
    if (!userId) {
      return {
        ok: false,
        reason: "NO_USER",
        data: {
          ultima_leccion: null,
          completadas: [],
          registros: [],
        },
      };
    }

    const url =
      API_BASE +
      "/progreso/obtener?course_id=" +
      encodeURIComponent(courseId) +
      "&user_id=" +
      encodeURIComponent(userId);

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        json = { error: text };
      }

      if (!res.ok) {
        console.error("Error obtenerProgreso:", json.error || text);
        return {
          ok: false,
          reason: "HTTP_ERROR",
          status: res.status,
          error: json.error || "Error al obtener progreso",
        };
      }

      // Normalizar forma de respuesta
      const ultima_leccion = json.ultima_leccion || null;
      const completadas = Array.isArray(json.completadas)
        ? json.completadas
        : [];
      const registros = Array.isArray(json.registros) ? json.registros : [];

      return {
        ok: true,
        reason: "OK",
        data: {
          ultima_leccion,
          completadas,
          registros,
        },
      };
    } catch (err) {
      console.error("Error de red en obtenerProgreso:", err);
      return {
        ok: false,
        reason: "NETWORK_ERROR",
        error: err,
      };
    }
  }

  /**
   * Guardar/actualizar progreso de una lección.
   *
   * Endpoint sugerido en backend:
   *  POST /api/progreso/guardar
   *
   * Body esperado (ejemplo):
   *  {
   *    user_id: "...",
   *    course_id: "iot",
   *    leccion_id: "mod1.sec2.sub1",
   *    completado: true,
   *    ultima_visita: "2025-11-17T10:00:00Z",
   *    tiempo_lectura_seg: 120
   *  }
   *
   * El backend hará upsert (user_id + leccion_id) en la tabla del curso.
   */
  async function guardarProgreso(courseId, payload) {
    const userId = getUserId(courseId);

    if (!userId) {
      // No lanzar error fuerte: simplemente indicamos que no se puede sincronizar
      console.warn(
        "[ProgresoAPI] guardarProgreso llamado sin userId para courseId=" +
          courseId
      );
      return {
        ok: false,
        reason: "NO_USER",
      };
    }

    const body = {
      user_id: userId,
      course_id: courseId,
      leccion_id: payload.leccion_id,
      completado:
        typeof payload.completado === "boolean" ? payload.completado : false,
      ultima_visita:
        payload.ultima_visita ||
        new Date().toISOString(), // por si quieres registrar visita
      tiempo_lectura_seg:
        typeof payload.tiempo_lectura_seg === "number"
          ? payload.tiempo_lectura_seg
          : 0,
    };

    try {
      const res = await fetch(API_BASE + "/progreso/guardar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        json = { error: text };
      }

      if (!res.ok) {
        console.error("Error guardarProgreso:", json.error || text);
        return {
          ok: false,
          reason: "HTTP_ERROR",
          status: res.status,
          error: json.error || "Error al guardar progreso",
        };
      }

      return {
        ok: true,
        reason: "OK",
        data: json,
      };
    } catch (err) {
      console.error("Error de red en guardarProgreso:", err);
      return {
        ok: false,
        reason: "NETWORK_ERROR",
        error: err,
      };
    }
  }

  // ------------------------------------------------------------------
  // EXPONER API GLOBAL
  // ------------------------------------------------------------------
  window.ProgresoAPI = {
    isLoggedIn,
    getUserId,
    getUsername,
    obtenerProgreso,
    guardarProgreso,
  };
})(window);
