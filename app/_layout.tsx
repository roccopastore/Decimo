import { Session } from '@supabase/supabase-js';
import { Href, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Assicurati che il percorso sia corretto rispetto a dove hai la cartella lib
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  // Non usiamo più il falso "isAuthenticated", ma la VERA sessione di Supabase
  const [session, setSession] = useState<Session | null>(null); 
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Controlla se c'è già una sessione salvata quando l'app si avvia
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsReady(true); // Fine caricamento iniziale
    });

    // 2. Ascolta in TEMPO REALE i cambiamenti (login, logout, registrazione)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // Controlliamo se siamo dentro la cartella (auth)
    const currentSegment = String(segments[0]);
    const inAuthGroup = currentSegment === '(auth)';

    if (!session && !inAuthGroup) {
      // Se NON c'è sessione e non siamo già nel login -> Caccialo al login
      // Visto che mi hai detto che il file si chiama auth.tsx, la rotta è questa:
      router.replace('/(auth)/auth' as Href); 
      
    } else if (session && inAuthGroup) {
      // Se C'È la sessione e siamo nella pagina di login -> Fallo entrare nelle tabs!
      router.replace('/(tabs)' as Href); 
    }
  }, [session, isReady, segments]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}