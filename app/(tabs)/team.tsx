import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- TIPI ---
interface Team {
  id: string;
  name: string;
  shieldColor: string;
  location: string;
  membersCount: number;
}

interface PublicTeam extends Team {
  seekingRole: string;
  level: string;
}

interface MyTeam extends Team {
  myRole: 'Capitano' | 'Giocatore';
  nextMatch?: string;
}

// --- DATI MOCK ---
const PUBLIC_TEAMS: PublicTeam[] = [
  { id: 'p1', name: 'Real Milano', shieldColor: '#E02424', location: 'Milano Nord', membersCount: 4, seekingRole: 'Portiere', level: 'Medio' },
  { id: 'p2', name: 'Atletico Barona', shieldColor: '#10B981', location: 'Barona', membersCount: 6, seekingRole: 'Attaccante', level: 'Pro' },
  { id: 'p3', name: 'I Leoni', shieldColor: '#F59E0B', location: 'Centro Storico', membersCount: 3, seekingRole: 'Difensore', level: 'Amatoriale' },
  { id: 'p4', name: 'Black Mamba', shieldColor: '#111827', location: 'Sesto S.G.', membersCount: 4, seekingRole: 'Jolly', level: 'Medio' },
];

const MY_TEAMS: MyTeam[] = [
  { id: 'm1', name: 'Birra Real', shieldColor: '#3B82F6', location: 'Sporting Club', membersCount: 7, myRole: 'Capitano', nextMatch: 'Domani, 21:00' },
  { id: 'm2', name: 'Old Stars', shieldColor: '#8B5CF6', location: 'Vismara', membersCount: 12, myRole: 'Giocatore' },
];

export default function TeamsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [activeTab, setActiveTab] = useState<'market' | 'my_teams'>('market');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  // --- TEMI ---
  const theme = {
    bg: isDark ? '#0F172A' : '#F1F5F9',
    text: isDark ? '#F8FAFC' : '#0F172A',
    subText: isDark ? '#94A3B8' : '#64748B',
    card: isDark ? '#1E293B' : '#FFFFFF',
    border: isDark ? '#334155' : '#E2E8F0',
    primary: '#2563EB',
    tabContainerBg: isDark ? '#1E293B' : '#E2E8F0',
    tabActiveBg: isDark ? '#334155' : '#FFFFFF',
    shadow: isDark ? '#000000' : '#64748B',
  };

  // --- HANDLERS ---
  const handleTabChange = (tab: 'market' | 'my_teams') => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  const handleCreateTeam = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    alert(`Squadra "${newTeamName}" creata!`);
    setShowCreateModal(false);
    setNewTeamName('');
  };

  // --- COMPONENTI UI ---

  const renderShield = (color: string, size = 48) => (
    <View style={{ 
      width: size, height: size, borderRadius: size/3, backgroundColor: color, 
      alignItems: 'center', justifyContent: 'center',
      shadowColor: color, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: {width: 0, height: 4}, elevation: 4
    }}>
      <Ionicons name="shield" size={size * 0.5} color="rgba(255,255,255,0.9)" />
    </View>
  );

  const renderBadge = (text: string, color: string) => (
    <View style={{ backgroundColor: color + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: color + '30' }}>
      <Text style={{ color: color, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>{text}</Text>
    </View>
  );

  // LISTA 1: MERCATO
  const renderMarketList = () => (
    <View style={styles.listContainer}>
      {PUBLIC_TEAMS.map((team) => (
        <TouchableOpacity 
          key={team.id} 
          style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow, borderLeftColor: team.shieldColor }]} 
          activeOpacity={0.85}
        >
          {/* Watermark di sfondo */}
          <View style={styles.watermarkContainer}>
            <Ionicons name="shield" size={120} color={team.shieldColor} style={{ opacity: 0.05, transform: [{rotate: '-15deg'}] }} />
          </View>

          {/* Left: Shield */}
          <View style={styles.cardLeft}>
            {renderShield(team.shieldColor)}
          </View>
          
          {/* Center: Info */}
          <View style={styles.cardCenter}>
            <Text style={[styles.teamName, { color: theme.text }]}>{team.name}</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
              <Ionicons name="location-sharp" size={12} color={theme.subText} />
              <Text style={[styles.teamMeta, { color: theme.subText }]}>{team.location}</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 6 }}>
              {renderBadge(team.seekingRole, team.shieldColor)}
              {renderBadge(team.level, theme.subText)}
            </View>
          </View>

          {/* Right: Stats & Action */}
          <View style={styles.cardRight}>
            <Text style={[styles.bigNumber, { color: theme.text }]}>{team.membersCount}<Text style={{fontSize: 12, color: theme.subText, fontWeight:'600'}}>/10</Text></Text>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.text }]}>
              <Ionicons name="add" size={16} color={theme.card} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  // LISTA 2: LE MIE SQUADRE
  const renderMyTeamsList = () => (
    <View style={styles.listContainer}>
      
      {/* Bottone Crea Nuova */}
      <TouchableOpacity 
        style={[styles.createCard, { borderColor: theme.border }]}
        onPress={() => setShowCreateModal(true)}
      >
        <View style={[styles.dashedCircle, { borderColor: theme.primary }]}>
            <Ionicons name="add" size={28} color={theme.primary} />
        </View>
        <Text style={[styles.createText, { color: theme.text }]}>Fonda un nuovo Club</Text>
      </TouchableOpacity>

      {MY_TEAMS.map((team) => (
        <TouchableOpacity 
            key={team.id} 
            style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow, borderLeftColor: team.shieldColor }]} 
            activeOpacity={0.8}
        >
           {/* Watermark */}
           <View style={styles.watermarkContainer}>
            <Ionicons name="football" size={100} color={team.shieldColor} style={{ opacity: 0.05, right: -20 }} />
          </View>

          <View style={styles.cardLeft}>
            {renderShield(team.shieldColor)}
            {team.myRole === 'Capitano' && (
                <View style={[styles.captainBadge, { borderColor: theme.card }]}>
                  <Text style={styles.captainText}>C</Text>
                </View>
            )}
          </View>
          
          <View style={styles.cardCenter}>
            <Text style={[styles.teamName, { color: theme.text }]}>{team.name}</Text>
            <Text style={[styles.teamMeta, { color: theme.subText }]}>{team.membersCount} Convocati</Text>
            
            {team.nextMatch ? (
               <View style={styles.matchAlert}>
                  <Ionicons name="time" size={12} color="#fff" />
                  <Text style={styles.matchAlertText}>{team.nextMatch}</Text>
               </View>
            ) : (
                <Text style={{fontSize: 11, color: theme.subText, marginTop: 4, fontStyle: 'italic'}}>Nessuna partita in programma</Text>
            )}
          </View>

          <View style={{ justifyContent: 'center' }}>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} style={{ opacity: 0.5 }} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER MODIFICATO */}
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: theme.text }]}>Squadre</Text>
        </View>

        {/* TAB SWITCHER MODIFICATO */}
        <View style={styles.tabsWrapper}>
          <View style={[styles.tabContainer, { backgroundColor: theme.tabContainerBg }]}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'market' && { backgroundColor: theme.tabActiveBg, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }]} 
              onPress={() => handleTabChange('market')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'market' ? theme.text : theme.subText }]}>Mercato</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'my_teams' && { backgroundColor: theme.tabActiveBg, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }]} 
              onPress={() => handleTabChange('my_teams')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'my_teams' ? theme.text : theme.subText }]}>Le mie squadre</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CONTENT */}
        {activeTab === 'market' ? renderMarketList() : renderMyTeamsList()}

      </ScrollView>

      {/* MODALE */}
      <Modal visible={showCreateModal} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
             <Text style={[styles.modalTitle, { color: theme.text }]}>NUOVA SQUADRA</Text>
          </View>
          
          <TextInput 
            style={[styles.input, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
            placeholder="Nome del Club (es. Real Milano)"
            placeholderTextColor={theme.subText}
            value={newTeamName}
            onChangeText={setNewTeamName}
            autoFocus
          />

          <TouchableOpacity style={[styles.createBtn, { backgroundColor: theme.primary }]} onPress={handleCreateTeam}>
            <Text style={styles.createBtnText}>FONDA SQUADRA</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowCreateModal(false)} style={{ marginTop: 20 }}>
            <Text style={{ color: theme.subText, fontSize: 16, fontWeight: '600' }}>Annulla</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  
  // Header semplificato
  header: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 20 },
  pageTitle: { fontSize: 40, fontWeight: '900', letterSpacing: -1, fontStyle: 'italic' },

  // TABS
  tabsWrapper: { paddingHorizontal: 20, marginBottom: 25 },
  tabContainer: { flexDirection: 'row', height: 46, borderRadius: 12, padding: 4, width: '100%' },
  tabButton: { flex: 1, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '700' },

  // LIST & CARDS
  listContainer: { paddingHorizontal: 20, gap: 16 },
  
  card: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 12,
    borderLeftWidth: 6,
    overflow: 'hidden',
    // FIX: Altezza minima per evitare che la card collassi
    minHeight: 90,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
  },
  watermarkContainer: {
    position: 'absolute', right: -20, bottom: -30, zIndex: -1,
  },

  cardLeft: { marginRight: 16 },
  cardCenter: { flex: 1, justifyContent: 'center' }, // Centrato verticalmente
  cardRight: { alignItems: 'flex-end', justifyContent: 'space-between', paddingVertical: 4 },
  
  teamName: { fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -0.5, marginBottom: 4 },
  teamMeta: { fontSize: 13, fontWeight: '500' },
  
  bigNumber: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  actionBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8 },

  // My Teams extras
  captainBadge: { 
    position: 'absolute', bottom: -4, right: -4, 
    width: 20, height: 20, borderRadius: 10, 
    backgroundColor: '#FFD700', borderWidth: 2, 
    alignItems: 'center', justifyContent: 'center' 
  },
  captainText: { fontSize: 10, fontWeight: '900', color: 'black' },
  
  matchAlert: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, 
    marginTop: 8, backgroundColor: '#10B981', alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4
  },
  matchAlertText: { fontSize: 11, fontWeight: '700', color: 'white' },

  // Create Card
  createCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 15,
    padding: 24, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed',
    marginBottom: 10, opacity: 0.7
  },
  dashedCircle: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center'
  },
  createText: { fontSize: 16, fontWeight: '800', textTransform: 'uppercase' },

  // MODAL
  modalContainer: { flex: 1, padding: 30, alignItems: 'center', paddingTop: 60 },
  modalHeader: { marginBottom: 30, borderBottomWidth: 4, borderBottomColor: '#FFD700', paddingBottom: 10 },
  modalTitle: { fontSize: 28, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
  input: { width: '100%', height: 56, borderRadius: 12, paddingHorizontal: 15, fontSize: 18, fontWeight: '600', borderWidth: 2, marginBottom: 20 },
  createBtn: { width: '100%', height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: {width:0, height:4} },
  createBtnText: { color: 'white', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
});