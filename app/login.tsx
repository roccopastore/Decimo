import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

// 1. REGISTRAZIONE (Iscrizione nuovo utente)
export const signUpWithEmail = async (email: string, password: string, nickname: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname: nickname, // Salviamo subito il nickname
      }
    }
  });

  if (error) Alert.alert("Errore", error.message);
  else Alert.alert("Evvai!", "Controlla la mail per confermare l'account.");
};

// 2. LOGIN (Entrare nello spogliatoio)
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) Alert.alert("Errore Login", "Email o password errati mister.");
  return data;
};

// 3. LOGOUT
export const signOut = async () => {
  await supabase.auth.signOut();
};