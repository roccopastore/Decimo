import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Href, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

interface Match {
  id: string;
  title: string;
  date_time: string;
  location: string;
  format: string;
  price: number;
  match_type: 'singles' | 'teams';
  created_by: string;
  match_participants: { user_id: string }[]; 
}

type TabType = 'singles' | 'teams';

export default function MatchesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // STATI PER I TAB (Singoli vs Squadre)
  const [activeTab, setActiveTab] = useState<TabType>('singles');

  // --- TEMA UNIFICATO ---
  const theme = {
    bg: isDark ? '#0F172A' : '#E2E8F0', 
    text: isDark ? '#F8FAFC' : '#111827', 
    subText: isDark ? '#94A3B8' : '#4B5563', 
    card: isDark ? '#1E293B' : '#FFFFFF', 
    border: isDark ? '#334155' : '#CBD5E1', 
    primary: '#2563EB',
    accent: '#10B981',
    tabContainerBg: isDark ? '#1E293B' : '#D1D5DB', 
    tabActiveBg: isDark ? '#334155' : '#FFFFFF',
  };

  // --- FETCH DELLE PARTITE ---
  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*, match_participants(user_id)')
        .order('date_time', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (error: any) {
      console.error("Errore recupero partite:", error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRefreshing(true);
    fetchMatches();
  };

  const handleTabChange = (tab: TabType) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  // --- CREA UNA PARTITA DI TEST (Intelligente in base al Tab) ---
  const handleCreateMockMatch = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(19, 0, 0, 0);

      const isTeamMatch = activeTab === 'teams';

      const { error } = await supabase.from('matches').insert({
        title: isTeamMatch ? 'Sfida tra Squadre' : 'Calcetto Serale (Misto)',
        date_time: tomorrow.toISOString(),
        location: 'Sporting Club Milano',
        format: '5v5',
        price: 7.0,
        match_type: activeTab, // Salva se è per singoli o squadre
        created_by: user.id
      });

      if (error) throw error;
      
      Alert.alert("Creata!", `Partita per ${isTeamMatch ? 'squadre' : 'singoli'} organizzata con successo.`);
      fetchMatches(); 
    } catch (error: any) {
      Alert.alert("Errore", error.message);
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return d.toLocaleDateString('it-IT', options).toUpperCase().replace(',', ' •');
  };

  // --- LOGICA DI FILTRAGGIO (In base al Tab) ---
  const displayedMatches = matches.filter(match => match.match_type === activeTab);

  // --- RENDER SINGOLA CARD ---
  const renderMatchCard = ({ item }: { item: Match }) => {
    const participantsCount = item.match_participants?.length || 0;
    const maxPlayers = item.format === '5v5' ? 10 : 14; 
    const isFull = participantsCount >= maxPlayers;

    return (
      <TouchableOpacity 
        style={[styles.matchCard, { backgroundColor: theme.card, borderColor: theme.border, borderLeftColor: isFull ? theme.subText : theme.primary }]}
        onPress={() => {
          Haptics.selectionAsync();
          router.push(`/match/${item.id}` as Href); 
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.dateText, { color: theme.primary }]}>
            {formatDate(item.date_time)}
          </Text>
          <View style={[styles.formatBadge, { backgroundColor: theme.bg }]}>
            <Text style={[styles.formatText, { color: theme.text }]}>{item.format}</Text>
          </View>
        </View>

        <Text style={[styles.matchTitle, { color: theme.text }]}>{item.title}</Text>
        
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={14} color={theme.subText} />
          <Text style={[styles.locationText, { color: theme.subText }]}>{item.location}</Text>
        </View>

        <View style={[styles.cardFooter, { borderTopColor: theme.bg }]}>
          <View style={styles.priceRow}>
            <Ionicons name="cash-outline" size={16} color={theme.accent} />
            <Text style={[styles.priceText, { color: theme.text }]}>{item.price}€ / Pz</Text>
          </View>
          
          <View style={[styles.playersBadge, { backgroundColor: isFull ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }]}>
            <Ionicons name={item.match_type === 'teams' ? "shield-half" : "people"} size={14} color={isFull ? '#EF4444' : theme.accent} />
            <Text style={[styles.playersText, { color: isFull ? '#EF4444' : theme.accent }]}>
              {item.match_type === 'teams' ? 'Squadre' : `${participantsCount}/${maxPlayers} Iscritti`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Partite</Text>
        <Text style={[styles.subTitle, { color: theme.subText }]}>Trova il tuo prossimo match</Text>
      </View>

      {/* TABS (Singoli / Squadre) - Stile esatto del Profilo */}
      <View style={styles.tabsWrapper}>
        <View style={[styles.tabContainer, { backgroundColor: theme.tabContainerBg }]}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'singles' && { backgroundColor: theme.tabActiveBg, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }]} 
            onPress={() => handleTabChange('singles')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'singles' ? theme.text : theme.subText }]}>Singoli</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'teams' && { backgroundColor: theme.tabActiveBg, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }]} 
            onPress={() => handleTabChange('teams')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'teams' ? theme.text : theme.subText }]}>Squadre</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LISTA PARTITE (Filtrata) */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedMatches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="football-outline" size={60} color={theme.border} />
              <Text style={[styles.emptyText, { color: theme.subText }]}>
                {activeTab === 'singles' ? 'Nessuna partita per singoli in programma.' : 'Nessuna sfida tra squadre in programma.'}
              </Text>
            </View>
          }
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
  pageTitle: { fontSize: 40, fontWeight: '900', letterSpacing: -1, fontStyle: 'italic' },
  subTitle: { fontSize: 14, fontWeight: '600', marginTop: 2 },

  // TABS
  tabsWrapper: { paddingHorizontal: 20, marginBottom: 20 },
  tabContainer: { flexDirection: 'row', height: 46, borderRadius: 12, padding: 4, width: '100%' },
  tabButton: { flex: 1, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '700' },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 15 },

  // Match Card Style
  matchCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderLeftWidth: 6, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dateText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  formatBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  formatText: { fontSize: 10, fontWeight: '800' },

  matchTitle: { fontSize: 20, fontWeight: '900', fontStyle: 'italic', marginBottom: 6 },
  
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 15 },
  locationText: { fontSize: 13, fontWeight: '600' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  priceText: { fontSize: 14, fontWeight: '800' },
  
  playersBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  playersText: { fontSize: 11, fontWeight: '800' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, gap: 10 },
  emptyText: { fontSize: 14, fontWeight: '600' },

  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  fabText: { color: 'white', fontWeight: '900', fontSize: 14, fontStyle: 'italic', letterSpacing: 1 },
});