import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

// Types
export interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[] | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  post_likes?: { user_id: string }[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}

export interface Story {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  text_overlay: string | null;
  text_color: string | null;
  expires_at: string;
  created_at: string;
  profiles?: Profile;
  story_views?: { user_id: string }[];
  story_likes?: { user_id: string }[];
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  conversation_participants?: {
    user_id: string;
    profiles?: Profile;
  }[];
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  profiles?: Profile;
}

// Auth functions
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getCurrentSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Profile functions
export const getCurrentProfile = async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

export const getProfileById = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

export const getProfileByUsername = async (username: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAllProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }

  return data || [];
};

// Posts functions
export const getPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  // Get profiles, likes and comments separately for each post
  const postsWithDetails = await Promise.all(
    (data || []).map(async (post) => {
      const [profileResult, likesResult, commentsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', post.user_id).single(),
        supabase.from('post_likes').select('user_id').eq('post_id', post.id),
        supabase.from('comments').select('*').eq('post_id', post.id).order('created_at', { ascending: true })
      ]);

      // Get comment profiles
      let commentsWithProfiles = [];
      if (commentsResult.data && commentsResult.data.length > 0) {
        commentsWithProfiles = await Promise.all(
          commentsResult.data.map(async (comment) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', comment.user_id)
              .single();
            
            return {
              ...comment,
              profiles: profileData
            };
          })
        );
      }

      return {
        ...post,
        profiles: profileResult.data,
        post_likes: likesResult.data || [],
        comments: commentsWithProfiles
      };
    })
  );

  return postsWithDetails;
};

export const createPost = async (content: string, images: string[] = []) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content,
      images: images.length > 0 ? images : null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const likePost = async (postId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('post_likes')
    .insert({
      post_id: postId,
      user_id: user.id
    });

  if (error) throw error;
};

export const unlikePost = async (postId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id);

  if (error) throw error;
};

export const addComment = async (postId: string, content: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Stories functions
export const getStories = async (): Promise<Story[]> => {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stories:', error);
    return [];
  }

  // Get profiles, views and likes separately
  const storiesWithDetails = await Promise.all(
    (data || []).map(async (story) => {
      const [profileResult, viewsResult, likesResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', story.user_id).single(),
        supabase.from('story_views').select('user_id').eq('story_id', story.id),
        supabase.from('story_likes').select('user_id').eq('story_id', story.id)
      ]);

      return {
        ...story,
        profiles: profileResult.data,
        story_views: viewsResult.data || [],
        story_likes: likesResult.data || []
      };
    })
  );

  return storiesWithDetails;
};

export const createStory = async (
  content: string | null, 
  imageUrl: string | null = null,
  videoUrl: string | null = null,
  textOverlay: string | null = null,
  textColor: string | null = null
) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('stories')
    .insert({
      user_id: user.id,
      content,
      image_url: imageUrl,
      video_url: videoUrl,
      text_overlay: textOverlay,
      text_color: textColor
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const viewStory = async (storyId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('story_views')
    .insert({
      story_id: storyId,
      user_id: user.id
    });

  if (error && !error.message.includes('duplicate')) throw error;
};

// Follow functions
export const followUser = async (targetUserId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('followers')
    .insert({
      follower_id: user.id,
      following_id: targetUserId
    });

  if (error) throw error;
};

export const unfollowUser = async (targetUserId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId);

  if (error) throw error;
};

export const getFollowers = async (userId: string) => {
  const { data, error } = await supabase
    .from('followers')
    .select('follower_id')
    .eq('following_id', userId);

  if (error) {
    console.error('Error fetching followers:', error);
    return [];
  }

  // Get profiles for followers
  if (!data || data.length === 0) return [];

  const followersWithProfiles = await Promise.all(
    data.map(async (follower) => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', follower.follower_id)
        .single();
      
      return {
        follower_id: follower.follower_id,
        profiles: profileData
      };
    })
  );

  return followersWithProfiles;
};

export const getFollowing = async (userId: string) => {
  const { data, error } = await supabase
    .from('followers')
    .select('following_id')
    .eq('follower_id', userId);

  if (error) {
    console.error('Error fetching following:', error);
    return [];
  }

  // Get profiles for following
  if (!data || data.length === 0) return [];

  const followingWithProfiles = await Promise.all(
    data.map(async (following) => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', following.following_id)
        .single();
      
      return {
        following_id: following.following_id,
        profiles: profileData
      };
    })
  );

  return followingWithProfiles;
};

export const isFollowing = async (targetUserId: string): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('followers')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .single();

  if (error) return false;
  return !!data;
};

// Messages and conversations
export const getConversations = async (): Promise<Conversation[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  // Get conversations where user is a participant
  const { data: participantData, error: participantError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id);

  if (participantError) {
    console.error('Error fetching conversations:', participantError);
    return [];
  }

  if (!participantData || participantData.length === 0) return [];

  const conversationIds = participantData.map(p => p.conversation_id);

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .in('id', conversationIds)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  // Get participants and messages for each conversation
  const conversationsWithDetails = await Promise.all(
    (data || []).map(async (conversation) => {
      const [participantsData, messagesData] = await Promise.all([
        supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conversation.id),
        supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: true })
      ]);

      // Get profiles for participants
      let participantsWithProfiles = [];
      if (participantsData.data && participantsData.data.length > 0) {
        participantsWithProfiles = await Promise.all(
          participantsData.data.map(async (participant) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', participant.user_id)
              .single();
            
            return {
              user_id: participant.user_id,
              profiles: profileData
            };
          })
        );
      }

      // Get profiles for message senders
      let messagesWithProfiles = [];
      if (messagesData.data && messagesData.data.length > 0) {
        messagesWithProfiles = await Promise.all(
          messagesData.data.map(async (message) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', message.sender_id)
              .single();
            
            return {
              ...message,
              profiles: profileData
            };
          })
        );
      }

      return {
        ...conversation,
        conversation_participants: participantsWithProfiles,
        messages: messagesWithProfiles
      };
    })
  );

  return conversationsWithDetails;
};

export const createConversation = async (participantUserIds: string[]) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Create conversation
  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .insert({})
    .select()
    .single();

  if (conversationError) throw conversationError;

  // Add participants
  const participants = [user.id, ...participantUserIds].map(userId => ({
    conversation_id: conversation.id,
    user_id: userId
  }));

  const { error: participantsError } = await supabase
    .from('conversation_participants')
    .insert(participants);

  if (participantsError) throw participantsError;

  return conversation;
};

export const sendMessage = async (conversationId: string, content: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content
    })
    .select()
    .single();

  if (error) throw error;

  // Update conversation timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
};