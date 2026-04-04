import { supabase } from './client'

export const auth = {
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),

  signOut: () => supabase.auth.signOut(),

  resetPassword: (email: string) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    }),

  updatePassword: (password: string) =>
    supabase.auth.updateUser({ password }),

  getSession: () => supabase.auth.getSession(),

  onAuthStateChange: supabase.auth.onAuthStateChange.bind(supabase.auth),
}
