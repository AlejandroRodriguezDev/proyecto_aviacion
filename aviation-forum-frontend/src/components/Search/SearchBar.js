// src/components/Search/SearchBar.js
import React, { useState, useRef } from 'react';
import styles from './SearchBar.module.css';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch, initialValue = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const inputRef = useRef(null);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedTerm = searchTerm.trim();

    if (trimmedTerm && typeof onSearch === 'function') {
      onSearch(trimmedTerm);
      inputRef.current?.blur();
    } else if (trimmedTerm) {
      console.warn("SearchBar: No onSearch handler provided! Cannot navigate.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchForm} role="search">
      <label htmlFor="search-input" className={styles.searchIconWrapper} aria-label="Buscar">
         <FaSearch className={styles.searchIcon} aria-hidden="true" />
      </label>
      <input
        ref={inputRef}
        id="search-input"
        type="search"
        placeholder="Buscar en AeroForum..."
        value={searchTerm}
        onChange={handleChange}
        className={styles.searchInput}
      />
      <button type="submit" className="visually-hidden">Buscar</button>
    </form>
  );
};

export default SearchBar;
