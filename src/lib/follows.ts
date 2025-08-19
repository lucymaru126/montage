import { supabase } from "./supabaseClient";
import { getCurrentUserId } from "./auth";

// FOLLOW
export async function followUser(followingId: string) {
  const me = await getCurrentUserId();
  if (me === followingId) throw new Error("You cannot follow yourself");

  const { error } = await supabase.from("follows").insert([
    { follower_id: me, following_id: followingId }
  ]);
  if (error) throw error;
}

// UNFOLLOW
export async function unfollowUser(followingId: string) {
  const me = await getCurrentUserId();
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", me)
    .eq("following_id", followingId);
  if (error) throw error;
}

// CHECK IF I FOLLOW THEM
export async function isFollowing(followingId: string): Promise<boolean> {
  const me = await getCurrentUserId();
  const { data, error } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", me)
    .eq("following_id", followingId)
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

// COUNTS
export async function getFollowersCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("follows")
    .select("following_id", { count: "exact", head: true })
    .eq("following_id", userId);
  if (error) throw error;
  return count ?? 0;
}

export async function getFollowingCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("follows")
    .select("follower_id", { count: "exact", head: true })
    .eq("follower_id", userId);
  if (error) throw error;
  return count ?? 0;
}

// LISTS (return minimal profile data)
export type MiniProfile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

// Who follows userId
export async function getFollowers(userId: string): Promise<MiniProfile[]> {
  const { data: rows, error } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", userId);
  if (error) throw error;

  const ids = (rows ?? []).map(r => r.follower_id);
  if (ids.length === 0) return [];

  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, bio")
    .in("id", ids);
  if (pErr) throw pErr;

  return profiles as MiniProfile[];
}

// Who userId is following
export async function getFollowing(userId: string): Promise<MiniProfile[]> {
  const { data: rows, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);
  if (error) throw error;

  const ids = (rows ?? []).map(r => r.following_id);
  if (ids.length === 0) return [];

  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, bio")
    .in("id", ids);
  if (pErr) throw pErr;

  return profiles as MiniProfile[];
}
