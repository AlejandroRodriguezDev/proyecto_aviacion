// src/services/api.js

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK DATA ---
let mockUsers = { /* ... (sin cambios de la última vez) ... */ };
let mockForums = { /* ... (sin cambios) ... */ };

// POSTS Y COMMENTS: Sin los arrays likedBy/dislikedBy
let mockPosts = {
    'p1': { id: 'p1', title: 'First Solo Flight!', description: '...', user_id: 'user1', forum_id: 'f1', createdAt: '2023-10-26T10:00:00Z', likesCount: 1, dislikesCount: 0, commentCount: 2 },
    'p2': { id: 'p2', title: 'Best Flight Simulator 2024?', description: '...', user_id: 'user2', forum_id: 'f2', createdAt: '2023-10-25T14:30:00Z', likesCount: 2, dislikesCount: 1, commentCount: 3 },
    'p3': { id: 'p3', title: 'A380 Sighting at EZE', description: '...', user_id: 'user3', forum_id: 'f3', createdAt: '2023-10-26T12:00:00Z', likesCount: 1, dislikesCount: 0, commentCount: 1 },
    'p4': { id: 'p4', title: 'ATC Staffing Challenges', description: '...', user_id: 'user4', forum_id: 'f4', createdAt: '2023-10-24T09:00:00Z', likesCount: 1, dislikesCount: 0, commentCount: 0 },
    'p5': { id: 'p5', title: 'Sunset shot of a 737', description: '...', user_id: 'user1', forum_id: 'f5', createdAt: '2023-10-26T18:00:00Z', likesCount: 0, dislikesCount: 0, commentCount: 0 },
};
let nextPostId = 6;

let mockComments = {
    'c1': { id: 'c1', post_id: 'p1', user_id: 'user2', text: '...', createdAt: '2023-10-26T10:30:00Z', parent_id: null, likesCount: 1, dislikesCount: 0 },
    'c2': { id: 'c2', post_id: 'p1', user_id: 'user1', text: '...', createdAt: '2023-10-26T11:00:00Z', parent_id: 'c1', likesCount: 0, dislikesCount: 0 },
    'c3': { id: 'c3', post_id: 'p2', user_id: 'user1', text: '...', createdAt: '2023-10-25T15:00:00Z', parent_id: null, likesCount: 1, dislikesCount: 0 },
    'c4': { id: 'c4', post_id: 'p2', user_id: 'user4', text: '...', createdAt: '2023-10-25T15:15:00Z', parent_id: null, likesCount: 0, dislikesCount: 1 },
    'c5': { id: 'c5', post_id: 'p2', user_id: 'user2', text: '...', createdAt: '2023-10-25T15:30:00Z', parent_id: 'c4', likesCount: 0, dislikesCount: 0 },
    'c6': { id: 'c6', post_id: 'p3', user_id: 'user1', text: '...', createdAt: '2023-10-26T13:00:00Z', parent_id: null, likesCount: 0, dislikesCount: 0 },
};
let nextCommentId = 7;

// ¡NUEVA COLECCIÓN MOCK PARA VOTOS!
let mockUserVotes = [
    { _id: 'v1', user_id: 'user2', item_id: 'p1', item_type: 'post', vote_type: 'like' },
    { _id: 'v2', user_id: 'user1', item_id: 'p2', item_type: 'post', vote_type: 'like' },
    { _id: 'v3', user_id: 'user4', item_id: 'p2', item_type: 'post', vote_type: 'like' },
    { _id: 'v4', user_id: 'user3', item_id: 'p2', item_type: 'post', vote_type: 'dislike' },
    { _id: 'v5', user_id: 'user1', item_id: 'p3', item_type: 'post', vote_type: 'like' },
    { _id: 'v6', user_id: 'user2', item_id: 'p4', item_type: 'post', vote_type: 'like' },
    { _id: 'v7', user_id: 'user1', item_id: 'c1', item_type: 'comment', vote_type: 'like' },
    { _id: 'v8', user_id: 'user2', item_id: 'c3', item_type: 'comment', vote_type: 'like' },
    { _id: 'v9', user_id: 'user2', item_id: 'c4', item_type: 'comment', vote_type: 'dislike' },
];
let nextVoteId = 10;

let mockNotifications = { /* ... (sin cambios) ... */ };
let mockMessages = { /* ... (sin cambios) ... */ };
let nextNotificationId = 5;
let nextMessageId = 5;

// --- Helpers Denormalización (Sin Cambios) ---
const getUserInfo = (userId) => { /* ... */ };
const getForumInfo = (forumId) => { /* ... */ };

// --- FUNCIONES API ---
export const api = {
    // ... (Auth, Feed, Forums, Posts, Comments CREATE/DELETE/GET - sin cambios relevantes aquí)...

    // === LÓGICA DE VOTOS (USANDO mockUserVotes) ===

    voteCommon: async (itemId, userId, voteType, itemType) => {
        // itemType será 'post' o 'comment'
        const itemCollection = itemType === 'post' ? mockPosts : mockComments;
        const item = itemCollection[itemId];
        if (!item) throw new Error(`${itemType === 'post' ? 'Post' : 'Comentario'} no encontrado`);
        if (!mockUsers[userId]) throw new Error("Usuario no encontrado");

        // 1. Buscar voto existente
        const existingVoteIndex = mockUserVotes.findIndex(v => v.user_id === userId && v.item_id === itemId);
        const existingVote = existingVoteIndex !== -1 ? mockUserVotes[existingVoteIndex] : null;

        let likeChange = 0;
        let dislikeChange = 0;
        let finalUserVoteType = null;

        if (existingVote) { // Ya había votado
            if (existingVote.vote_type === voteType) { // Mismo voto -> Deshacer
                mockUserVotes.splice(existingVoteIndex, 1); // Eliminar el voto
                if (voteType === 'like') likeChange = -1;
                else dislikeChange = -1;
                finalUserVoteType = null; // No hay voto ahora
            } else { // Voto opuesto -> Cambiar
                existingVote.vote_type = voteType; // Actualizar el tipo
                if (voteType === 'like') {
                    likeChange = +1;
                    dislikeChange = -1;
                } else {
                    likeChange = -1;
                    dislikeChange = +1;
                }
                finalUserVoteType = voteType; // Voto actual es el nuevo
            }
        } else { // Voto nuevo
            mockUserVotes.push({
                _id: `v${nextVoteId++}`,
                user_id: userId,
                item_id: itemId,
                item_type: itemType,
                vote_type: voteType
            });
            if (voteType === 'like') likeChange = +1;
            else dislikeChange = +1;
            finalUserVoteType = voteType; // Voto actual
        }

        // 2. Actualizar contadores en Post/Comment
        item.likesCount = (item.likesCount || 0) + likeChange;
        item.dislikesCount = (item.dislikesCount || 0) + dislikeChange;
        // Asegurar que no sean negativos (por si acaso)
        item.likesCount = Math.max(0, item.likesCount);
        item.dislikesCount = Math.max(0, item.dislikesCount);


        console.log(`${itemType} ${itemId} counts UPDATED: L=${item.likesCount}, D=${item.dislikesCount}`);

        // 3. Devolver estado final
        return {
            success: true,
            likes: item.likesCount,
            dislikes: item.dislikesCount,
            userVote: finalUserVoteType // Devuelve 'like', 'dislike' o null
        };
    },

    votePost: async (postId, userId, voteType) => {
        await delay(200);
        console.log(`SIMULATING vote: User ${userId} ${voteType} Post ${postId}`);
        return api.voteCommon(postId, userId, voteType, 'post');
    },

    voteComment: async (commentId, userId, voteType) => {
        await delay(150);
        console.log(`SIMULATING vote: User ${userId} ${voteType} Comment ${commentId}`);
        return api.voteCommon(commentId, userId, voteType, 'comment');
    },

    // Obtiene el voto del usuario buscando en mockUserVotes
    getUserVote: async (userId, itemId, itemType) => {
        await delay(100);
        const vote = mockUserVotes.find(v => v.user_id === userId && v.item_id === itemId);
        console.log(`Getting vote for ${userId} on ${itemId}, found: ${vote?.vote_type}`);
        return { voteType: vote ? vote.vote_type : null };
    },
    // --- FIN VOTOS ---

    // ... (Notificaciones y Mensajes Directos SIN CAMBIOS desde la respuesta anterior) ...
    getNotifications: async (userId) => { /* ... */ },
    markNotificationRead: async (userId, notificationId) => { /* ... */ },
    getConversations: async (userId) => { /* ... */ },
    getMessages: async (userId, conversationId) => { /* ... */ },
    sendMessage: async (userId, conversationId, text) => { /* ... */ },

    // ... (UserProfile, Amigos, Búsqueda, Moderación - sin cambios necesarios aquí) ...
    getUserProfile: async (username) => { /* ... */ },
    addFriend: async (currentUserId, targetUsername) => { /* ... */ },
    removeFriend: async (currentUserId, targetUsername) => { /* ... */ },
    search: async (query) => { /* ... */ },
    banUserFromForum: async (moderatorId, forumId, targetUsername) => { /* ... */ },
    setForumRules: async (moderatorId, forumId, newRules) => { /* ... */ },

};