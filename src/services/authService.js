import { supabase, isSupabaseConfigured } from './supabaseClient';
import { readStorage, writeStorage, removeStorage } from './storageService';
import { DEMO_USERS } from '../data/sampleData';

const DEMO_USERS_KEY = 'demo_users';
const DEMO_SESSION_KEY = 'demo_session_user_id';

function ensureDemoUsers() {
  let users = readStorage(DEMO_USERS_KEY);
  if (!Array.isArray(users) || users.length === 0) {
    users = DEMO_USERS;
    writeStorage(DEMO_USERS_KEY, users);
  }
  return users;
}

export async function getCurrentSessionUser() {
  if (isSupabaseConfigured) {
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) return null;

    const { data: profile, error: profErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profErr || !profile) {
      return {
        id: authData.user.id,
        email: authData.user.email,
        full_name: authData.user.user_metadata?.full_name || '',
        phone: '',
        role: 'customer',
        is_active: true,
      };
    }
    return profile;
  }

  const sessionUserId = readStorage(DEMO_SESSION_KEY);
  if (!sessionUserId) return null;
  const users = ensureDemoUsers();
  return users.find((u) => u.id === sessionUserId && u.is_active !== false) || null;
}

export async function signInWithEmail(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error) throw new Error(error.message);
    return getCurrentSessionUser(data.user?.id);
  }

  const users = ensureDemoUsers();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    throw new Error('No account found with that email. Use a demo account or register a new one.');
  }
  if (user.is_active === false) {
    throw new Error('This account has been deactivated by an administrator.');
  }
  if (!password || password.length < 6) {
    throw new Error('Invalid password.');
  }
  // If user registered in demo mode, verify stored demo password; built-in demo accounts accept DemoPass123! or >= 8 chars
  if (user.demo_password && user.demo_password !== password) {
    throw new Error('Incorrect password.');
  }
  writeStorage(DEMO_SESSION_KEY, user.id);
  return user;
}

export async function signUpWithEmail({ fullName, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });
    if (error) throw new Error(error.message);
    return {
      user: data.user ? await getCurrentSessionUser() : null,
      needsEmailConfirmation: Boolean(data.user && !data.session),
    };
  }

  const users = ensureDemoUsers();
  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const created = {
    id: `demo-user-${Date.now()}`,
    email: normalizedEmail,
    full_name: fullName.trim(),
    phone: '',
    role: 'customer',
    is_active: true,
    demo_password: password,
    created_at: new Date().toISOString(),
  };

  writeStorage(DEMO_USERS_KEY, [...users, created]);
  writeStorage(DEMO_SESSION_KEY, created.id);
  return { user: created, needsEmailConfirmation: false };
}

export async function signOutUser() {
  if (isSupabaseConfigured) {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    return;
  }
  removeStorage(DEMO_SESSION_KEY);
}

export async function updateUserProfile(userId, updates) {
  const payload = {
    full_name: updates.full_name?.trim() || '',
    phone: updates.phone?.trim() || '',
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const users = ensureDemoUsers();
  const next = users.map((u) => (u.id === userId ? { ...u, ...payload } : u));
  writeStorage(DEMO_USERS_KEY, next);
  return next.find((u) => u.id === userId);
}

export async function getAllUsers() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }
  return ensureDemoUsers();
}

export async function updateUserByAdmin(userId, updates) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('users')
      .update({
        role: updates.role,
        is_active: updates.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const users = ensureDemoUsers();
  const next = users.map((u) =>
    u.id === userId
      ? {
          ...u,
          role: updates.role ?? u.role,
          is_active: updates.is_active ?? u.is_active,
        }
      : u,
  );
  writeStorage(DEMO_USERS_KEY, next);
  return next.find((u) => u.id === userId);
}
