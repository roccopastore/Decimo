import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

// --- TIPI ---
interface AvatarConfig {
  skinColor: string;
  kitColor: string;
  hairStyle: string;
  hairColor: string;
}

const getRankInfo = (matches: number): { label: string; colors: [string, string, ...string[]] } => {
  if (matches < 50) return { label: 'ROOKIE', colors: ['#CD7F32', '#8B4513'] }; 
  if (matches < 100) return { label: 'PRO', colors: ['#94A3B8', '#475569'] }; 
  if (matches < 500) return { label: 'CHAMPION', colors: ['#F59E0B', '#B45309'] }; 
  return { label: 'LEGEND', colors: ['#8B5CF6', '#4C1D95'] }; 
};

const AVATAR_OPTIONS = {
  kits: ['#EF4444', '#2563EB', '#10B981', '#F59E0B', '#0F172A', '#FFFFFF'],
  skins: ['ffdbb4', 'edb98a', 'd08b5b', 'ae5d29', '614335'], 
  hairStyles: [
    { id: 'shortHair', label: 'CORTI' }, { id: 'longHair', label: 'LUNGHI' },
    { id: 'shortHairFrizzle', label: 'RICCI' }, { id: 'shortHairDreads01', label: 'DREADS' },
    { id: 'noHair', label: 'PELATO' },
  ],
};

const AvatarBuilder = ({ config, size = 300 }: { config: AvatarConfig, size?: number }) => {
  const diceBearUrl = `https://api.dicebear.com/9.x/avataaars/png?seed=Felix&top=${config.hairStyle}&hairColor=${config.hairColor}&skinColor=${config.skinColor}&clothing=collarAndSweater&clothingColor=ffffff&backgroundType=transparent&scale=110&translateY=10`;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' }}>
      <Image source={{ uri: diceBearUrl }} style={{ width: size * 0.8, height: size * 0.8, position: 'absolute', bottom: size * 0.22, zIndex: 3 }} resizeMode="contain"/>
      <View style={{ position: 'absolute', bottom: size * 0.25, width: size * 0.15, height: size * 0.1, backgroundColor: `#${config.skinColor}`, zIndex: 2 }} />
      <Ionicons name="shirt" size={size * 0.65} color={config.kitColor} style={{ position: 'absolute', bottom: -size * 0.05, zIndex: 2 }} />
    </View>
  );
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // FIX: Aggiunta la proprietà 'error' per risolvere l'errore TypeScript
  const theme = {
    bg: isDark ? '#0F172A' : '#E2E8F0', 
    text: isDark ? '#F8FAFC' : '#111827', 
    subText: isDark ? '#94A3B8' : '#4B5563', 
    card: isDark ? '#1E293B' : '#FFFFFF', 
    border: isDark ? '#334155' : '#CBD5E1', 
    primary: '#2563EB',
    tabContainerBg: isDark ? '#1E293B' : '#D1D5DB', 
    tabActiveBg: isDark ? '#334155' : '#FFFFFF',
    inputBg: isDark ? '#0F172A' : '#F1F5F9',
    error: '#EF4444', 
  };

  // --- STATI DATABASE REALE ---
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [nickname, setNickname] = useState('Giocatore');
  const [role, setRole] = useState('GIOCATORE');
  const [credits, setCredits] = useState(0);
  const [stats, setStats] = useState({ matchesPlayed: 0, goals: 0, vote: 0.0, fairplay: 100 });
  const [bio, setBio] = useState('');
  
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    skinColor: 'edb98a', kitColor: '#2563EB', hairStyle: 'shortHair', hairColor: '4a312c'
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // --- STATI UI ---
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'kit' | 'skin' | 'hair'>('kit');
  const [activeTab, setActiveTab] = useState<'giocate' | 'attivita'>('giocate');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(''); 

  const { label: rankLabel, colors: rankColors } = getRankInfo(stats.matchesPlayed);

  // --- FETCH DAL DATABASE ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          setUserEmail(user.email || '');

          const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          
          if (profile) {
            setNickname(profile.nickname || user.user_metadata?.nickname || 'Giocatore');
            setRole(profile.role || 'GIOCATORE');
            setBio(profile.bio || '');
            setCredits(profile.credits || 0);
            setStats({
              matchesPlayed: profile.matches_played || 0,
              goals: profile.goals || 0,
              vote: profile.vote || 0.0,
              fairplay: profile.fairplay || 100,
            });
            if (profile.avatar_config) setAvatarConfig(profile.avatar_config);
          } else {
            setNickname(user.user_metadata?.nickname || 'Giocatore');
          }
        }
      } catch (error) {
        console.error("Errore nel recupero utente:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserData();
  }, []);

  // --- SALVATAGGIO BIO NEL DATABASE ---
  const handleSaveBio = async () => {
    Haptics.selectionAsync();
    if (!userId) return;
    
    setIsEditingBio(false);
    setBio(tempBio);

    await supabase.from('profiles').upsert({ id: userId, bio: tempBio, nickname });
  };

  // --- SALVATAGGIO AVATAR NEL DATABASE ---
  const handleSaveAvatar = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (userId) {
      await supabase.from('profiles').upsert({ id: userId, avatar_config: avatarConfig, nickname });
    }
    setIsEditorOpen(false);
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await supabase.auth.signOut();
  };

  const startEditingBio = () => {
    Haptics.selectionAsync();
    setTempBio(bio);
    setIsEditingBio(true);
  };

  if (isLoadingProfile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: theme.text }]}>Profilo</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            <View style={[styles.coinBadge, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="wallet" size={16} color="#F59E0B" />
              <Text style={[styles.coinText, { color: theme.text }]}>{credits}</Text>
            </View>
            <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={24} color={theme.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* HERO CARD */}
        <View style={styles.cardContainer}>
          <LinearGradient colors={rankColors} style={styles.cardFrame} start={{x:0, y:0}} end={{x:1, y:1}}>
            <View style={[styles.cardInner, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                
                <Ionicons name="football" size={200} color={theme.text} style={{ position:'absolute', top: -30, right: -30, opacity: 0.05 }} />

                <View style={styles.avatarWrapper}>
                    <AvatarBuilder config={avatarConfig} size={220} />
                </View>

                <TouchableOpacity 
                    style={[styles.editBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]} 
                    onPress={() => { Haptics.selectionAsync(); setIsEditorOpen(true); }}
                >
                    <Ionicons name="shirt" size={18} color="white" />
                </TouchableOpacity>

                <View style={styles.cardInfo}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={[styles.playerName, { color: theme.text }]} adjustsFontSizeToFit numberOfLines={2}>
                                {nickname.toUpperCase()}
                            </Text>
                            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4}}>
                                <View style={[styles.roleBadge, { backgroundColor: theme.primary }]}>
                                    <Text style={styles.roleText}>{role}</Text>
                                </View>
                                <View style={[styles.roleBadge, { backgroundColor: rankColors[1] }]}>
                                    <Text style={styles.roleText}>{rankLabel}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
          </LinearGradient>
        </View>

        <View style={{ paddingHorizontal: 25, marginBottom: 20 }}>
            <Text style={{ color: theme.subText, fontSize: 12, fontWeight: '600' }}>Account: {userEmail}</Text>
        </View>

        {/* STATS GRID */}
        <View style={styles.statsRow}>
            <StatBox label="MATCH" value={stats.matchesPlayed} theme={theme} />
            <StatBox label="GOL" value={stats.goals} theme={theme} color="#10B981" />
            <StatBox label="VOTO" value={stats.vote} theme={theme} color="#F59E0B" />
            <StatBox label="FAIRPLAY" value={`${stats.fairplay}%`} theme={theme} color="#2563EB" />
        </View>

        {/* BIO SECTION */}
        <View style={[styles.bioContainer, { backgroundColor: theme.card }]}>
          <View style={styles.quoteIcon}>
            <Ionicons name="chatbox-ellipses" size={20} color={theme.primary} />
          </View>
          
          <View style={{flex: 1}}>
             {isEditingBio ? (
                 <TextInput 
                    style={[styles.bioInput, { color: theme.text, backgroundColor: theme.inputBg }]}
                    value={tempBio}
                    onChangeText={setTempBio}
                    multiline
                    autoFocus
                    placeholder="Scrivi qualcosa su di te..."
                    placeholderTextColor={theme.subText}
                 />
             ) : (
                <Text style={[styles.bioText, { color: bio ? theme.text : theme.subText, fontStyle: bio ? 'italic' : 'normal' }]}>
                    {bio ? bio : "Descriviti! Fai sapere agli altri il tuo stile di gioco."}
                </Text>
             )}
          </View>

          {isEditingBio ? (
            <TouchableOpacity onPress={handleSaveBio} style={{padding: 4}}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={startEditingBio} style={{padding: 4}}>
              <Ionicons name="pencil" size={20} color={theme.subText} />
            </TouchableOpacity>
          )}
        </View>

        {/* TABS (FIX: Stile H46, R12 richiesto) */}
        <View style={styles.tabsWrapper}>
          <View style={[styles.tabContainer, { backgroundColor: theme.tabContainerBg }]}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'giocate' && { backgroundColor: theme.tabActiveBg, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }]} 
              onPress={() => { Haptics.selectionAsync(); setActiveTab('giocate'); }}
            >
              <Text style={[styles.tabText, { color: activeTab === 'giocate' ? theme.text : theme.subText }]}>Giocate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'attivita' && { backgroundColor: theme.tabActiveBg, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }]} 
              onPress={() => { Haptics.selectionAsync(); setActiveTab('attivita'); }}
            >
              <Text style={[styles.tabText, { color: activeTab === 'attivita' ? theme.text : theme.subText }]}>Attività</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CONTENT (FIX: Dati finti rimossi) */}
        <View style={styles.contentArea}>
          {activeTab === 'giocate' ? (
            <View style={styles.gridContainer}>
              <TouchableOpacity style={[styles.addMediaBtn, { borderColor: theme.border }]}>
                 <Ionicons name="add" size={40} color={theme.subText} />
              </TouchableOpacity>
              
              {/* Nessun post finto: mostra un messaggio se non ci sono post veri in futuro */}
              <View style={{ flex: 1, justifyContent: 'center', paddingLeft: 10 }}>
                <Text style={{ color: theme.subText, fontSize: 13, fontStyle: 'italic' }}>
                  Non hai ancora caricato giocate.
                </Text>
              </View>

            </View>
          ) : (
            <View style={styles.activityList}>
              {/* Nessuna attività finta */}
              <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ color: theme.subText, fontSize: 13, fontStyle: 'italic' }}>
                  Nessuna attività recente da mostrare.
                </Text>
              </View>
            </View>
          )}
        </View>

      </ScrollView>

      {/* MODAL EDITOR AVATAR */}
      <Modal visible={isEditorOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.editorContainer, { backgroundColor: theme.bg }]}>
          <View style={styles.editorHeader}>
            <Text style={[styles.editorTitle, { color: theme.text }]}>SPOGLIATOIO</Text>
            <TouchableOpacity onPress={() => setIsEditorOpen(false)}>
                <Text style={{color: theme.primary, fontWeight:'900', fontSize: 16}}>CHIUDI</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.editorPreview, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <AvatarBuilder config={avatarConfig} size={250} />
          </View>

          <View style={styles.editorTabs}>
             {['kit', 'skin', 'hair'].map((cat) => (
               <TouchableOpacity 
                 key={cat} 
                 style={[styles.tabBtn, activeCategory === cat && { backgroundColor: theme.primary }]}
                 onPress={() => { setActiveCategory(cat as any); Haptics.selectionAsync(); }}
               >
                 <Text style={[styles.tabBtnText, { color: activeCategory === cat ? 'white' : theme.subText }]}>{cat}</Text>
               </TouchableOpacity>
             ))}
          </View>

          <ScrollView horizontal contentContainerStyle={styles.optionsScroll} showsHorizontalScrollIndicator={false}>
            {activeCategory === 'kit' && AVATAR_OPTIONS.kits.map((color) => (
              <TouchableOpacity key={color} style={[styles.optionCircle, { backgroundColor: color, borderWidth: avatarConfig.kitColor === color ? 4 : 0, borderColor: theme.text }]} onPress={() => setAvatarConfig({...avatarConfig, kitColor: color})} />
            ))}
            {activeCategory === 'skin' && AVATAR_OPTIONS.skins.map((color) => (
              <TouchableOpacity key={color} style={[styles.optionCircle, { backgroundColor: `#${color}`, borderWidth: avatarConfig.skinColor === color ? 4 : 0, borderColor: theme.text }]} onPress={() => setAvatarConfig({...avatarConfig, skinColor: color})} />
            ))}
            {activeCategory === 'hair' && AVATAR_OPTIONS.hairStyles.map((style) => (
               <TouchableOpacity 
                key={style.id} 
                style={[styles.optionBox, { borderColor: avatarConfig.hairStyle === style.id ? theme.primary : theme.border, backgroundColor: theme.card }]} 
                onPress={() => setAvatarConfig({...avatarConfig, hairStyle: style.id})}
              >
                <Text style={{ color: theme.text, fontSize: 12, fontWeight: '900' }}>{style.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.text }]} onPress={handleSaveAvatar}>
            <Text style={[styles.saveBtnText, { color: theme.bg }]}>SALVA LOOK</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// --- COMPONENTI HELPERS ---
const StatBox = ({ label, value, theme, color }: any) => (
  <View style={[styles.statBox, { backgroundColor: theme.card, shadowColor: theme.subText }]}>
    <Text style={[styles.statValue, { color: color || theme.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: theme.subText }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  pageTitle: { fontSize: 40, fontWeight: '900', letterSpacing: -1, fontStyle: 'italic' },
  coinBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  coinText: { fontWeight: '800', fontSize: 14 },
  logoutBtn: { padding: 4 },

  cardContainer: { paddingHorizontal: 20, marginTop: 10, marginBottom: 15 },
  cardFrame: { width: '100%', height: 260, borderRadius: 24, padding: 3 },
  cardInner: { flex: 1, borderRadius: 20, overflow: 'hidden', padding: 20, justifyContent: 'flex-end' },
  avatarWrapper: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center' },
  
  cardInfo: { marginTop: 0 },
  playerName: { fontSize: 26, fontWeight: '900', fontStyle: 'italic', lineHeight: 28, flexShrink: 1 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  roleText: { color: 'white', fontWeight: '800', fontSize: 10 },
  editBtn: { position: 'absolute', top: 15, right: 15, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  statBox: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowOffset:{width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statValue: { fontSize: 20, fontWeight: '900', fontStyle: 'italic' },
  statLabel: { fontSize: 9, fontWeight: '800', marginTop: 2 },

  bioContainer: { 
    marginHorizontal: 20, marginBottom: 25, 
    padding: 16, borderRadius: 16, 
    flexDirection: 'row', gap: 12, alignItems: 'flex-start'
  },
  quoteIcon: { marginTop: 2 },
  bioText: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  bioInput: { fontSize: 14, fontWeight: '500', fontStyle: 'italic', lineHeight: 20, padding: 8, borderRadius: 8, minHeight: 60 },

  // TABS (Stile ESATTO richiesto)
  tabsWrapper: { paddingHorizontal: 20, marginBottom: 30 },
  tabContainer: { flexDirection: 'row', height: 46, borderRadius: 12, padding: 4, width: '100%' },
  tabButton: { flex: 1, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '700' },

  contentArea: { paddingHorizontal: 20 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  addMediaBtn: { width: '31%', aspectRatio: 0.8, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },

  activityList: { gap: 10 },

  editorContainer: { flex: 1, padding: 20, paddingTop: 40 },
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  editorTitle: { fontSize: 24, fontWeight: '900', fontStyle: 'italic' },
  editorPreview: { height: 280, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderStyle: 'dashed' },
  editorTabs: { flexDirection: 'row', gap: 10, marginBottom: 20, justifyContent: 'center' },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: 'transparent' },
  tabBtnText: { fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  optionsScroll: { alignItems: 'center', gap: 15, paddingHorizontal: 10, maxHeight: 70 },
  optionCircle: { width: 44, height: 44, borderRadius: 22 },
  optionBox: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, borderWidth: 2 },
  saveBtn: { marginTop: 30, padding: 18, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { fontWeight: '900', fontSize: 18, fontStyle: 'italic', letterSpacing: 1 },
});