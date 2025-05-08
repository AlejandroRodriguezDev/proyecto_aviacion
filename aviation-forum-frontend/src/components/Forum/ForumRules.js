// src/components/Forum/ForumRules.js
import React from 'react';
import styles from './ForumRules.module.css';
import { FaGavel, FaListOl } from 'react-icons/fa';

const ForumRules = ({ rules, forumName }) => {

  const hasRules = Array.isArray(rules) && rules.length > 0;

  return (
    <div className={`${styles.rulesCard} card`}>
      <h4 className={styles.rulesTitle}>
        <FaListOl aria-hidden="true"/> Reglas de #{forumName}
      </h4>

      {hasRules ? (
        <ol className={styles.rulesList}>
          {rules.map((rule, index) => (
            rule && typeof rule === 'string' && rule.trim() !== '' && (
              <li key={index} className={styles.ruleItem}>
                {rule.trim()}
              </li>
            )
          ))}
        </ol>
      ) : (
        <p className={styles.noRules}>Aún no se han definido reglas para este foro.</p>
      )}

       {hasRules && (
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
