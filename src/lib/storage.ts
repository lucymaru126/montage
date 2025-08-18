// Local storage utilities for Montage app
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio: string;
  avatar: string;
  followers: string[];
  following: string[];
  posts: string[];
  stories: string[];
  createdAt: string;
  isVerified: boolean;
  isAdmin: boolean;
  isBanned: boolean;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  images: string[];
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  content: string;
  image?: string;
  video?: string;
  textOverlay?: string;
  textColor?: string;
  expiresAt: string;
  views: string[];
  likes: string[];
  replies: StoryReply[];
  createdAt: string;
}

export interface StoryReply {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  messages: Message[];
}

// Storage keys
const STORAGE_KEYS = {
  USERS: 'montage_users',
  POSTS: 'montage_posts',
  STORIES: 'montage_stories',
  CONVERSATIONS: 'montage_conversations',
  CURRENT_USER: 'montage_current_user'
};

// Generic storage functions
export const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
};

// User management
export const saveUser = (user: User): void => {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  saveToStorage(STORAGE_KEYS.USERS, users);
};

export const getUsers = (): User[] => {
  return getFromStorage<User>(STORAGE_KEYS.USERS);
};

export const getUserById = (id: string): User | null => {
  const users = getUsers();
  return users.find(user => user.id === id) || null;
};

export const getUserByUsername = (username: string): User | null => {
  const users = getUsers();
  return users.find(user => user.username.toLowerCase() === username.toLowerCase()) || null;
};

// Current user session
export const setCurrentUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

export const getCurrentUser = (): User | null => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const logoutUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

// Posts management
export const savePosts = (posts: Post[]): void => {
  saveToStorage(STORAGE_KEYS.POSTS, posts);
};

export const getPosts = (): Post[] => {
  return getFromStorage<Post>(STORAGE_KEYS.POSTS);
};

export const savePost = (post: Post): void => {
  const posts = getPosts();
  const existingIndex = posts.findIndex(p => p.id === post.id);
  
  if (existingIndex >= 0) {
    posts[existingIndex] = post;
  } else {
    posts.unshift(post); // Add new posts to the beginning
  }
  
  savePosts(posts);
};

// Stories management
export const getStories = (): Story[] => {
  const stories = getFromStorage<Story>(STORAGE_KEYS.STORIES);
  // Filter out expired stories
  const now = new Date().toISOString();
  return stories.filter(story => story.expiresAt > now);
};

export const saveStory = (story: Story): void => {
  const stories = getFromStorage<Story>(STORAGE_KEYS.STORIES);
  stories.unshift(story);
  saveToStorage(STORAGE_KEYS.STORIES, stories);
};

export const viewStory = (storyId: string, userId: string): void => {
  const stories = getFromStorage<Story>(STORAGE_KEYS.STORIES);
  const storyIndex = stories.findIndex(s => s.id === storyId);
  if (storyIndex !== -1 && !stories[storyIndex].views.includes(userId)) {
    stories[storyIndex].views.push(userId);
    saveToStorage(STORAGE_KEYS.STORIES, stories);
  }
};

export const getUserStories = (userId: string): Story[] => {
  const stories = getStories();
  return stories.filter(story => story.userId === userId);
};

export const hasUnviewedStories = (userId: string, currentUserId: string): boolean => {
  const userStories = getUserStories(userId);
  return userStories.some(story => !story.views.includes(currentUserId));
};

// Conversations management
export const getConversations = (userId: string): Conversation[] => {
  const conversations = getFromStorage<Conversation>(STORAGE_KEYS.CONVERSATIONS);
  return conversations.filter(conv => conv.participants.includes(userId));
};

export const saveConversation = (conversation: Conversation): void => {
  const conversations = getFromStorage<Conversation>(STORAGE_KEYS.CONVERSATIONS);
  const existingIndex = conversations.findIndex(c => c.id === conversation.id);
  
  if (existingIndex >= 0) {
    conversations[existingIndex] = conversation;
  } else {
    conversations.push(conversation);
  }
  
  saveToStorage(STORAGE_KEYS.CONVERSATIONS, conversations);
};

// Follow/Unfollow functions
export const followUser = (currentUserId: string, targetUserId: string): void => {
  const users = getUsers();
  const currentUserIndex = users.findIndex(u => u.id === currentUserId);
  const targetUserIndex = users.findIndex(u => u.id === targetUserId);
  
  if (currentUserIndex >= 0 && targetUserIndex >= 0) {
    if (!users[currentUserIndex].following.includes(targetUserId)) {
      users[currentUserIndex].following.push(targetUserId);
      users[targetUserIndex].followers.push(currentUserId);
      saveToStorage(STORAGE_KEYS.USERS, users);
      
      // Update current user in session if it's the current user
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id === currentUserId) {
        setCurrentUser(users[currentUserIndex]);
      }
    }
  }
};

export const unfollowUser = (currentUserId: string, targetUserId: string): void => {
  const users = getUsers();
  const currentUserIndex = users.findIndex(u => u.id === currentUserId);
  const targetUserIndex = users.findIndex(u => u.id === targetUserId);
  
  if (currentUserIndex >= 0 && targetUserIndex >= 0) {
    users[currentUserIndex].following = users[currentUserIndex].following.filter(id => id !== targetUserId);
    users[targetUserIndex].followers = users[targetUserIndex].followers.filter(id => id !== currentUserId);
    saveToStorage(STORAGE_KEYS.USERS, users);
    
    // Update current user in session if it's the current user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === currentUserId) {
      setCurrentUser(users[currentUserIndex]);
    }
  }
};

// Admin functions
export const banUser = (userId: string): void => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex >= 0) {
    users[userIndex].isBanned = true;
    saveToStorage(STORAGE_KEYS.USERS, users);
  }
};

export const verifyUser = (userId: string): void => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex >= 0) {
    users[userIndex].isVerified = true;
    saveToStorage(STORAGE_KEYS.USERS, users);
  }
};

export const createAdminUser = (): void => {
  const existingAdmin = getUserByUsername('montage');
  if (!existingAdmin) {
    const adminUser: User = {
      id: 'admin-montage',
      username: 'montage',
      email: 'admin@montage.com',
      fullName: 'Montage Official',
      bio: 'Official Montage account 📱✨',
      avatar: '',
      followers: [],
      following: [],
      posts: [],
      stories: [],
      createdAt: new Date().toISOString(),
      isVerified: true,
      isAdmin: true,
      isBanned: false
    };
    saveUser(adminUser);
  }
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateStoryExpiration = (): string => {
  const now = new Date();
  now.setHours(now.getHours() + 24); // Stories expire in 24 hours
  return now.toISOString();
};

// Like/Unlike functions
export const togglePostLike = (postId: string, userId: string): void => {
  const posts = getPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex >= 0) {
    const post = posts[postIndex];
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      post.likes.push(userId);
    }
    posts[postIndex] = post;
    savePosts(posts);
  }
};

export const toggleStoryLike = (storyId: string, userId: string): void => {
  const stories = getFromStorage<Story>(STORAGE_KEYS.STORIES);
  const storyIndex = stories.findIndex(s => s.id === storyId);
  
  if (storyIndex >= 0) {
    const story = stories[storyIndex];
    if (!story.likes) story.likes = [];
    
    if (story.likes.includes(userId)) {
      story.likes = story.likes.filter(id => id !== userId);
    } else {
      story.likes.push(userId);
    }
    stories[storyIndex] = story;
    saveToStorage(STORAGE_KEYS.STORIES, stories);
  }
};

export const addStoryView = (storyId: string, userId: string): void => {
  const stories = getFromStorage<Story>(STORAGE_KEYS.STORIES);
  const storyIndex = stories.findIndex(s => s.id === storyId);
  
  if (storyIndex >= 0) {
    const story = stories[storyIndex];
    if (!story.views.includes(userId)) {
      story.views.push(userId);
      stories[storyIndex] = story;
      saveToStorage(STORAGE_KEYS.STORIES, stories);
    }
  }
};

export const addStoryReply = (storyId: string, userId: string, content: string): void => {
  const stories = getFromStorage<Story>(STORAGE_KEYS.STORIES);
  const storyIndex = stories.findIndex(s => s.id === storyId);
  
  if (storyIndex >= 0) {
    const story = stories[storyIndex];
    if (!story.replies) story.replies = [];
    
    const reply: StoryReply = {
      id: generateId(),
      userId,
      content,
      createdAt: new Date().toISOString()
    };
    
    story.replies.push(reply);
    stories[storyIndex] = story;
    saveToStorage(STORAGE_KEYS.STORIES, stories);
    
    // Also create a DM conversation
    const storyOwner = getUserById(story.userId);
    if (storyOwner && storyOwner.id !== userId) {
      const conversations = getFromStorage<Conversation>(STORAGE_KEYS.CONVERSATIONS);
      let conversation = conversations.find(conv => 
        conv.participants.includes(userId) && conv.participants.includes(story.userId)
      );
      
      if (!conversation) {
        conversation = {
          id: generateId(),
          participants: [userId, story.userId],
          messages: [],
          lastMessage: {
            id: '',
            fromUserId: '',
            toUserId: '',
            content: '',
            createdAt: new Date().toISOString(),
            read: true
          }
        };
      }
      
      const message: Message = {
        id: generateId(),
        fromUserId: userId,
        toUserId: story.userId,
        content: `Replied to your story: ${content}`,
        createdAt: new Date().toISOString(),
        read: false
      };
      
      conversation.messages.push(message);
      conversation.lastMessage = message;
      
      saveConversation(conversation);
    }
  }
};

export const addPostComment = (postId: string, userId: string, content: string): void => {
  const posts = getPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex >= 0) {
    const comment: Comment = {
      id: generateId(),
      userId,
      content,
      createdAt: new Date().toISOString()
    };
    
    posts[postIndex].comments.push(comment);
    savePosts(posts);
  }
};