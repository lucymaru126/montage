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
  image: string;
  expiresAt: string;
  views: string[];
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

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateStoryExpiration = (): string => {
  const now = new Date();
  now.setHours(now.getHours() + 24); // Stories expire in 24 hours
  return now.toISOString();
};