// src/pages/PostPage.js
import React from 'react';
import PostDetail from '../components/Post/PostDetail'; 
import styles from './PostPage.module.css'; 

const PostPage = () => {
  
  return (
    <div className={styles.postPageContainer}>
      <PostDetail />
    </div>
  );
};

export default PostPage;