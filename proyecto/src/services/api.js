// src/services/api.js

// --- SIMULATED DELAY ---
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK DATA ---
let mockUsers = {
  'user1': { id: 'user1', username: 'PilotPete', email: 'pete@example.com', avatarUrl: null, bio: 'Loves flying Cessnas! Based in California.', likesCount: 150, friends: ['user2'], subscribedForums: ['f1', 'f5'] },
  'user2': { id: 'user2', username: 'SimAviator', email: 'sim@example.com', avatarUrl: null, bio: 'PC Flight Sim Enthusiast. MSFS & X-Plane.', likesCount: 210, friends: ['user1'], subscribedForums: ['f1', 'f2', 'f4'] },
  'user3': { id: 'user3', username: 'SpotterArg', email: 'spotter@example.com', avatarUrl: null, bio: 'Aviation spotter from Buenos Aires.', likesCount: 85, friends: [], subscribedForums: ['f3'] },
  'user4': { id: 'user4', username: 'ATC_Pro', email: 'atc@example.com', avatarUrl: null, bio: 'Air Traffic Controller. Working the scopes.', likesCount: 300, friends: [], subscribedForums: ['f4'], isModeratorOf: ['f4'] }, // Moderador del foro f4
};

let mockForums = {
  'f1': { id: 'f1', name: 'GeneralAviation', slug: 'general-aviation', description: 'Discussions about general aviation topics, flying experiences, and more.', memberCount: 5500, bannerUrl: null, tags: ['flying', 'cessna', 'ppl'], rules: ['Be respectful.', 'Keep discussions related to GA.', 'No commercial advertising.'], creator: 'user1' },
  'f2': { id: 'f2', name: 'FlightSimulators', slug: 'flight-simulators', description: 'All about PC flight simulators like MSFS 2020, X-Plane, DCS.', memberCount: 8200, bannerUrl: null, tags: ['msfs', 'x-plane', 'hardware', 'vr'], rules: ['Specify the simulator you are discussing.', 'Share your setups!'], creator: 'user2' },
  'f3': { id: 'f3', name: 'ArgentinaAviation', slug: 'argentina-aviation', description: 'Aviation news, spotting, and events in Argentina.', memberCount: 1800, bannerUrl: null, tags: ['argentina', 'spotting', 'ezeiza', 'aerolineas'], rules: ['Spanish preferred, English accepted.', 'Focus on Argentinian aviation.'], creator: 'user3' },
  'f4': { id: 'f4', name: 'AirTrafficControl', slug: 'air-traffic-control', description: 'Discussions about ATC procedures, careers, and news.', memberCount: 1250, bannerUrl: null, tags: ['atc', 'career', 'faa', 'eurocontrol'], rules: ['Professional conduct expected.', 'Verified controllers welcome.'], creator: 'user4' },
  'f5': { id: 'f5', name: 'AviationPhotography', slug: 'aviation-photography', description: 'Share your best aircraft photos and techniques.', memberCount: 2600, bannerUrl: null, tags: ['photography', 'spotting', 'editing', 'gear'], rules: ['Only high-quality photos.', 'Credit the photographer.'], creator: 'user1' },
};

let mockPosts = {
  'p1': { id: 'p1', title: 'First Solo Flight!', description: 'Just completed my first solo flight in a Cessna 172 today! What an incredible feeling. Landing was a bit bumpy but safe. Any tips for the next phase?', userId: 'user1', forumId: 'f1', likes: 28, dislikes: 1, createdAt: '2023-10-26T10:00:00Z' },
  'p2': { id: 'p2', title: 'Best Flight Simulator 2024?', description: 'Looking for recommendations for the most realistic flight simulator for PC right now. Is MSFS 2020 still the top choice, or has X-Plane 12 caught up significantly? Interested in GA and airliners.', userId: 'user2', forumId: 'f2', likes: 45, dislikes: 3, createdAt: '2023-10-25T14:30:00Z' },
  'p3': { id: 'p3', title: 'A380 Sighting at EZE', description: 'Saw the Emirates A380 landing at Ezeiza (Buenos Aires) today! Still impressive to see this giant.', userId: 'user3', forumId: 'f3', likes: 19, dislikes: 0, createdAt: '2023-10-26T12:00:00Z' },
  'p4': { id: 'p4', title: 'ATC Staffing Challenges', description: 'Discussion on the current staffing issues in ATC, particularly in the US. How is it affecting operations?', userId: 'user4', forumId: 'f4', likes: 35, dislikes: 2, createdAt: '2023-10-24T09:00:00Z' },
  'p5': { id: 'p5', title: 'Sunset shot of a 737', description: 'Managed to capture this beautiful sunset shot of a departing 737 last evening. critiques welcome!', userId: 'user1', forumId: 'f5', likes: 55, dislikes: 1, createdAt: '2023-10-26T18:00:00Z' },
};

let mockComments = {
  'c1': { id: 'c1', postId: 'p1', userId: 'user2', text: 'Congrats on the solo! Huge milestone.', likes: 5, dislikes: 0, createdAt: '2023-10-26T10:30:00Z', parentId: null },
  'c2': { id: 'c2', postId: 'p1', userId: 'user1', text: 'Thanks! Any advice for cross-country planning?', likes: 2, dislikes: 0, createdAt: '2023-10-26T11:00:00Z', parentId: 'c1' }, // Reply to c1
  'c3': { id: 'c3', postId: 'p2', userId: 'user1', text: 'MSFS 2020 visuals are still unmatched for VFR, but X-Plane physics feel better for some planes.', likes: 10, dislikes: 0, createdAt: '2023-10-25T15:00:00Z', parentId: null },
  'c4': { id: 'c4', postId: 'p2', userId: 'user4', text: 'Depends on your hardware too. MSFS is demanding.', likes: 6, dislikes: 1, createdAt: '2023-10-25T15:15:00Z', parentId: null },
  'c5': { id: 'c5', postId: 'p2', userId: 'user2', text: 'Good point. Running a 4080, so should be okay.', likes: 3, dislikes: 0, createdAt: '2023-10-25T15:30:00Z', parentId: 'c4' }, // Reply to c4
  'c6': { id: 'c6', postId: 'p3', userId: 'user1', text: 'Awesome catch!', likes: 1, dislikes: 0, createdAt: '2023-10-26T13:00:00Z', parentId: null },
};
let nextPostId = 6;
let nextCommentId = 7;

// --- SIMULATED API FUNCTIONS ---

export const api = {
  // === Auth ===
  login: async (email, password) => {
    await delay(500);
    console.log("Simulating login for:", email);
    const user = Object.values(mockUsers).find(u => u.email === email);
    if (user) { // Simulate password check success
      // In real API, you'd return user data and a JWT token
      return { user: { ...user }, token: `mockToken-${user.id}` };
    } else {
      throw new Error("Invalid credentials");
    }
  },

  register: async (userData) => {
    await delay(700);
    console.log("Simulating registration for:", userData.email);
    if (Object.values(mockUsers).some(u => u.email === userData.email)) {
      throw new Error("Email already exists");
    }
    if (Object.values(mockUsers).some(u => u.username === userData.username)) {
        throw new Error("Username already exists");
    }
    const newUserId = `user${Object.keys(mockUsers).length + 1}`;
    const newUser = {
      id: newUserId,
      username: userData.username,
      email: userData.email,
      avatarUrl: null,
      bio: '',
      likesCount: 0,
      friends: [],
      subscribedForums: [],
    };
    mockUsers[newUserId] = newUser;
    // Real API would save to DB and maybe return the created user or just success
    return { success: true, user: newUser };
  },

  verifyToken: async (token) => {
    await delay(300);
    console.log("Simulating token verification:", token);
    if (token && token.startsWith('mockToken-')) {
      const userId = token.split('-')[1];
      const user = mockUsers[userId];
      if (user) {
        return { ...user }; // Return user data associated with token
      }
    }
    throw new Error("Invalid or expired token");
  },

  // === Home Feed ===
  getHomeFeed: async (userId) => {
    await delay(800);
    console.log("Simulating fetch home feed for user:", userId);
    const user = mockUsers[userId];
    if (!user) return [];

    const feedPostIds = new Set();
    // Posts from subscribed forums
    user.subscribedForums.forEach(forumId => {
        Object.values(mockPosts).forEach(post => {
            if (post.forumId === forumId) feedPostIds.add(post.id);
        })
    });
    // Posts from friends (simplified: just get all their posts)
    user.friends.forEach(friendId => {
        Object.values(mockPosts).forEach(post => {
            if (post.userId === friendId) feedPostIds.add(post.id);
        })
    });

    // Add some general popular posts as "suggested" (simplified)
    feedPostIds.add('p2');
    feedPostIds.add('p5');


    const feedPosts = Array.from(feedPostIds)
        .map(postId => {
            const post = mockPosts[postId];
            return {
                ...post,
                user: mockUsers[post.userId] ? { username: mockUsers[post.userId].username, avatarUrl: mockUsers[post.userId].avatarUrl } : { username: 'Unknown', avatarUrl: null},
                forum: mockForums[post.forumId] ? { id: post.forumId, name: mockForums[post.forumId].name, slug: mockForums[post.forumId].slug } : { id: 'unknown', name: 'Unknown', slug: 'unknown' },
                commentCount: Object.values(mockComments).filter(c => c.postId === postId).length
            }
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first

    return feedPosts;
  },

  getRecommendedForums: async () => {
    await delay(400);
    console.log("Simulating fetch recommended forums");
    // Simple simulation: return forums not already subscribed by a default user (e.g., user1)
    const subscribed = mockUsers['user1']?.subscribedForums || [];
    return Object.values(mockForums)
        .filter(f => !subscribed.includes(f.id))
        .slice(0, 3); // Limit recommendations
  },

  // === Forums ===
  getForumDetails: async (forumSlug) => {
    await delay(600);
    console.log("Simulating fetch forum details:", forumSlug);
    const forum = Object.values(mockForums).find(f => f.slug === forumSlug);
    if (!forum) throw new Error("Forum not found");
    // Add moderator info
    const moderator = mockUsers[forum.creator] ? { username: mockUsers[forum.creator].username } : null;
    return { ...forum, moderator };
  },

  getForumPosts: async (forumId, sortBy = 'newest', /* filterByTag = null */) => {
    await delay(700);
    console.log(`Simulating fetch posts for forum ${forumId}, sorted by ${sortBy}`);
    let posts = Object.values(mockPosts)
      .filter(p => p.forumId === forumId)
      .map(post => ({
        ...post,
        user: mockUsers[post.userId] ? { username: mockUsers[post.userId].username, avatarUrl: mockUsers[post.userId].avatarUrl } : { username: 'Unknown', avatarUrl: null},
        forum: mockForums[post.forumId] ? { id: post.forumId, name: mockForums[post.forumId].name, slug: mockForums[post.forumId].slug } : { id: 'unknown', name: 'Unknown', slug: 'unknown' },
        commentCount: Object.values(mockComments).filter(c => c.postId === post.id).length
      }));

    // Simulate sorting
    if (sortBy === 'likes') {
      posts.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes));
    } else { // Default to newest
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // TODO: Implement tag filtering if needed

    return posts;
  },

  subscribeToForum: async (userId, forumId) => {
      await delay(300);
      console.log(`Simulating user ${userId} subscribing to forum ${forumId}`);
      const user = mockUsers[userId];
      if (user && !user.subscribedForums.includes(forumId)) {
          user.subscribedForums.push(forumId);
          mockForums[forumId].memberCount++; // Simulate member count increase
          return { success: true };
      }
      throw new Error("Subscription failed");
  },

  unsubscribeFromForum: async (userId, forumId) => {
      await delay(300);
      console.log(`Simulating user ${userId} unsubscribing from forum ${forumId}`);
      const user = mockUsers[userId];
      if (user) {
          user.subscribedForums = user.subscribedForums.filter(id => id !== forumId);
          mockForums[forumId].memberCount--; // Simulate member count decrease
           return { success: true };
      }
       throw new Error("Unsubscription failed");
  },

    // === Posts ===
  getPostDetails: async (postId) => {
    await delay(500);
    console.log("Simulating fetch post details:", postId);
    const post = mockPosts[postId];
    if (!post) throw new Error("Post not found");

    // Get comments for this post
    const comments = Object.values(mockComments)
        .filter(c => c.postId === postId)
        .map(comment => ({
            ...comment,
            user: mockUsers[comment.userId] ? { username: mockUsers[comment.userId].username, avatarUrl: mockUsers[comment.userId].avatarUrl } : { username: 'Unknown', avatarUrl: null},
        }))
        // Simulate sorting comments by likes (highest first)
        .sort((a,b) => (b.likes - b.dislikes) - (a.likes - a.dislikes));

    return {
        ...post,
        user: mockUsers[post.userId] ? { username: mockUsers[post.userId].username, avatarUrl: mockUsers[post.userId].avatarUrl } : { username: 'Unknown', avatarUrl: null},
        forum: mockForums[post.forumId] ? { id: post.forumId, name: mockForums[post.forumId].name, slug: mockForums[post.forumId].slug } : { id: 'unknown', name: 'Unknown', slug: 'unknown' },
        comments: comments // Attach comments here
    };
  },

  createPost: async (postData) => {
    await delay(600);
    const newId = `p${nextPostId++}`;
    console.log("Simulating create post:", newId, postData);
    const newPost = {
        id: newId,
        ...postData, // includes title, description, userId, forumId
        likes: 0,
        dislikes: 0,
        createdAt: new Date().toISOString(),
    };
    mockPosts[newId] = newPost;
    // Return the created post with user/forum details maybe?
     return {
        ...newPost,
        user: mockUsers[newPost.userId] ? { username: mockUsers[newPost.userId].username, avatarUrl: mockUsers[newPost.userId].avatarUrl } : { username: 'Unknown', avatarUrl: null},
        forum: mockForums[newPost.forumId] ? { id: newPost.forumId, name: mockForums[newPost.forumId].name, slug: mockForums[newPost.forumId].slug } : { id: 'unknown', name: 'Unknown', slug: 'unknown' },
        commentCount: 0
     };
  },

  deletePost: async (postId, userId) => {
      await delay(400);
      console.log(`Simulating user ${userId} deleting post ${postId}`);
      const post = mockPosts[postId];
      if (!post) throw new Error("Post not found");

      // Check ownership or moderation rights (simplified)
      const forum = mockForums[post.forumId];
      const isOwner = post.userId === userId;
      const isModerator = forum && forum.creator === userId; // Simplified: Only creator is mod

      if (isOwner || isModerator) {
          delete mockPosts[postId];
          // Also delete associated comments (in real backend, likely handled by DB constraints)
          Object.keys(mockComments).forEach(commentId => {
              if (mockComments[commentId].postId === postId) {
                  delete mockComments[commentId];
              }
          });
          return { success: true };
      } else {
          throw new Error("Permission denied");
      }
  },

  votePost: async (postId, userId, voteType) => {
      await delay(200);
      console.log(`Simulating user ${userId} ${voteType} post ${postId}`);
      const post = mockPosts[postId];
      if (!post) throw new Error("Post not found");
      // TODO: Add logic to track *who* voted to prevent double voting and allow changing votes
      if (voteType === 'like') {
          post.likes++;
      } else if (voteType === 'dislike') {
          post.dislikes++;
      }
       return { success: true, likes: post.likes, dislikes: post.dislikes };
  },

  // === Comments ===
   createComment: async (commentData) => {
       await delay(400);
       const newId = `c${nextCommentId++}`;
       console.log("Simulating create comment:", newId, commentData);
       const newComment = {
           id: newId,
           ...commentData, // includes postId, userId, text, parentId
           likes: 0,
           dislikes: 0,
           createdAt: new Date().toISOString(),
       };
       mockComments[newId] = newComment;
       return { // Return the created comment with user details
           ...newComment,
           user: mockUsers[newComment.userId] ? { username: mockUsers[newComment.userId].username, avatarUrl: mockUsers[newComment.userId].avatarUrl } : { username: 'Unknown', avatarUrl: null },
       };
   },

   deleteComment: async (commentId, userId) => {
       await delay(300);
       console.log(`Simulating user ${userId} deleting comment ${commentId}`);
       const comment = mockComments[commentId];
       if (!comment) throw new Error("Comment not found");
       const post = mockPosts[comment.postId];
       if (!post) throw new Error("Associated post not found"); // Should not happen ideally

       // Check ownership of comment OR ownership of post
       const isCommentOwner = comment.userId === userId;
       const isPostOwner = post.userId === userId;
       // TODO: Add moderator check as well

       if (isCommentOwner || isPostOwner) {
            // In a real system, deleting a parent comment might hide/delete children
            // Simulation: Just delete the comment itself
           delete mockComments[commentId];
           return { success: true };
       } else {
           throw new Error("Permission denied");
       }
   },

   voteComment: async (commentId, userId, voteType) => {
       await delay(150);
       console.log(`Simulating user ${userId} ${voteType} comment ${commentId}`);
       const comment = mockComments[commentId];
       if (!comment) throw new Error("Comment not found");
       // TODO: Add logic to track *who* voted
       if (voteType === 'like') {
           comment.likes++;
       } else if (voteType === 'dislike') {
           comment.dislikes++;
       }
       // Return updated counts for immediate UI update
       return { success: true, likes: comment.likes, dislikes: comment.dislikes };
   },

   // === User Profiles ===
   getUserProfile: async (username) => {
       await delay(600);
       console.log("Simulating fetch user profile:", username);
       const user = Object.values(mockUsers).find(u => u.username === username);
       if (!user) throw new Error("User not found");

       // Fetch user's posts (simplified)
       const posts = Object.values(mockPosts)
           .filter(p => p.userId === user.id)
           .map(post => ({
               ...post,
               forum: mockForums[post.forumId] ? { id: post.forumId, name: mockForums[post.forumId].name, slug: mockForums[post.forumId].slug } : { id: 'unknown', name: 'Unknown', slug: 'unknown' },
               commentCount: Object.values(mockComments).filter(c => c.postId === post.id).length
           }))
           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Fetch user's comments (simplified)
       const comments = Object.values(mockComments)
           .filter(c => c.userId === user.id)
           .map(comment => ({
               ...comment,
               post: mockPosts[comment.postId] ? { id: comment.postId, title: mockPosts[comment.postId].title } : { id: 'unknown', title: 'Unknown Post' }
           }))
           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Fetch friend details (simplified - just usernames)
       const friends = user.friends.map(friendId => mockUsers[friendId] ? { id: friendId, username: mockUsers[friendId].username, avatarUrl: mockUsers[friendId].avatarUrl } : null).filter(Boolean);

       // Fetch subscribed forum details
       const subscribedForums = user.subscribedForums.map(forumId => mockForums[forumId] || null).filter(Boolean);

       return {
           ...user,
           posts,
           comments,
           friends,
           subscribedForums,
       };
   },

   addFriend: async (currentUserId, targetUsername) => {
       await delay(300);
       console.log(`Simulating user ${currentUserId} adding friend ${targetUsername}`);
       const currentUser = mockUsers[currentUserId];
       const targetUser = Object.values(mockUsers).find(u => u.username === targetUsername);
       if (!currentUser || !targetUser) throw new Error("User not found");

       if (!currentUser.friends.includes(targetUser.id)) {
           currentUser.friends.push(targetUser.id);
           // In a real system, this might be a request that needs acceptance
           // Also add the inverse relationship for simulation simplicity
           if (!targetUser.friends.includes(currentUser.id)) {
               targetUser.friends.push(currentUser.id);
           }
           return { success: true, isFriend: true };
       }
       return { success: true, isFriend: true }; // Already friends
   },

    removeFriend: async (currentUserId, targetUsername) => {
       await delay(300);
       console.log(`Simulating user ${currentUserId} removing friend ${targetUsername}`);
       const currentUser = mockUsers[currentUserId];
       const targetUser = Object.values(mockUsers).find(u => u.username === targetUsername);
        if (!currentUser || !targetUser) throw new Error("User not found");

       currentUser.friends = currentUser.friends.filter(id => id !== targetUser.id);
        // Also remove the inverse relationship for simulation simplicity
       targetUser.friends = targetUser.friends.filter(id => id !== currentUser.id);

       return { success: true, isFriend: false };
   },

    // === Search ===
   search: async (query) => {
       await delay(500);
       console.log("Simulating search for:", query);
       const results = { users: [], forums: [], posts: [] }; // Posts added as suggestion
       query = query.toLowerCase();

       if (query.startsWith('@')) {
           const username = query.substring(1);
           results.users = Object.values(mockUsers)
               .filter(u => u.username.toLowerCase().includes(username))
               .map(u => ({ id: u.id, username: u.username, avatarUrl: u.avatarUrl }));
       } else if (query.startsWith('#')) {
           const forumName = query.substring(1);
           results.forums = Object.values(mockForums)
               .filter(f => f.name.toLowerCase().includes(forumName) || f.slug.toLowerCase().includes(forumName))
                .map(f => ({ id: f.id, name: f.name, slug: f.slug, memberCount: f.memberCount }));
       } else {
           // General search - suggest users, forums, and maybe posts
           results.users = Object.values(mockUsers)
               .filter(u => u.username.toLowerCase().includes(query))
               .slice(0, 3) // Limit results
               .map(u => ({ id: u.id, username: u.username, avatarUrl: u.avatarUrl }));

           results.forums = Object.values(mockForums)
               .filter(f => f.name.toLowerCase().includes(query) || f.description.toLowerCase().includes(query))
               .slice(0, 3) // Limit results
               .map(f => ({ id: f.id, name: f.name, slug: f.slug, memberCount: f.memberCount }));

            results.posts = Object.values(mockPosts)
                .filter(p => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query))
                .slice(0, 3) // Limit results
                .map(post => ({
                    id: post.id,
                    title: post.title,
                    user: mockUsers[post.userId] ? { username: mockUsers[post.userId].username } : { username: 'Unknown' },
                    forum: mockForums[post.forumId] ? { name: mockForums[post.forumId].name, slug: mockForums[post.forumId].slug } : { name: 'Unknown', slug: 'unknown' },
                }));
       }
       return results;
   },

   // === Moderation (Simplified) ===
    banUserFromForum: async (moderatorId, forumId, targetUsername) => {
        await delay(400);
        console.log(`Simulating moderator ${moderatorId} banning user ${targetUsername} from forum ${forumId}`);
        const forum = mockForums[forumId];
        const targetUser = Object.values(mockUsers).find(u => u.username === targetUsername);

        if (!forum || !targetUser) throw new Error("Forum or User not found");
        // Simplified check: Only creator can ban
        if (forum.creator !== moderatorId) throw new Error("Permission denied");

        // In real backend: Add user to a ban list for this forum
        console.log(`User ${targetUsername} would be banned from ${forum.name}.`);
        // Remove user from subscribers if they were subscribed
        if (targetUser.subscribedForums.includes(forumId)) {
            targetUser.subscribedForums = targetUser.subscribedForums.filter(id => id !== forumId);
            forum.memberCount--;
        }
        return { success: true };
    },

    setForumRules: async (moderatorId, forumId, newRules) => {
        await delay(300);
         console.log(`Simulating moderator ${moderatorId} setting rules for forum ${forumId}`);
         const forum = mockForums[forumId];
         if (!forum) throw new Error("Forum not found");
         // Simplified check: Only creator can set rules
         if (forum.creator !== moderatorId) throw new Error("Permission denied");

         forum.rules = newRules;
         console.log("New rules set:", newRules);
         return { success: true, rules: forum.rules };
    }

};