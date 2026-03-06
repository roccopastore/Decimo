import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
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

// --- TIPI ---
interface Player {
  id: string;
  name: string;
  isMe?: boolean;
}

interface TeamState {
  name: string;
  color: string;
  players: Player[];
}

interface Message {
  id: string;
  user: string;
  text: string;
  time: string;
  isMe: boolean;
}

const COLORS = [
  '#EF4444', '#2563EB', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', 
  '#64748B', '#000000',
];

export default function MatchDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const flatListRef = useRef<FlatList>(null);

  // --- STATI ---
  const [activeTab, setActiveTab] = useState<'field' | 'locker'>('field');
  
  // SQUADRE DEFAULT: ROSSI vs BLU
  const [leftTeam, setLeftTeam] = useState<TeamState>({
    name: 'Rossi',
    color: '#EF4444', 
    players: [{ id: '1', name: 'Marco R.' }, { id: '2', name: 'Luca B.' }],
  });

  const [rightTeam, setRightTeam] = useState<TeamState>({
    name: 'Blu',
    color: '#2563EB', 
    players: [{ id: '4', name: 'Matteo N.' }],
  });

  const [userSide, setUserSide] = useState<'left' | 'right' | null>(null);
  
  // Chat
  const [notice, setNotice] = useState("⚠️ Portare 7€ precisi e documento d'identità. Si gioca anche con pioggia.");
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', user: 'Luca B.', text: 'Ciao ragazzi, confermato per le 19?', time: '10:30', isMe: false },
    { id: '2', user: 'Marco R.', text: 'Sì, campo prenotato!', time: '10:32', isMe: false },
  ]);

  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [editingTeamSide, setEditingTeamSide] = useState<'left' | 'right' | null>(null);

  // --- TEMI ---
  const theme = {
    bg: isDark ? '#0F172A' : '#F1F5F9',
    text: isDark ? '#F8FAFC' : '#0F172A',
    subText: isDark ? '#94A3B8' : '#64748B',
    card: isDark ? '#1E293B' : '#FFFFFF',
    border: isDark ? '#334155' : '#E2E8F0',
    primary: '#2563EB',
    chatBubbleMe: '#2563EB',
    chatBubbleOther: isDark ? '#334155' : '#FFFFFF',
    noticeBg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
    noticeText: isDark ? '#F59E0B' : '#D97706',
    tabContainerBg: isDark ? '#1E293B' : '#E2E8F0',
    tabActiveBg: isDark ? '#334155' : '#FFFFFF',
  };

  // --- LOGICA ---
  const sendMessage = () => {
    if (inputText.trim().length === 0) return;
    Haptics.selectionAsync();
    const newMsg: Message = {
      id: Date.now().toString(),
      user: 'Io',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages([...messages, newMsg]);
    setInputText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleJoin = (side: 'left' | 'right') => {
    Haptics.selectionAsync();
    if (userSide) {
      if (userSide === side) Alert.alert("Già Iscritto", "Sei già in questa squadra!");
      else Alert.alert("Fallo!", "Non puoi cambiare squadra a partita iniziata.");
      return;
    }
    const team = side === 'left' ? leftTeam : rightTeam;
    const setTeam = side === 'left' ? setLeftTeam : setRightTeam;
    if (team.players.length >= 5) {
      Alert.alert("Panchina Corta", "Non ci sono più posti disponibili.");
      return;
    }
    const newPlayer: Player = { id: 'me', name: 'IO (Tu)', isMe: true };
    setTeam({ ...team, players: [...team.players, newPlayer] });
    setUserSide(side);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const openColorPicker = (side: 'left' | 'right') => {
    setEditingTeamSide(side);
    setColorModalVisible(true);
    Haptics.selectionAsync();
  };

  const selectColor = (color: string) => {
    if (editingTeamSide === 'left') setLeftTeam({ ...leftTeam, color });
    else setRightTeam({ ...rightTeam, color });
    setColorModalVisible(false);
  };

  const handleTabChange = (tab: 'field' | 'locker') => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  // --- COMPONENTI INTERNI ---
  
  const renderTeamColumn = (side: 'left' | 'right') => {
    const team = side === 'left' ? leftTeam : rightTeam;
    const setTeam = side === 'left' ? setLeftTeam : setRightTeam;
    const isLeft = side === 'left';
    
    const alignStyle = isLeft ? 'flex-start' : 'flex-end';
    const textDescStyle = isLeft ? 'left' : 'right';
    // Card Style: bordi e radius speculari
    const borderSide = isLeft ? { borderLeftWidth: 4, borderLeftColor: team.color } : { borderRightWidth: 4, borderRightColor: team.color };
    const radiusStyle = isLeft ? { borderTopRightRadius: 12, borderBottomRightRadius: 12 } : { borderTopLeftRadius: 12, borderBottomLeftRadius: 12 };
    // Avatar direction
    const rowDir = isLeft ? 'row' : 'row-reverse';

    return (
      <View style={styles.column}>
        {/* Intestazione Squadra */}
        <View style={[styles.teamHeader, { alignItems: alignStyle }]}>
          <TouchableOpacity onPress={() => openColorPicker(side)} style={[styles.colorBadge, { backgroundColor: team.color, shadowColor: team.color }]}>
            <Ionicons name="shirt" size={14} color="white" />
          </TouchableOpacity>
          <TextInput
            style={[styles.teamNameInput, { color: theme.text, textAlign: textDescStyle }]}
            value={team.name}
            onChangeText={(text) => setTeam({ ...team, name: text })}
            placeholder="NOME TEAM"
            placeholderTextColor={theme.subText}
          />
        </View>

        {/* Lista Giocatori */}
        <View style={styles.playerList}>
          {team.players.map((player) => (
            <View key={player.id} style={[styles.playerCard, { backgroundColor: theme.card, flexDirection: rowDir }, borderSide, radiusStyle]}>
              
              {/* AVATAR ICON */}
              <View style={[styles.miniAvatar, { backgroundColor: theme.bg }]}>
                 <Ionicons name="person" size={16} color={theme.subText} />
              </View>

              <View style={{flex: 1, marginHorizontal: 8}}>
                 <Text style={[styles.playerName, { color: theme.text, textAlign: textDescStyle }]}>
                    {player.name}
                 </Text>
                 <Text style={[styles.playerRole, { color: theme.subText, textAlign: textDescStyle }]}>
                    {player.isMe ? 'CAPITANO' : 'GIOCATORE'}
                 </Text>
              </View>
            </View>
          ))}
          
          {/* Slot Vuoti: ISCRIVITI */}
          {Array.from({ length: 5 - team.players.length }).map((_, i) => (
            <TouchableOpacity 
              key={`empty-${i}`} 
              style={[
                  styles.emptySlot, 
                  { borderColor: theme.border, flexDirection: rowDir }, 
                  isLeft ? {alignSelf: 'flex-start'} : {alignSelf: 'flex-end'}
              ]}
              onPress={() => handleJoin(side)}
            >
              <View style={[styles.miniAvatar, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.subText, borderStyle:'dashed' }]}>
                 <Ionicons name="add" size={16} color={theme.subText} />
              </View>
              <Text style={[styles.emptyText, { color: theme.subText, marginHorizontal: 8 }]}>ISCRIVITI</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Contatore */}
        <Text style={[styles.playerCount, { color: team.color, textAlign: textDescStyle }]}>
          {team.players.length}/5
        </Text>
      </View>
    );
  };

  const renderFieldView = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.splitWrapper}>
        {renderTeamColumn('left')}
        
        {/* Divisore Centrale VS */}
        <View style={styles.centerDivider}>
          <View style={[styles.verticalLine, { backgroundColor: theme.border }]} />
          <View style={[styles.vsBadge, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.vsText, { color: theme.subText }]}>VS</Text>
          </View>
          <View style={[styles.verticalLine, { backgroundColor: theme.border }]} />
        </View>
        
        {renderTeamColumn('right')}
      </View>
    </ScrollView>
  );

  const renderLockerRoomView = () => (
    <View style={styles.chatContainer}>
      <View style={[styles.noticeBoard, { backgroundColor: theme.noticeBg }]}>
        <View style={styles.noticeHeader}>
          <Ionicons name="megaphone" size={16} color={theme.noticeText} />
          <Text style={[styles.noticeTitle, { color: theme.noticeText }]}>MISTER DICE:</Text>
        </View>
        <Text style={[styles.noticeContent, { color: theme.text }]}>{notice}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatList}
        renderItem={({ item }) => (
          <View style={[styles.messageRow, item.isMe ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
            {!item.isMe && (
              <View style={[styles.chatAvatar, { backgroundColor: theme.border }]}>
                <Text style={{fontSize: 10, fontWeight:'900', color: theme.subText}}>{item.user.charAt(0)}</Text>
              </View>
            )}
            <View style={[styles.messageBubble, { backgroundColor: item.isMe ? theme.chatBubbleMe : theme.chatBubbleOther }]}>
              {!item.isMe && <Text style={[styles.msgUser, { color: theme.subText }]}>{item.user}</Text>}
              <Text style={[styles.msgText, { color: item.isMe ? 'white' : theme.text }]}>{item.text}</Text>
              <Text style={[styles.msgTime, { color: item.isMe ? 'rgba(255,255,255,0.7)' : theme.subText }]}>{item.time}</Text>
            </View>
          </View>
        )}
      />

      <View style={[styles.inputBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TextInput 
          style={[styles.inputField, { backgroundColor: theme.bg, color: theme.text }]}
          placeholder="Scrivi nello spogliatoio..."
          placeholderTextColor={theme.subText}
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity onPress={sendMessage} style={[styles.sendButton, { backgroundColor: theme.primary, opacity: inputText ? 1 : 0.5 }]}>
          <Ionicons name="arrow-up" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        
        {/* HEADER: DATA al posto di "Match Day" */}
        <View style={styles.header}>
            <TouchableOpacity 
                style={[styles.backBtn, { borderColor: theme.border }]} 
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={20} color={theme.text} />
            </TouchableOpacity>
            
            <View>
                <Text style={[styles.pageTitle, { color: theme.text }]}>VEN 25 OTT</Text>
                <View style={{flexDirection: 'row', alignItems:'center', gap: 4}}>
                     <Ionicons name="location-sharp" size={10} color={theme.primary} />
                     <Text style={[styles.subTitle, { color: theme.subText }]}>SPORTING CLUB • 19:00</Text>
                </View>
            </View>
        </View>

        {/* TABS STILE RICHIESTO (H46, R12) */}
        <View style={styles.tabsWrapper}>
          <View style={[styles.tabContainer, { backgroundColor: theme.tabContainerBg }]}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'field' && { backgroundColor: theme.tabActiveBg, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }]} 
              onPress={() => handleTabChange('field')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'field' ? theme.text : theme.subText }]}>Campo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'locker' && { backgroundColor: theme.tabActiveBg, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }]} 
              onPress={() => handleTabChange('locker')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'locker' ? theme.text : theme.subText }]}>Spogliatoio</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{flex: 1}}>
             {activeTab === 'field' ? renderFieldView() : renderLockerRoomView()}
        </View>

        {/* MODALE COLORE */}
        <Modal visible={colorModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>MAGLIA SQUADRA</Text>
              <View style={styles.colorGrid}>
                {getAvailableColors().map(color => (
                  <TouchableOpacity 
                    key={color} 
                    style={[styles.colorOption, { backgroundColor: color }]}
                    onPress={() => selectColor(color)}
                  />
                ))}
              </View>
              <TouchableOpacity onPress={() => setColorModalVisible(false)} style={styles.closeButton}>
                <Text style={{ color: theme.subText, fontWeight:'700' }}>ANNULLA</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </KeyboardAvoidingView>
  );

  function getAvailableColors() {
    const opponentColor = editingTeamSide === 'left' ? rightTeam.color : leftTeam.color;
    return COLORS.filter(c => c !== opponentColor);
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header Style
  header: { 
    flexDirection: 'row', alignItems: 'center', gap: 15,
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 
  },
  backBtn: { 
    width: 40, height: 40, borderRadius: 20, borderWidth: 1, 
    alignItems: 'center', justifyContent: 'center' 
  },
  pageTitle: { fontSize: 32, fontWeight: '900', fontStyle: 'italic', lineHeight: 34, textTransform: 'uppercase' },
  subTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },

  // Tabs Style (RICHIESTO)
  tabsWrapper: { paddingHorizontal: 20, marginBottom: 30 },
  tabContainer: { flexDirection: 'row', height: 46, borderRadius: 12, padding: 4, width: '100%' },
  tabButton: { flex: 1, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '700' },

  // Field & Teams
  scrollContent: { paddingVertical: 10 },
  splitWrapper: { flexDirection: 'row', paddingHorizontal: 10 },
  column: { flex: 1 },
  
  // Divider VS
  centerDivider: { width: 30, alignItems: 'center', justifyContent: 'center' },
  verticalLine: { width: 2, flex: 1, opacity: 0.5, borderStyle: 'dashed' }, 
  vsBadge: { width: 32, height: 32, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginVertical: 10, zIndex: 1 },
  vsText: { fontSize: 10, fontWeight: '900' },
  
  teamHeader: { marginBottom: 20, gap: 8, paddingHorizontal: 10 },
  colorBadge: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  teamNameInput: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase', width: '100%', paddingVertical: 0 },
  
  // Player Card Style
  playerList: { gap: 8 },
  playerCard: { 
    padding: 10, alignItems: 'center',
    marginBottom: 4,
    shadowColor: "#000", shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1
  },
  miniAvatar: {
    width: 28, height: 28, borderRadius: 14, 
    alignItems: 'center', justifyContent: 'center'
  },
  playerName: { fontSize: 13, fontWeight: '800' },
  playerRole: { fontSize: 9, fontWeight: '700', marginTop: 2 },
  
  // Empty Slot Style
  emptySlot: { 
    alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 12,
    borderWidth: 1, borderStyle: 'dashed', borderRadius: 8,
    opacity: 0.7, marginTop: 4
  },
  emptyText: { fontSize: 10, fontWeight: '800' },

  playerCount: { marginTop: 15, fontWeight: '900', fontSize: 12, opacity: 0.8, paddingHorizontal: 10 },

  // Locker Room
  chatContainer: { flex: 1 },
  noticeBoard: { margin: 20, padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  noticeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  noticeTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  noticeContent: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  
  chatList: { paddingHorizontal: 20, paddingBottom: 20 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
  chatAvatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  messageBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, maxWidth: '75%' },
  msgUser: { fontSize: 10, fontWeight: '700', marginBottom: 2 },
  msgText: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  msgTime: { fontSize: 9, textAlign: 'right', marginTop: 4, opacity: 0.8 },
  
  inputBar: { flexDirection: 'row', padding: 12, paddingBottom: 30, alignItems: 'center', borderTopWidth: 1, gap: 10 },
  inputField: { flex: 1, height: 44, borderRadius: 22, paddingHorizontal: 15, fontSize: 15, fontWeight: '500' },
  sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', padding: 25, borderRadius: 24, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '900', fontStyle: 'italic', marginBottom: 20 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 25 },
  colorOption: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2 },
  closeButton: { padding: 10 },
});