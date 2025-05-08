const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let mockUsers = {
  'user1': { id: 'user1', username: 'PilotPete', email: 'pete@example.com', avatarUrl: null, bio: 'Loves flying Cessnas! Based in California.', createdAt: '2023-10-01T10:00:00Z', likesCount: 150, friend_ids: ['user2'], subscribed_forum_ids: ['f1', 'f5'] },
  'user2': { id: 'user2', username: 'SimAviator', email: 'sim@example.com', avatarUrl: null, bio: 'PC Flight Sim Enthusiast. MSFS & X-Plane.', createdAt: '2023-10-05T11:00:00Z', likesCount: 210, friend_ids: ['user1'], subscribed_forum_ids: ['f1', 'f2', 'f4'] },
  'user3': { id: 'user3', username: 'SpotterArg', email: 'spotter@example.com', avatarUrl: null, bio: 'Aviation spotter from Buenos Aires.', createdAt: '2023-10-10T12:00:00Z', likesCount: 85, friend_ids: [], subscribed_forum_ids: ['f3'] },
  'user4': { id: 'user4', username: 'ATC_Pro', email: 'atc@example.com', avatarUrl: null, bio: 'Air Traffic Controller. Working the scopes.', createdAt: '2023-09-20T14:00:00Z', likesCount: 300, friend_ids: [], subscribed_forum_ids: ['f4'], isModeratorOf: ['f4'] },
};

let mockForums = {
  'f1': { id: 'f1', name: 'GeneralAviation', slug: 'general-aviation', description: 'Discussions about general aviation topics, flying experiences, and more.', bannerUrl: null, tags: ['flying', 'cessna', 'ppl'], rules: ['Be respectful.', 'Keep discussions related to GA.', 'No commercial advertising.'], creator_id: 'user1', createdAt: '2023-09-15T10:00:00Z', memberCount: 2 },
  'f2': { id: 'f2', name: 'FlightSimulators', slug: 'flight-simulators', description: 'All about PC flight simulators like MSFS 2020, X-Plane, DCS.', bannerUrl: null, tags: ['msfs', 'x-plane', 'hardware', 'vr'], rules: ['Specify the simulator you are discussing.', 'Share your setups!'], creator_id: 'user2', createdAt: '2023-09-16T11:00:00Z', memberCount: 1 },
  'f3': { id: 'f3', name: 'ArgentinaAviation', slug: 'argentina-aviation', description: 'Aviation news, spotting, and events in Argentina.', bannerUrl: null, tags: ['argentina', 'spotting', 'ezeiza', 'aerolineas'], rules: ['Spanish preferred, English accepted.', 'Focus on Argentinian aviation.'], creator_id: 'user3', createdAt: '2023-09-17T12:00:00Z', memberCount: 1 },
  'f4': { id: 'f4', name: 'AirTrafficControl', slug: 'air-traffic-control', description: 'Discussions about ATC procedures, careers, and news.', bannerUrl: null, tags: ['atc', 'career', 'faa', 'eurocontrol'], rules: ['Professional conduct expected.', 'Verified controllers welcome.'], creator_id: 'user4', createdAt: '2023-09-18T14:00:00Z', memberCount: 1 },
  'f5': { id: 'f5', name: 'AviationPhotography', slug: 'aviation-photography', description: 'Share your best aircraft photos and techniques.', bannerUrl: null, tags: ['photography', 'spotting', 'editing', 'gear'], rules: ['Only high-quality photos.', 'Credit the photographer.'], creator_id: 'user1', createdAt: '2023-09-19T15:00:00Z', memberCount: 1 },
};

let mockPosts = {
    'p1': { id: 'p1', title: 'First Solo Flight!', description: 'Just completed my first solo flight in a Cessna 172 today! What an incredible feeling. Landing was a bit bumpy but safe. Any tips for the next phase?', user_id: 'user1', forum_id: 'f1', createdAt: '2023-10-26T10:00:00Z', likesCount: 1, dislikesCount: 0, commentCount: 2 },
    'p2': { id: 'p2', title: 'Best Flight Simulator 2024?', description: 'Looking for recommendations for the most realistic flight simulator for PC right now. Is MSFS 2020 still the top choice, or has X-Plane 12 caught up significantly? Interested in GA and airliners.', user_id: 'user2', forum_id: 'f2', createdAt: '2023-10-25T14:30:00Z', likesCount: 2, dislikesCount: 1, commentCount: 3 },
    'p3': { id: 'p3', title: 'A380 Sighting at EZE', description: 'Saw the Emirates A380 landing at Ezeiza (Buenos Aires) today! Still impressive to see this giant.', user_id: 'user3', forum_id: 'f3', createdAt: '2023-10-26T12:00:00Z', likesCount: 1, dislikesCount: 0, commentCount: 1 },
    'p4': { id: 'p4', title: 'ATC Staffing Challenges', description: 'Discussion on the current staffing issues in ATC, particularly in the US. How is it affecting operations?', user_id: 'user4', forum_id: 'f4', createdAt: '2023-10-24T09:00:00Z', likesCount: 1, dislikesCount: 0, commentCount: 0 },
    'p5': { id: 'p5', title: 'Sunset shot of a 737', description: 'Managed to capture this beautiful sunset shot of a departing 737 last evening. Critiques welcome!', user_id: 'user1', forum_id: 'f5', createdAt: '2023-10-26T18:00:00Z', likesCount: 0, dislikesCount: 0, commentCount: 0 },
};
let nextPostId = 6;

let mockComments = {
    'c1': { id: 'c1', post_id: 'p1', user_id: 'user2', text: 'Congrats on the solo! Huge milestone.', createdAt: '2023-10-26T10:30:00Z', parent_id: null, likesCount: 1, dislikesCount: 0 },
    'c2': { id: 'c2', post_id: 'p1', user_id: 'user1', text: 'Thanks! Any advice for cross-country planning?', createdAt: '2023-10-26T11:00:00Z', parent_id: 'c1', likesCount: 0, dislikesCount: 0 },
    'c3': { id: 'c3', post_id: 'p2', user_id: 'user1', text: 'MSFS 2020 visuals are still unmatched for VFR, but X-Plane physics feel better for some planes.', createdAt: '2023-10-25T15:00:00Z', parent_id: null, likesCount: 1, dislikesCount: 0 },
    'c4': { id: 'c4', post_id: 'p2', user_id: 'user4', text: 'Depends on your hardware too. MSFS is demanding.', createdAt: '2023-10-25T15:15:00Z', parent_id: null, likesCount: 0, dislikesCount: 1 },
    'c5': { id: 'c5', post_id: 'p2', user_id: 'user2', text: 'Good point. Running a 4080, so should be okay.', createdAt: '2023-10-25T15:30:00Z', parent_id: 'c4', likesCount: 0, dislikesCount: 0 },
    'c6': { id: 'c6', post_id: 'p3', user_id: 'user1', text: 'Awesome catch!', createdAt: '2023-10-26T13:00:00Z', parent_id: null, likesCount: 0, dislikesCount: 0 },
};
let nextCommentId = 7;

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

let mockNotifications = {
  'n1': { id: 'n1', userId: 'user1', type: 'new_reply', text: 'SimAviator respondió a tu comentario en "First Solo Flight!"', createdAt: new Date(Date.now() - 3600 * 1000).toISOString(), read: false, link: '/post/p1#c2', postId: 'p1', commentId: 'c2' },
  'n2': { id: 'n2', userId: 'user1', type: 'post_like', text: 'SpotterArg le gustó tu post "Sunset shot of a 737"', createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), read: true, link: '/post/p5', postId: 'p5', senderId: 'user3' },
  'n3': { id: 'n3', userId: 'user2', type: 'new_comment', text: 'PilotPete comentó en tu post "Best Flight Simulator 2024?"', createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), read: false, link: '/post/p2#c3', postId: 'p2', commentId: 'c3', senderId: 'user1'},
  'n4': { id: 'n4', userId: 'user1', type: 'friend_request', text: 'ATC_Pro quiere ser tu amigo', createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), read: false, link: '/user/ATC_Pro', senderId: 'user4' }
};
let nextNotificationId = 5;

let mockMessages = {
    'user1_user2': { id: 'user1_user2', participants: ['user1', 'user2'], messages: [ { id: 'm1', senderId: 'user1', text: 'Hey! Ready for that group flight sim?', timestamp: new Date(Date.now() - 86400*1000 * 2).toISOString()}, { id: 'm2', senderId: 'user2', text: 'Yeah, almost! Just updating scenery.', timestamp: new Date(Date.now() - 86400*1000 * 2 + 60000).toISOString()}, { id: 'm4', senderId: 'user1', text: 'Cool! See you online soon.', timestamp: new Date().toISOString()}, ] },
    'user1_user3': { id: 'user1_user3', participants: ['user1', 'user3'], messages: [ { id: 'm3', senderId: 'user3', text: 'Great A380 shot you posted!', timestamp: new Date(Date.now() - 3600 * 1000 * 5).toISOString()}, ] }
};
let nextMessageId = 5;

const getUserInfo = (userId) => {
    const user = mockUsers[userId];
    return user ? { id: user.id, username: user.username, avatarUrl: user.avatarUrl } : { id: 'unknown', username: 'Desconocido', avatarUrl: null };
};
const getForumInfo = (forumId) => {
     const forum = mockForums[forumId];
     return forum ? { id: forum.id, name: forum.name, slug: forum.slug } : { id: 'unknown', name: 'Desconocido', slug: 'unknown' };
};

export const api = {

  login: async (email, password) => {
    await delay(500);
    console.log("Simulating login for:", email);
    const user = Object.values(mockUsers).find(u => u.email === email);
    if (user) {
      return { user: { ...user, friends: user.friend_ids || [], subscribedForums: user.subscribed_forum_ids || [] }, token: `mockToken-${user.id}` };
    } else { throw new Error("Credenciales inválidas"); }
  },

  register: async (userData) => {
    await delay(700);
    console.log("Simulating registration for:", userData.email);
    if (Object.values(mockUsers).some(u => u.email === userData.email)) throw new Error("Email ya existe");
    if (Object.values(mockUsers).some(u => u.username === userData.username)) throw new Error("Nombre de usuario ya existe");
    const newUserId = `user${Object.keys(mockUsers).length + 1}`;
    const newUser = { id: newUserId, username: userData.username, email: userData.email, avatarUrl: null, bio: '', likesCount: 0, friend_ids: [], subscribed_forum_ids: [], createdAt: new Date().toISOString(), };
    mockUsers[newUserId] = newUser;
    return { success: true, user: { ...newUser, friends: [], subscribedForums: [] } };
  },

  fetchCurrentUser: async (token) => {
      await delay(300);
       console.log("Simulating fetching current user with token:", token);
       if (token && token.startsWith('mockToken-')) {
          const userId = token.split('-')[1];
          const user = mockUsers[userId];
           if (user) {
               return { ...user, friends: user.friend_ids || [], subscribedForums: user.subscribed_forum_ids || [], };
           }
       }
      throw new Error("Token inválido o expirado");
   },
   verifyToken: async (token) => api.fetchCurrentUser(token),

  getHomeFeed: async (userId) => {
    await delay(800);
    console.log("Simulating fetch home feed for user:", userId);
    const user = mockUsers[userId];
    if (!user) return [];
    const feedPostIds = new Set();
    const subscribedForums = user.subscribed_forum_ids || [];
    const friends = user.friend_ids || [];
    subscribedForums.forEach(forumId => { Object.values(mockPosts).forEach(post => { if (post.forum_id === forumId) feedPostIds.add(post.id); }) });
    friends.forEach(friendId => { Object.values(mockPosts).forEach(post => { if (post.user_id === friendId) feedPostIds.add(post.id); }) });
    feedPostIds.add('p2'); feedPostIds.add('p5');
    const feedPosts = Array.from(feedPostIds).map(postId => { const post = mockPosts[postId]; if (!post) return null; return { ...post, user: getUserInfo(post.user_id), forum: getForumInfo(post.forum_id), } }).filter(Boolean).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return feedPosts;
  },

  getRecommendedForums: async (userId) => {
    await delay(400);
    console.log("Simulating fetch recommended forums");
    const user = mockUsers[userId];
    const subscribed = user?.subscribed_forum_ids || [];
    return Object.values(mockForums).filter(f => !subscribed.includes(f.id)).map(f => ({ id: f.id, name: f.name, slug: f.slug, description: f.description, bannerUrl: f.bannerUrl, })).slice(0, 3);
  },

  getForumDetails: async (forumSlug) => {
    await delay(600);
    console.log("Simulating fetch forum details:", forumSlug);
    const forum = Object.values(mockForums).find(f => f.slug === forumSlug);
    if (!forum) throw new Error("Foro no encontrado");
    const creatorInfo = getUserInfo(forum.creator_id);
    return { ...forum, creator: { username: creatorInfo.username } };
  },

  getForumPosts: async (forumId, sortBy = 'newest') => {
    await delay(700);
    console.log(`Simulating fetch posts for forum ${forumId}, sorted by ${sortBy}`);
    let posts = Object.values(mockPosts).filter(p => p.forum_id === forumId).map(post => ({ ...post, user: getUserInfo(post.user_id), forum: getForumInfo(post.forum_id), }));
    if (sortBy === 'likes') { posts.sort((a, b) => (b.likesCount - b.dislikesCount) - (a.likesCount - a.dislikesCount)); }
    else { posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); }
    return posts;
  },

  subscribeToForum: async (userId, forumId) => {
    await delay(300);
    console.log(`Simulating user ${userId} subscribing to forum ${forumId}`);
    const user = mockUsers[userId];
    const forum = mockForums[forumId];
    if (user && forum) { user.subscribed_forum_ids = user.subscribed_forum_ids || []; if (!user.subscribed_forum_ids.includes(forumId)) { user.subscribed_forum_ids.push(forumId); forum.memberCount = (forum.memberCount || 0) + 1; } return { success: true }; }
    throw new Error("Subscription failed");
  },

  unsubscribeFromForum: async (userId, forumId) => {
      await delay(300);
      console.log(`Simulating user ${userId} unsubscribing from forum ${forumId}`);
      const user = mockUsers[userId];
      const forum = mockForums[forumId];
       if (user && forum) { user.subscribed_forum_ids = (user.subscribed_forum_ids || []).filter(id => id !== forumId); forum.memberCount = Math.max(0, (forum.memberCount || 0) - 1); return { success: true }; }
       throw new Error("Unsubscription failed");
  },

  getPostDetails: async (postId) => {
    await delay(500);
    console.log("Simulating fetch post details:", postId);
    const post = mockPosts[postId];
    if (!post) throw new Error("Post no encontrado");
    const comments = Object.values(mockComments).filter(c => c.post_id === postId).map(comment => ({ ...comment, user: getUserInfo(comment.user_id), })).sort((a,b) => (b.likesCount - b.dislikesCount) - (a.likesCount - a.dislikesCount));
    return { ...post, user: getUserInfo(post.user_id), forum: getForumInfo(post.forum_id), comments: comments };
  },

  createPost: async (postData) => {
    await delay(600);
    const newId = `p${nextPostId++}`;
    console.log("Simulating create post:", newId, postData);
    const newPost = { id: newId, title: postData.title, description: postData.description, forum_id: postData.forumId, user_id: postData.userId, createdAt: new Date().toISOString(), likesCount: 0, dislikesCount: 0, commentCount: 0, };
    mockPosts[newId] = newPost;
     return { ...newPost, user: getUserInfo(newPost.user_id), forum: getForumInfo(newPost.forum_id), };
  },

  deletePost: async (postId, userId) => {
      await delay(400);
      console.log(`Simulating user ${userId} deleting post ${postId}`);
      const post = mockPosts[postId];
      if (!post) throw new Error("Post no encontrado");
      const forum = mockForums[post.forum_id];
      const isOwner = post.user_id === userId;
      const isModerator = forum && forum.creator_id === userId;
      if (isOwner || isModerator) { delete mockPosts[postId]; Object.keys(mockComments).forEach(commentId => { if (mockComments[commentId].post_id === postId) delete mockComments[commentId]; }); return { success: true }; }
      else { throw new Error("Permiso denegado"); }
  },

  voteCommon: async (itemId, userId, voteType, itemType) => {
      const itemCollection = itemType === 'post' ? mockPosts : mockComments;
      const item = itemCollection[itemId];
      if (!item) throw new Error(`${itemType === 'post' ? 'Post' : 'Comentario'} no encontrado`);
      if (!mockUsers[userId]) throw new Error("Usuario no encontrado");

      const existingVoteIndex = mockUserVotes.findIndex(v => v.user_id === userId && v.item_id === itemId);
      const existingVote = existingVoteIndex !== -1 ? mockUserVotes[existingVoteIndex] : null;

      let likeChange = 0; let dislikeChange = 0; let finalUserVoteType = null;

      if (existingVote) {
          if (existingVote.vote_type === voteType) {
              mockUserVotes.splice(existingVoteIndex, 1);
              if (voteType === 'like') likeChange = -1; else dislikeChange = -1;
              finalUserVoteType = null;
          } else {
              existingVote.vote_type = voteType;
              if (voteType === 'like') { likeChange = +1; dislikeChange = -1; }
              else { likeChange = -1; dislikeChange = +1; }
              finalUserVoteType = voteType;
          }
      } else {
          mockUserVotes.push({ _id: `v${nextVoteId++}`, user_id: userId, item_id: itemId, item_type: itemType, vote_type: voteType });
          if (voteType === 'like') likeChange = +1; else dislikeChange = +1;
          finalUserVoteType = voteType;
      }

      item.likesCount = (item.likesCount || 0) + likeChange;
      item.dislikesCount = (item.dislikesCount || 0) + dislikeChange;
      item.likesCount = Math.max(0, item.likesCount);
      item.dislikesCount = Math.max(0, item.dislikesCount);

      console.log(`${itemType} ${itemId} counts UPDATED: L=${item.likesCount}, D=${item.dislikesCount}`);

      return { success: true, likes: item.likesCount, dislikes: item.dislikesCount, userVote: finalUserVoteType };
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

  getUserVote: async (userId, itemId, itemType) => {
      await delay(100);
      const vote = mockUserVotes.find(v => v.user_id === userId && v.item_id === itemId);
      console.log(`Getting vote for ${userId} on ${itemId}, found: ${vote?.vote_type}`);
      return { voteType: vote ? vote.vote_type : null };
  },

  createComment: async (commentData) => {
       await delay(400);
       const newId = `c${nextCommentId++}`;
       console.log("Simulating create comment:", newId, commentData);
       const newComment = { id: newId, post_id: commentData.postId, user_id: commentData.userId, text: commentData.text, parent_id: commentData.parentId || null, createdAt: new Date().toISOString(), likesCount: 0, dislikesCount: 0, };
       mockComments[newId] = newComment;
        if(mockPosts[commentData.postId]) { mockPosts[commentData.postId].commentCount = (mockPosts[commentData.postId].commentCount || 0) + 1; }
       return { ...newComment, user: getUserInfo(newComment.user_id), };
   },

   deleteComment: async (commentId, userId) => {
       await delay(300);
       console.log(`Simulating user ${userId} deleting comment ${commentId}`);
       const comment = mockComments[commentId];
       if (!comment) throw new Error("Comentario no encontrado");
       const post = mockPosts[comment.post_id];
       const isCommentOwner = comment.user_id === userId;
       const isPostOwner = post && post.user_id === userId;
       const forum = post ? mockForums[post.forum_id] : null;
       const isModerator = forum && forum.creator_id === userId;
       if (isCommentOwner || isPostOwner || isModerator) {
           const postId = comment.post_id;
           delete mockComments[commentId];
           if(mockPosts[postId]) { mockPosts[postId].commentCount = Math.max(0, (mockPosts[postId].commentCount || 0) - 1); }
           return { success: true };
       } else { throw new Error("Permiso denegado"); }
   },

   getUserProfile: async (username) => {
       await delay(600);
       console.log("Simulating fetch user profile:", username);
       const user = Object.values(mockUsers).find(u => u.username === username);
       if (!user) throw new Error("Usuario no encontrado");
       const posts = Object.values(mockPosts).filter(p => p.user_id === user.id).map(post => ({ id: post.id, title: post.title, createdAt: post.createdAt, forum: getForumInfo(post.forum_id), })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
       const comments = Object.values(mockComments).filter(c => c.user_id === user.id).map(comment => ({ id: comment.id, text: comment.text.substring(0,100) + (comment.text.length > 100 ? '...' : ''), createdAt: comment.createdAt, postId: comment.post_id, post: mockPosts[comment.post_id] ? { title: mockPosts[comment.post_id].title } : { title: 'Post Desconocido'}, })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
       const friends = (user.friend_ids || []).map(friendId => { const friend = mockUsers[friendId]; return friend ? getUserInfo(friendId) : null; }).filter(Boolean);
       const subscribedForums = (user.subscribed_forum_ids || []).map(forumId => { const forum = mockForums[forumId]; return forum ? { id: forum.id, name: forum.name, slug: forum.slug, memberCount: forum.memberCount } : null; }).filter(Boolean);
       return { ...user, posts, comments, friends, subscribedForums, };
   },

   addFriend: async (currentUserId, targetUsername) => {
       await delay(300);
       console.log(`Simulating user ${currentUserId} adding friend ${targetUsername}`);
       const currentUser = mockUsers[currentUserId];
       const targetUser = Object.values(mockUsers).find(u => u.username === targetUsername);
       if (!currentUser || !targetUser) throw new Error("Usuario no encontrado");
       currentUser.friend_ids = currentUser.friend_ids || [];
       targetUser.friend_ids = targetUser.friend_ids || [];
       if (!currentUser.friend_ids.includes(targetUser.id)) { currentUser.friend_ids.push(targetUser.id); if (!targetUser.friend_ids.includes(currentUser.id)) { targetUser.friend_ids.push(currentUser.id); } }
       return { success: true, isFriend: true };
   },

    removeFriend: async (currentUserId, targetUsername) => {
       await delay(300);
       console.log(`Simulating user ${currentUserId} removing friend ${targetUsername}`);
       const currentUser = mockUsers[currentUserId];
       const targetUser = Object.values(mockUsers).find(u => u.username === targetUsername);
       if (!currentUser || !targetUser) throw new Error("Usuario no encontrado");
       currentUser.friend_ids = (currentUser.friend_ids || []).filter(id => id !== targetUser.id);
       targetUser.friend_ids = (targetUser.friend_ids || []).filter(id => id !== currentUser.id);
       return { success: true, isFriend: false };
   },

   search: async (query) => { await delay(500); return { users: [], forums: [], posts: []}; },

   banUserFromForum: async (moderatorId, forumId, targetUsername) => { await delay(400); return { success: true }; },
   setForumRules: async (moderatorId, forumId, newRules) => { await delay(300); const forum = mockForums[forumId]; if (forum && forum.creator_id === moderatorId) { forum.rules = newRules; return { success: true, rules: newRules }; } throw new Error("Permission Denied or Forum not found"); },

    getNotifications: async (userId) => { await delay(400); console.log("Simulating fetching notifications for:", userId); return Object.values(mockNotifications).filter(n => n.userId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); },
    markNotificationRead: async (userId, notificationId) => { await delay(150); console.log(`Simulating marking notification ${notificationId} as read for user ${userId}`); const notif = mockNotifications[notificationId]; if (notif && notif.userId === userId) { notif.read = true; return { success: true }; } throw new Error("Notification not found or permission denied."); },

     getConversations: async (userId) => { await delay(500); console.log("Simulating fetching conversations for:", userId); return Object.values(mockMessages).filter(conv => conv.participants.includes(userId)).map(conv => { const otherUserId = conv.participants.find(p => p !== userId); const otherUser = getUserInfo(otherUserId); const lastMessage = conv.messages[conv.messages.length - 1]; return { id: conv.id, otherUser: otherUser, lastMessage: lastMessage ? { text: lastMessage.text, timestamp: lastMessage.timestamp } : null }; }).sort((a,b) => { const timeA = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0; const timeB = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0; return timeB - timeA; }); },
     getMessages: async (userId, conversationId) => { await delay(300); console.log(`Simulating fetching messages for conversation ${conversationId}`); const conv = mockMessages[conversationId]; if (conv && conv.participants.includes(userId)) { return conv.messages.map(msg => ({ ...msg, sender: getUserInfo(msg.senderId) })).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); } throw new Error("Conversation not found or access denied."); },
     sendMessage: async (userId, conversationId, text) => { await delay(250); const conv = mockMessages[conversationId]; if (!conv || !conv.participants.includes(userId)) throw new Error("Cannot send message."); const newMessage = { id: `m${nextMessageId++}`, senderId: userId, text: text, timestamp: new Date().toISOString() }; conv.messages.push(newMessage); console.log(`Message sent by ${userId} to ${conversationId}: ${text}`); return { ...newMessage, sender: getUserInfo(userId) }; },

};