// src/components/Post/CreatePostForm.js
import React, { useState } from 'react';
import InputField from '../Common/InputField';
import Button from '../Common/Button';
import styles from './CreatePostForm.module.css';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';

// Este componente recibe callbacks para manejar éxito (onPostCreated) y cancelación (onCancel)
const CreatePostForm = ({ forumId, forumName, onPostCreated, onCancel }) => {
  const { user } = useAuth(); // Necesitamos el ID del usuario para enviar el post
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Estados de error específicos para cada campo
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  // Estado de error general del formulario (ej: error de red)
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado de carga del envío

  // Función para validar el formulario antes de enviar
  const validateForm = () => {
    let isValid = true;
    setTitleError(''); // Limpia errores previos
    setDescriptionError('');
    setFormError('');

    if (!title.trim()) {
      setTitleError('El título es obligatorio.');
      isValid = false;
    } else if (title.trim().length > 250) { // Límite de ejemplo
        setTitleError('El título no puede exceder los 250 caracteres.');
        isValid = false;
    }

    if (!description.trim()) {
      setDescriptionError('La descripción es obligatoria.');
      isValid = false;
    }
     // Podrías añadir validación de longitud mínima/máxima para descripción

    return isValid;
  };

  // Manejador del envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault(); // Previene recarga de página

    // Valida los campos
    if (!validateForm()) {
      return; // Detiene si hay errores de validación
    }

    // Verifica si el usuario está logueado y la función API existe
     if (!user || !user.id || !api.createPost) {
         setFormError('No se pudo enviar el post. Intenta recargar.');
         return;
     }

    setIsLoading(true); // Activa estado de carga
    setFormError('');   // Limpia error general previo

    try {
      // Datos a enviar a la API (según tu api.js)
      const postData = {
        title: title.trim(),
        description: description.trim(), // Enviar texto plano, Markdown se renderiza al mostrar
        forumId: forumId,
        userId: user.id, // El ID del usuario logueado
      };

      // Llama a la función de la API
      const newPost = await api.createPost(postData);

      // Éxito: Limpia el formulario y notifica al componente padre
      setTitle('');
      setDescription('');
      if (onPostCreated) {
        onPostCreated(newPost); // Pasa el post recién creado
      }
    } catch (err) {
      // Error: Muestra mensaje de error
      console.error("Error al crear el post:", err);
      setFormError(err.message || 'Error inesperado al crear el post.');
    } finally {
      // Termina la carga independientemente del resultado
      setIsLoading(false);
    }
  };

  // Limpia errores específicos al escribir
  const handleTitleChange = (e) => { setTitle(e.target.value); setTitleError(''); };
  const handleDescriptionChange = (e) => { setDescription(e.target.value); setDescriptionError(''); };


  // Nota: Este componente SÓLO renderiza el FORMULARIO.
  // El título "Crear Post en #Foro" y los botones de acción principales (como "Cancelar" fuera del form)
  // deberían estar en el componente que USA este formulario (ej: el Modal en ForumPage).
  // Sin embargo, añadiremos los botones aquí para simplicidad si no usas un footer de modal separado.
  return (
    <div className={styles.createPostContainer}>
       {/* Error general del formulario (red, etc.) */}
       {formError && <p className={styles.formErrorOverall}>{formError}</p>}

       {/* Usar novalidate para prevenir validación HTML5 y usar la nuestra */}
       <form onSubmit={handleSubmit} noValidate>

            <InputField
                id="post-title"
                label="Título"
                value={title}
                onChange={handleTitleChange}
                placeholder="Un título claro y conciso"
                required
                maxLength={250} // Mostrar límite al usuario
                disabled={isLoading}
                error={titleError} // Pasa error específico
                aria-describedby={titleError ? 'title-error-msg' : undefined}
            />

            {/* Campo Textarea para la descripción */}
            <div className={styles.formGroup}> {/* Reusar clase CSS */}
                <label htmlFor="post-description" className={styles.label}>
                    Descripción {/* (Soporta Markdown Básico) */}
                     <span className={styles.requiredMarker}> *</span>
                </label>
                <textarea
                    id="post-description"
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Detalla tu publicación aquí..."
                    required
                    rows={10} // Altura inicial
                    className={`${styles.textarea} ${descriptionError ? styles.errorInput : ''}`} // Aplica clase de error
                    disabled={isLoading}
                    aria-invalid={!!descriptionError}
                    aria-describedby={descriptionError ? 'description-error-msg' : undefined}
                />
                {descriptionError && (
                     <p id="description-error-msg" className={styles.errorMessage}>
                       {descriptionError}
                    </p>
                 )}
            </div>

            {/* Botones de acción DENTRO del formulario (si no usas footer de Modal) */}
            <div className={styles.formActions}>
                {/* Botón Cancelar llama a la prop onCancel */}
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
                    Cancelar
                </Button>
                 {/* Botón Publicar hace submit */}
                <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
                    Publicar Post
                </Button>
            </div>
       </form>
    </div>
  );
};

export default CreatePostForm;