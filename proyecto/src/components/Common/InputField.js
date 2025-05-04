import React from 'react';
import styles from './InputField.module.css';

const InputField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      {label && <label htmlFor={id} className={styles.label}>{label}{required && ' *'}</label>}
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`${styles.input} ${error ? styles.errorInput : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && <p id={`${id}-error`} className={styles.errorMessage} role="alert">{error}</p>}
    </div>
  );
};

export default InputField;