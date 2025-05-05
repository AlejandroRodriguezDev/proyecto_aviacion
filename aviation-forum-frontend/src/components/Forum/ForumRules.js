// src/components/Forum/ForumRules.js
import React from 'react';
import styles from './ForumRules.module.css';
import { FaGavel, FaListOl } from 'react-icons/fa'; // Usamos ListOl para indicar lista

const ForumRules = ({ rules, forumName }) => {

  // Verifica si 'rules' es un array y tiene elementos
  const hasRules = Array.isArray(rules) && rules.length > 0;

  return (
    // Usa la clase 'card' como base
    <div className={`${styles.rulesCard} card`}>
      <h4 className={styles.rulesTitle}>
        {/* Usamos FaListOl o FaGavel */}
        <FaListOl aria-hidden="true"/> Reglas de #{forumName}
      </h4>

      {hasRules ? (
        // Renderiza la lista ordenada si hay reglas
        <ol className={styles.rulesList}>
          {rules.map((rule, index) => (
            // Asegura que la regla no sea vacía antes de renderizar
            rule && typeof rule === 'string' && rule.trim() !== '' && (
              <li key={index} className={styles.ruleItem}>
                {rule.trim()} {/* Muestra la regla sin espacios extra */}
              </li>
            )
          ))}
        </ol>
      ) : (
        // Muestra un mensaje si no hay reglas definidas
        <p className={styles.noRules}>Aún no se han definido reglas para este foro.</p>
      )}

      {/* Opcional: Enlace para reportar */}
       {hasRules && ( // Solo muestra si hay reglas que infringir
           <div className={styles.reportLink}>
              <a href="#" onClick={(e) => {e.preventDefault(); alert("Funcionalidad de reporte no implementada.")}} title="Reportar contenido que infrinja las reglas">
                Reportar Contenido
               </a>
           </div>
        )}
    </div>
  );
};

export default ForumRules;