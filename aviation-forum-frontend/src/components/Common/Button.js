import React from 'react';
import styles from './Button.module.css';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'danger', 'link'
  size = 'medium', // 'small', 'medium', 'large'
  disabled = false,
  isLoading = false,
  className = '',
  ...props
}) => {
  const buttonClasses = `
    ${styles.button}
    ${styles[variant]}
    ${styles[size]}
    ${isLoading ? styles.loading : ''}
    ${className}
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={buttonClasses.trim()}
      {...props}
    >
      {isLoading ? <span className={styles.spinner}></span> : children}
    </button>
  );
};

export default Button;