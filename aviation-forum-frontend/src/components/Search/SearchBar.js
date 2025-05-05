// src/components/Search/SearchBar.js
import React, { useState, useRef } from 'react';
import styles from './SearchBar.module.css';
import { FaSearch } from 'react-icons/fa';
// Ya no necesitamos useNavigate aquí, la navegación la maneja el padre (Navbar)

// Recibe onSearch (callback al enviar) e initialValue (opcional)
const SearchBar = ({ onSearch, initialValue = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const inputRef = useRef(null); // Ref para el input (ej: para focus/blur)

  // Actualiza el estado local cuando el usuario escribe
  const handleChange = (event) => {
    setSearchTerm(event.target.value);
    // Aquí iría la lógica para mostrar sugerencias si se implementa
    // if(event.target.value.length > 2) fetchSuggestions(event.target.value);
  };

  // Se ejecuta al presionar Enter o enviar el formulario
  const handleSubmit = (event) => {
    event.preventDefault(); // Previene recarga de página
    const trimmedTerm = searchTerm.trim(); // Quita espacios extra

    // Llama al callback onSearch PASADO DESDE NAVBAR si hay término y la función existe
    if (trimmedTerm && typeof onSearch === 'function') {
      onSearch(trimmedTerm);
      inputRef.current?.blur(); // Opcional: quita el foco del input después de buscar
    } else if (trimmedTerm) {
       // Fallback si no hay onSearch (aunque Navbar debería pasarlo)
       console.warn("SearchBar: No onSearch handler provided! Cannot navigate.");
    }
     // Si no hay término, no hace nada
  };

  // Podrías tener un estado y lógica para mostrar/ocultar sugerencias aquí
  // const [suggestions, setSuggestions] = useState([]);
  // const [showSuggestions, setShowSuggestions] = useState(false);
  // const fetchSuggestions = async (term) => { ... }

  return (
    // Usa un form para que Enter funcione
    <form onSubmit={handleSubmit} className={styles.searchForm} role="search">
      {/* Icono de búsqueda (podría ser parte del label) */}
      <label htmlFor="search-input" className={styles.searchIconWrapper} aria-label="Buscar">
         <FaSearch className={styles.searchIcon} aria-hidden="true" />
         {/* El label real está oculto, pero asociado por htmlFor */}
      </label>
      <input
        ref={inputRef}        // Referencia al input
        id="search-input"   // ID para el label
        type="search"       // Tipo semántico 'search'
        placeholder="Buscar en AeroForum..." // Placeholder actualizado
        value={searchTerm}    // Valor controlado
        onChange={handleChange}// Manejador de cambio
        className={styles.searchInput}
         // Opcional: Atributos ARIA para control de sugerencias (si se implementan)
         // aria-autocomplete="list"
         // aria-controls="search-suggestions"
         // aria-expanded={showSuggestions}
      />
      {/* Aquí iría el componente de sugerencias si se implementa */}
      {/* {showSuggestions && suggestions.length > 0 && (
          <ul id="search-suggestions" className={styles.suggestionsList}>
             {suggestions.map(s => <li key={s.id}>{s.name}</li>)}
          </ul>
      )} */}
       {/* Botón de submit oculto para accesibilidad (form se envía con Enter) */}
       <button type="submit" className="visually-hidden">Buscar</button>
    </form>
  );
};

export default SearchBar;