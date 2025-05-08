// src/components/Comment/CommentList.js
import React, { useState, useCallback } from 'react';
import CommentCard from './ComentCard';
import LoadingSpinner from '../Common/LoadingSpinner';
import styles from './CommentList.module.css';
import { FaComments } from 'react-icons/fa';

const CommentList = ({
  comments: initialComments = [],
  postId,
  forumId,
  postOwnerId,
  isLoading,
  onCommentDeleted,
  onReplyAdded,
  getVoteStatus
}) => {
  const [sortOrder, setSortOrder] = useState('best');

  const processComments = useCallback((commentsList) => {
    const commentMap = {};
    const rootComments = [];

    commentsList.forEach(comment => {
      commentMap[comment.id] = { ...(comment || {}), user: comment?.user || {}, likes: comment?.likes ?? 0, dislikes: comment?.dislikes ?? 0, replies: [] };
      if (!commentMap[comment.id].user) {
        commentMap[comment.id].user = { username: 'Desconocido', id: 'unknown' };
      }
    });

    commentsList.forEach(comment => {
      if (!comment) return;
      if (comment.parentId && commentMap[comment.parentId]) {
        if(comment.id && commentMap[comment.id]) {
          commentMap[comment.parentId].replies.push(commentMap[comment.id]);
        }
      } else if (!comment.parentId && comment.id && commentMap[comment.id]) {
        rootComments.push(commentMap[comment.id]);
      }
    });

    const compareFunc = (a, b) => {
      if(!a || !b) return 0;
      switch (sortOrder) {
        case 'best':
          return (b.likes - b.dislikes) - (a.likes - a.dislikes);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    };

    rootComments.sort(compareFunc);

    const sortRepliesRecursive = (nodes) => {
      nodes.forEach(node => {
        if (node.replies && node.replies.length > 0) {
          node.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          sortRepliesRecursive(node.replies);
        }
      });
    };
    sortRepliesRecursive(rootComments);

    return rootComments;
  }, [sortOrder]);

  const commentTree = processComments(initialComments || []);
  const totalComments = initialComments?.length || 0;

  if (isLoading && totalComments === 0) {
    return (
      <section className={styles.commentListSection} id="comments" aria-live="polite">
        <div className={styles.titleAndSort}>
          <h3 id="comment-list-title" className={styles.sectionTitle}>
            <FaComments aria-hidden="true"/> Comentarios (0)
          </h3>
        </div>
        <LoadingSpinner center={true} />
      </section>
    );
  }

  return (
    <section className={styles.commentListSection} id="comments" aria-labelledby="comment-list-title">
      <div className={styles.titleAndSort}>
        <h3 id="comment-list-title" className={styles.sectionTitle}>
          <FaComments aria-hidden="true"/> Comentarios ({totalComments})
        </h3>
        {totalComments > 1 && (
          <div className={styles.sortOptions}>
            <label htmlFor="comment-sort-select" className="visually-hidden">Ordenar comentarios por</label>
            <select
              id="comment-sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="best">Mejores</option>
              <option value="newest">Más Nuevos</option>
              <option value="oldest">Más Antiguos</option>
            </select>
          </div>
        )}
      </div>

      {isLoading && totalComments > 0 && <LoadingSpinner />}

      {!isLoading && commentTree.length === 0 ? (
        <p className={styles.noComments}>Todavía no hay comentarios. ¡Sé el primero!</p>
      ) : (
        <div className={styles.commentsContainer}>
          {commentTree.map(rootComment => (
            <CommentCard
              key={rootComment.id}
              comment={rootComment}
              postId={postId}
              forumId={forumId}
              postOwnerId={postOwnerId}
              onCommentDeleted={onCommentDeleted}
              onReplyAdded={onReplyAdded}
              getVoteStatus={getVoteStatus}
              nestedLevel={0}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentList;
