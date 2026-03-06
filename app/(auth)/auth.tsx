import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Href, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// IMPORTA SUPABASE (assicurati che il percorso sia corretto rispetto a dove si trova questo file)
import { supabase } from '../../lib/supabase';

type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  // --- STATI ---
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Messaggi UI
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- TEMA ---
  const theme = {
    bg: isDark ? '#0F172A' : '#E2E8F0', 
    text: isDark ? '#F8FAFC' : '#111827', 
    subText: isDark ? '#94A3B8' : '#4B5563', 
    card: isDark ? '#1E293B' : '#FFFFFF', 
    border: isDark ? '#334155' : '#CBD5E1', 
    primary: '#2563EB',
    accent: '#10B981',
    error: '#EF4444',
  };

  // --- HANDLERS ---
  const toggleMode = () => {
    Haptics.selectionAsync();
    setMode(mode === 'login' ? 'register' : 'login');
    // Pulisci tutto al cambio modalità
    setEmail('');
    setPassword('');
    setNickname('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Validazione Password Sicura
  const isPasswordSecure = (pass: string) => {
    if (pass.length < 8) return "La password deve avere almeno 8 caratteri.";
    if (!/[A-Z]/.test(pass)) return "Aggiungi almeno una lettera maiuscola.";
    if (!/[0-9]/.test(pass)) return "Aggiungi almeno un numero.";
    return null;
  };

  const handleAuth = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Controlli campi vuoti
    if (!email || !password || (mode === 'register' && !nickname)) {
      setErrorMessage("Compila tutti i campi richiesti.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    // 2. Controlli sicurezza password (solo in registrazione)
    if (mode === 'register') {
      const passError = isPasswordSecure(password);
      if (passError) {
        setErrorMessage(passError);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        // --- CHIAMATA VERA A SUPABASE: LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;
        
        // --- LA MODIFICA È QUI ---
        // Puntiamo direttamente alla root di (tabs), che caricherà in automatico index.tsx
        router.replace('/(tabs)' as Href); 

      } else {
        // --- CHIAMATA VERA A SUPABASE: REGISTRAZIONE ---
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              nickname: nickname.trim(), 
            }
          }
        });

        if (error) throw error;

        setSuccessMessage("Account creato! Conferma l'indirizzo email e accedi.");
        setMode('login'); 
        setPassword(''); 
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("Invalid login credentials")) msg = "Email o password non corretti.";
      if (msg.includes("User already registered")) msg = "Questa email è già registrata.";
      
      setErrorMessage(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Ionicons name="football" size={400} color={theme.text} style={styles.watermark} />

          {/* HEADER: LOGO E TITOLO */}
          <View style={styles.header}>
            <View style={[styles.logoBox, { backgroundColor: theme.primary }]}>
               <Ionicons name="shield" size={32} color="white" />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>
              {mode === 'login' ? 'Accedi' : 'Registrati'}
            </Text>
          </View>

          {/* AREA MESSAGGI (Errori o Successi in UI invece di Alert) */}
          {errorMessage && (
            <View style={[styles.feedbackBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: theme.error }]}>
              <Ionicons name="warning" size={18} color={theme.error} />
              <Text style={[styles.feedbackText, { color: theme.error }]}>{errorMessage}</Text>
            </View>
          )}

          {successMessage && (
            <View style={[styles.feedbackBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: theme.accent }]}>
              <Ionicons name="checkmark-circle" size={18} color={theme.accent} />
              <Text style={[styles.feedbackText, { color: theme.accent }]}>{successMessage}</Text>
            </View>
          )}

          {/* FORM AREA */}
          <View style={styles.formContainer}>
            
            {/* NICKNAME (Solo Registrazione) */}
            {mode === 'register' && (
              <View style={[styles.inputCard, { backgroundColor: theme.card, borderLeftColor: theme.accent }]}>
                <Ionicons name="person" size={20} color={theme.subText} style={styles.inputIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: theme.subText }]}>NICKNAME</Text>
                  <TextInput 
                    style={[styles.input, { color: theme.text }]}
                    placeholder="es. Bomber99"
                    placeholderTextColor={theme.subText}
                    value={nickname}
                    onChangeText={(text) => { setNickname(text); setErrorMessage(null); }}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              </View>
            )}

            {/* EMAIL */}
            <View style={[styles.inputCard, { backgroundColor: theme.card, borderLeftColor: theme.primary }]}>
              <Ionicons name="mail" size={20} color={theme.subText} style={styles.inputIcon} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: theme.subText }]}>EMAIL</Text>
                <TextInput 
                  style={[styles.input, { color: theme.text }]}
                  placeholder="tua@email.it"
                  placeholderTextColor={theme.subText}
                  value={email}
                  onChangeText={(text) => { setEmail(text); setErrorMessage(null); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* PASSWORD */}
            <View style={[styles.inputCard, { backgroundColor: theme.card, borderLeftColor: theme.primary }]}>
              <Ionicons name="lock-closed" size={20} color={theme.subText} style={styles.inputIcon} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: theme.subText }]}>PASSWORD</Text>
                <TextInput 
                  style={[styles.input, { color: theme.text }]}
                  placeholder="********"
                  placeholderTextColor={theme.subText}
                  value={password}
                  onChangeText={(text) => { setPassword(text); setErrorMessage(null); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 10 }}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={theme.subText} />
              </TouchableOpacity>
            </View>

            {/* RECUPERO PASSWORD (Solo Login) */}
            {mode === 'login' && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '700' }}>
                  Password dimenticata? Recupera ora
                </Text>
              </TouchableOpacity>
            )}

          </View>

          {/* PULSANTE PRINCIPALE */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.submitBtn, 
                { backgroundColor: mode === 'login' ? theme.primary : theme.accent },
                isLoading && { opacity: 0.7 }
              ]} 
              onPress={handleAuth} 
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.submitText}>
                    {mode === 'login' ? 'ACCEDI' : 'REGISTRATI'}
                  </Text>
                  <Ionicons name={mode === 'login' ? "log-in-outline" : "person-add-outline"} size={24} color="white" />
                </>
              )}
            </TouchableOpacity>

            {/* TOGGLE MODE LINK */}
            <TouchableOpacity onPress={toggleMode} style={styles.switchModeBtn}>
              <Text style={[styles.switchModeText, { color: theme.subText }]}>
                {mode === 'login' 
                  ? "Non sei registrato? Fallo ora" 
                  : "Sei già registrato? Accedi ora"
                }
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    paddingBottom: 40 
  },
  
  watermark: {
    position: 'absolute',
    top: -50,
    right: -100,
    opacity: 0.03,
    transform: [{ rotate: '-20deg' }]
  },

  header: { 
    paddingHorizontal: 25, 
    marginBottom: 30, 
    marginTop: 20,
    alignItems: 'center' 
  },
  logoBox: {
    width: 64, 
    height: 64, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 4 }
  },
  title: { 
    fontSize: 40, 
    fontWeight: '900', 
    fontStyle: 'italic', 
    letterSpacing: -1 
  },

  // FEEDBACK IN UI (Errori e Successi)
  feedbackBox: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },

  formContainer: { paddingHorizontal: 20, gap: 15 },
  
  inputCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12,
    paddingHorizontal: 16, 
    borderRadius: 12, 
    borderLeftWidth: 6,
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    elevation: 2 
  },
  inputIcon: { marginRight: 15, width: 20, textAlign: 'center' },
  inputLabel: { fontSize: 10, fontWeight: '800', marginBottom: 2 },
  input: { fontSize: 16, fontWeight: '700', paddingVertical: 4 },

  forgotBtn: { 
    alignSelf: 'flex-end', 
    marginTop: 5, 
    marginBottom: 10 
  },

  footer: { paddingHorizontal: 20, marginTop: 30 },
  submitBtn: { 
    height: 60, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12,
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowRadius: 6, 
    shadowOffset: { width: 0, height: 4 }
  },
  submitText: { 
    color: 'white', 
    fontSize: 20, 
    fontWeight: '900', 
    fontStyle: 'italic', 
    letterSpacing: 1 
  },
  
  switchModeBtn: {
    marginTop: 25,
    alignItems: 'center',
    padding: 10
  },
  switchModeText: {
    fontSize: 14,
    fontWeight: '700'
  }
});