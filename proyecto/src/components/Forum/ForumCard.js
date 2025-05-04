// src/components/Forum/ForumCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ForumCard.module.css';
import SubscribeButton from './SubscribeButton'; // Import the button
import { useAuth } from '../../hooks/useAuth'; // To check subscription status

const ForumCard = ({ forum, variant = 'default' /* 'default' or 'recommendation' */ }) => {
    const { user } = useAuth();

    // --- SIMULATED Check if current user is subscribed ---
    // In real app, this info might come directly with the forum data for the logged-in user
    const isSubscribed = user?.subscribedForums?.includes(forum.id) ?? false;

    // Placeholder for banner image
    const bannerStyle = forum.bannerUrl
        ? { backgroundImage: `url(${forum.bannerUrl})` }
        : {};

     // Placeholder for forum icon (using first letter)
    const ForumIcon = () => (
        <div className={`${styles.forumIcon} avatar-placeholder`}> {/* Re-use avatar style */}
            {forum.name ? forum.name.charAt(0).toUpperCase() : '?'}
        </div>
    );


    return (
        <div className={`${styles.forumCard} ${styles[variant]} card`}>
            {variant === 'default' && ( // Show banner only in default view?
                 <div className={`${styles.bannerPlaceholder} img-placeholder`} style={bannerStyle}>
                    {!forum.bannerUrl && <span>Banner Opcional</span>}
                </div>
            )}

            <div className={styles.forumInfo}>
                 <ForumIcon />
                <div className={styles.forumDetails}>
                     <Link to={`/forum/${forum.slug || forum.id}`} className={styles.forumNameLink}>
                        <h4 className={styles.forumName}>#{forum.name}</h4>
                    </Link>
                    <p className={styles.forumDescription}>{forum.description}</p>
                     <span className={styles.memberCount}>
                        {forum.memberCount?.toLocaleString() ?? 0} Miembros
                    </span>
                </div>
                 {variant !== 'recommendation' && ( // Show subscribe button unless it's just a recommendation card
                    <div className={styles.subscribeAction}>
                        <SubscribeButton
                            forumId={forum.id}
                            isInitiallySubscribed={isSubscribed}
                            // Optional: Callback if needed in parent list
                            // onSubscriptionChange={(newState) => console.log(`Sub status for ${forum.id}: ${newState}`)}
                        />
                     </div>
                 )}
            </div>
             {variant === 'recommendation' && ( // Simplified view for recommendation
                <Link to={`/forum/${forum.slug || forum.id}`} className={styles.viewButtonLink}>
                    <button className={styles.viewButton}>Visitar</button>
                </Link>
             )}
        </div>
    );
};

export default ForumCard;