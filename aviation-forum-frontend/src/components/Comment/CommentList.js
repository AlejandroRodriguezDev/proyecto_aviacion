// src/components/Comment/CommentList.js
import React, { useState, useCallback } from 'react';
import CommentCard from './ComentCard';             // Tarjeta individual
import LoadingSpinner from '../Common/LoadingSpinner'; // Indicador carga
import styles from './CommentList.module.css';       // Estilos lista
import { FaComments, FaAngleDown, FaAngleUp } from 'react-icons/fa'; // Iconos

// Componente para mostrar la lista de comentarios y opciones de ordenación
const CommentList = ({
  comments: initialComments = [], // Lista inicial de comentarios (plana o ya anidada?)
  postId,                // ID del post (para crear respuestas)
  forumId,               // ID del foro (para permisos mod)
  postOwnerId,           // ID del dueño del post (para permisos)
  isLoading,             // Booleano indicando si se están cargando comentarios
  // Callbacks pasados desde PostDetail
  onCommentDeleted,
  onReplyAdded,
  getVoteStatus         // Función para obtener el voto inicial de cada comentario
}) => {

  // Estado local para el orden actual (PostDetail podría controlar esto también)
  const [sortOrder, setSortOrder] = useState('best'); // Opciones: 'best', 'newest', 'oldest'

  // --- Lógica para Anidar y Ordenar Comentarios ---
  const processComments = useCallback((commentsList) => {
    const commentMap = {}; // Mapa para acceso rápido por ID
    const rootComments = []; // Array para comentarios de nivel superior

    // 1. Crear mapa y añadir campo 'replies' vacío a cada comentario
    commentsList.forEach(comment => {
      commentMap[comment.id] = { ...(comment || {}), user: comment?.user || {}, likes: comment?.likes ?? 0, dislikes: comment?.dislikes ?? 0, replies: [] };
      // Asegurarse de que comment.user exista o poner un default
       if (!commentMap[comment.id].user) {
           commentMap[comment.id].user = { username: 'Desconocido', id: 'unknown' };
       }
    });

    // 2. Construir la estructura anidada
    commentsList.forEach(comment => {
        if (!comment) return; // Skip si hay comentarios null/undefined en la lista
       // Si tiene parentId y el padre existe en el mapa, añadirlo como respuesta
      if (comment.parentId && commentMap[comment.parentId]) {
         // Verificar que no se añada a sí mismo y que exista el objeto
         if(comment.id && commentMap[comment.id]) {
             commentMap[comment.parentId].replies.push(commentMap[comment.id]);
         }
      }
      // Si no tiene padre (o el padre no está en esta lista), añadirlo a la raíz
       else if (!comment.parentId && comment.id && commentMap[comment.id]) {
          rootComments.push(commentMap[comment.id]);
       }
       // Opcional: Manejar comentarios 'huérfanos' (parentId existe pero no el padre)
       // else if (comment.parentId && !commentMap[comment.parentId] && commentMap[comment.id]) {
       //    rootComments.push(commentMap[comment.id]); // Añadirlos a la raíz?
       // }
    });

    // 3. Función de Comparación para Ordenar
    const compareFunc = (a, b) => {
       if(!a || !b) return 0; // Seguridad extra
      switch (sortOrder) {
        case 'best': // Likes netos descendente (ajusta la fórmula 'best' si es necesario)
           return (b.likes - b.dislikes) - (a.likes - a.dislikes);
        case 'newest': // Más nuevo primero
           return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest': // Más antiguo primero
           return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
           return 0;
      }
    };

    // 4. Ordenar comentarios raíz
    rootComments.sort(compareFunc);

    // 5. Ordenar respuestas (normalmente por más antiguo para seguir la conversación)
     // Puedes elegir ordenar igual que raíz o diferente
    const sortRepliesRecursive = (nodes) => {
       nodes.forEach(node => {
          if (node.replies && node.replies.length > 0) {
              // Ordena las respuestas por fecha de creación (ascendente)
              node.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
               sortRepliesRecursive(node.replies); // Recursión
           }
      });
    };
     sortRepliesRecursive(rootComments);

    return rootComments; // Devuelve array de comentarios raíz anidados

  }, [sortOrder]); // Se recalcula si cambia el orden

  // Procesa los comentarios iniciales o actualizados
  const commentTree = processComments(initialComments || []);
  const totalComments = initialComments?.length || 0;

  // --- Renderizado ---

  // Muestra spinner si está cargando y no hay comentarios aún
  if (isLoading && totalComments === 0) {
    return (
      <section className={styles.commentListSection} id="comments" aria-live="polite">
         {/* Podrías mostrar el título aunque esté cargando */}
         <div className={styles.titleAndSort}>
            <h3 id="comment-list-title" className={styles.sectionTitle}>
                 <FaComments aria-hidden="true"/> Comentarios (0)
            </h3>
            {/* Opciones de ordenación deshabilitadas */}
        </div>
         <LoadingSpinner center={true} />
      </section>
    );
  }

  return (
    // id="comments" permite links directos a esta sección (ej: /post/123#comments)
    <section className={styles.commentListSection} id="comments" aria-labelledby="comment-list-title">
       {/* Título y Opciones de Ordenación */}
        <div className={styles.titleAndSort}>
             <h3 id="comment-list-title" className={styles.sectionTitle}>
             <FaComments aria-hidden="true"/> Comentarios ({totalComments})
            </h3>
             {/* Muestra opciones de ordenación si hay más de un comentario */}
            {totalComments > 1 && (
                <div className={styles.sortOptions}>
                     <label htmlFor="comment-sort-select" className="visually-hidden">Ordenar comentarios por</label>
                     <select
                        id="comment-sort-select"
                        value={sortOrder}
                         onChange={(e) => setSortOrder(e.target.value)} // Actualiza estado al cambiar
                        className={styles.sortSelect}
                    >
                         <option value="best">Mejores</option>
                         <option value="newest">Más Nuevos</option>
                         <option value="oldest">Más Antiguos</option>
                     </select>
                      {/* Icono indicativo (opcional) */}
                     {/* {sortOrder === 'newest' ? <FaAngleDown/> : sortOrder === 'oldest' ? <FaAngleUp/> : <FaAngleDown/>} */}
                 </div>
            )}
        </div>

         {/* Renderizado de Comentarios */}
         {isLoading && totalComments > 0 && <LoadingSpinner />} {/* Spinner pequeño si recarga */}

         {!isLoading && commentTree.length === 0 ? (
             <p className={styles.noComments}>Todavía no hay comentarios. ¡Sé el primero!</p>
          ) : (
            <div className={styles.commentsContainer}>
             {commentTree.map(rootComment => (
                 <CommentCard
                   key={rootComment.id}
                   comment={rootComment}   // Pasa el comentario raíz (con sus respuestas anidadas)
                   postId={postId}
                   forumId={forumId}
                   postOwnerId={postOwnerId}
                   onCommentDeleted={onCommentDeleted} // Pasa los callbacks
                   onReplyAdded={onReplyAdded}
                   getVoteStatus={getVoteStatus}       // Pasa la función de voto
                   nestedLevel={0}                  // Nivel 0 para comentarios raíz
                   // fetchReplies={fetchRepliesCallback} // Opcional: Si carga respuestas bajo demanda
                 />
               ))}
             </div>
         )}
    </section>
  );
};

export default CommentList; // <-- Exportación Default