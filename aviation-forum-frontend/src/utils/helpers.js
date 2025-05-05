// src/utils/helpers.js

/**
 * Formatea una fecha como "hace X tiempo".
 * @param {string | Date} dateString - La fecha a formatear (string ISO o Date object).
 * @returns {string} - El string formateado o vacío si la fecha es inválida.
 */
export const timeAgo = (dateString) => {
    if (!dateString) return ''; // Si no hay fecha, devuelve vacío
    try {
        const date = new Date(dateString);
        // Verifica si la fecha resultante es válida
        if (isNaN(date.getTime())) {
            // console.warn("Invalid date passed to timeAgo:", dateString); // Log opcional
            return ''; // Devuelve vacío si la fecha no es válida
        }

        const now = new Date();
        const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

        // Manejo de fechas futuras (si es necesario)
        if (seconds < 0) {
            // Podrías calcular cuánto falta, pero por ahora:
            return 'en el futuro';
        }

        // Menos de 5 segundos -> "justo ahora"
        if (seconds < 5) {
            return 'justo ahora';
        }

        // Intervalos de tiempo en segundos
        const intervals = [
            { label: 'año', seconds: 31536000 },
            { label: 'mes', seconds: 2592000 },
            { label: 'día', seconds: 86400 },
            { label: 'hora', seconds: 3600 },
            { label: 'minuto', seconds: 60 },
            { label: 'segundo', seconds: 1 }
        ];

        // Encuentra el intervalo adecuado
        for (let interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                // Añade 's' o 'es' para plural simple
                const plural = interval.label.endsWith('a') || interval.label.endsWith('o') ? 's' : (interval.label === 'mes' ? 'es' : 's');
                return `hace ${count} ${interval.label}${count > 1 ? plural : ''}`;
            }
        }

        // Fallback si es 0 segundos (o error inesperado)
        return 'justo ahora';

    } catch (e) {
        console.error("Error parsing date in timeAgo:", dateString, e);
        return ''; // Devuelve vacío en caso de error
    }
}

// Puedes añadir otras funciones helper aquí si las necesitas después.
// export const OtraFuncionUtil = () => { ... };