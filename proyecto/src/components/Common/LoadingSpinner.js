import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ size = '40px' }) => {
  return <div className={styles.spinner} style={{ width: size, height: size }}></div>;
};

export default LoadingSpinner;