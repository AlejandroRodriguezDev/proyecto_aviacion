// src/components/Search/SearchBar.js
import React, { useState } from 'react';
import styles from './SearchBar.module.css';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
    // TODO: Implement suggestions dropdown here (complex)
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      // Optional: Keep term or clear it
      // setSearchTerm('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchForm} role="search">
      <FaSearch className={styles.searchIcon} aria-hidden="true" />
      <input
        type="search" // Use type="search" for better semantics/mobile keyboards
        placeholder="Buscar (@usuario, #foro, tema...)"
        value={searchTerm}
        onChange={handleChange}
        className={styles.searchInput}
        aria-label="Buscar en AeroForum"
      />
      {/* Hidden submit button for accessibility, form submits on Enter */}
       <button type="submit" className={styles.hiddenSubmit}>Buscar</button>
    </form>
  );
};

export default SearchBar;