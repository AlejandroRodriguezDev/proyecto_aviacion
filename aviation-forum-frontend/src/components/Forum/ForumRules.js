// src/components/Forum/ForumRules.js
import React from 'react';
import styles from './ForumRules.module.css';
import { FaGavel } from 'react-icons/fa'; // Icon

const ForumRules = ({ rules, forumName }) => {
  if (!rules || rules.length === 0) {
    return null; // Don't render if no rules
  }

  return (
    <div className={`${styles.rulesCard} card`}>
      <h4 className={styles.rulesTitle}>
        <FaGavel /> Reglas de #{forumName}
      </h4>
      <ol className={styles.rulesList}>
        {rules.map((rule, index) => (
          <li key={index} className={styles.ruleItem}>
            {rule}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default ForumRules;