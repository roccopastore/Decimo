import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
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

type PublishTab = 'media' | 'match';
type MatchFormat = 'Calcio a 5' | 'Calcio a 7' | 'Calcio a 8' | 'Calcio a 11';
type MatchMode = 'individual' | 'team';

export default function PublishScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // --- STATO ---
  const [activeTab, setActiveTab] = useState<PublishTab>('match'); // Default su match come richiesto
  const [matchMode, setMatchMode] = useState<MatchMode>('individual');
  const [matchFormat, setMatchFormat] = useState<MatchFormat>('Calcio a 5');
  const [isPublic, setIsPublic] = useState(true);
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [price, setPrice] = useState(''); 
  const [searchQuery, setSearchQuery] = useState('');
  
  // Squadre (Database Mock)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [myTeams, setMyTeams] = useState([
    { id: 't1', name: 'Real Madrink', initials: 'RM' },
    { id: 't2', name: 'Deportivo la Carogna', initials: 'DC' }
  ]);

  // Modali
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const theme = {
    bg: isDark ? '#0F172A' : '#F1F5F9',
    text: isDark ? '#F8FAFC' : '#0F172A',
    subText: isDark ? '#94A3B8' : '#64748B',
    card: isDark ? '#1E293B' : '#FFFFFF',
    border: isDark ? '#334155' : '#E2E8F0',
    primary: '#2563EB',
    accent: '#F43F5E',
    success: '#10B981',
  };

  // --- FUNZIONI CORRETTE ---
  
  const getFormatColor = (fmt: MatchFormat) => {
    switch (fmt) {
      case 'Calcio a 5': return '#10B981';
      case 'Calcio a 7': return '#F59E0B';
      case 'Calcio a 8': return '#8B5CF6';
      case 'Calcio a 11': return '#F97316';
      default: return theme.primary;
    }
  };

  // QUESTA È LA FUNZIONE CHE MANCAVA E CAUSAVA L'ERRORE
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handlePublish = () => {
    if (activeTab === 'match') {
      if (!location) return Alert.alert("Errore", "Seleziona un campo.");
      if (matchMode === 'team' && !selectedTeamId) return Alert.alert("Errore", "Seleziona la squadra da iscrivere.");
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Log per debug database
    console.log("CREAZIONE PARTITA:", {
      format: matchFormat,
      mode: matchMode,
      teamId: selectedTeamId,
      location,
      date: date.toISOString(),
      price: price || "0",
      is_public: isPublic,
      autoEnroll: true
    });

    Alert.alert("Perfetto!", "Partita pubblicata con successo.", [
      { text: "Vai ai Match", onPress: () => router.push('/matches') }
    ]);
  };

  const ALL_LOCATIONS = ['Centro Sportivo Brera', 'Campi San Siro', 'Palauno Milano', 'Arena Civica', 'Sporting Club Milano'];
  const filteredLocations = ALL_LOCATIONS.filter(l => l.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: theme.text }]}>
            {activeTab === 'media' ? 'Nuovo Video' : 'Nuovo Match'}
          </Text>
        </View>

        {/* TAB SELECTOR */}
        <View style={styles.tabsWrapper}>
          <View style={[styles.tabContainer, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'media' && { backgroundColor: theme.card }]} 
              onPress={() => { Haptics.selectionAsync(); setActiveTab('media'); }}
            >
              <Text style={{ color: activeTab === 'media' ? theme.text : theme.subText, fontWeight: '700' }}>Media</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'match' && { backgroundColor: theme.card }]} 
              onPress={() => { Haptics.selectionAsync(); setActiveTab('match'); }}
            >
              <Text style={{ color: activeTab === 'match' ? theme.text : theme.subText, fontWeight: '700' }}>Organizza</Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === 'match' ? (
          <View style={styles.formContainer}>
            
            {/* TIPO SFIDA */}
            <View style={styles.row}>
              <TouchableOpacity 
                onPress={() => setMatchMode('individual')} 
                style={[styles.modeBtn, { backgroundColor: matchMode === 'individual' ? theme.primary : theme.card }]}
              >
                <Text style={styles.btnText}>GIOCATORI</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setMatchMode('team')} 
                style={[styles.modeBtn, { backgroundColor: matchMode === 'team' ? theme.accent : theme.card }]}
              >
                <Text style={styles.btnText}>SQUADRE</Text>
              </TouchableOpacity>
            </View>

            {/* SELEZIONE SQUADRA SE MODE TEAM */}
            {matchMode === 'team' && (
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.label}>ISCRIVI LA TUA SQUADRA</Text>
                {myTeams.map(team => (
                  <TouchableOpacity 
                    key={team.id}
                    onPress={() => setSelectedTeamId(team.id)}
                    style={[styles.card, { borderLeftColor: theme.accent, opacity: selectedTeamId === team.id ? 1 : 0.6 }]}
                  >
                    <Text style={{ color: theme.text, fontWeight: '700', flex: 1 }}>{team.name}</Text>
                    {selectedTeamId === team.id && <Ionicons name="checkmark-circle" size={22} color={theme.accent} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* FORMATO MATCH COLORATO */}
            <Text style={styles.label}>FORMATO</Text>
            <View style={styles.formatGrid}>
              {(['Calcio a 5', 'Calcio a 7', 'Calcio a 8', 'Calcio a 11'] as MatchFormat[]).map((fmt) => {
                const color = getFormatColor(fmt);
                const isSelected = matchFormat === fmt;
                return (
                  <TouchableOpacity 
                    key={fmt} 
                    onPress={() => setMatchFormat(fmt)}
                    style={[styles.formatBtn, { backgroundColor: isSelected ? color : theme.card, borderColor: color, borderWidth: 2 }]}
                  >
                    <Text style={{ color: isSelected ? 'white' : theme.text, fontWeight: '900' }}>{fmt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* DETTAGLI CARDS */}
            <Text style={styles.label}>DETTAGLI</Text>
            
            <TouchableOpacity style={[styles.card, { borderLeftColor: theme.primary }]} onPress={() => setShowLocationModal(true)}>
              <Ionicons name="location" size={20} color={theme.primary} />
              <View style={{ marginLeft: 12 }}><Text style={styles.miniLabel}>CAMPO</Text><Text style={{ color: theme.text, fontWeight: '700' }}>{location || "Scegli dove giocare"}</Text></View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, { borderLeftColor: theme.accent }]} onPress={() => setShowPicker(true)}>
              <Ionicons name="calendar" size={20} color={theme.accent} />
              <View style={{ marginLeft: 12 }}><Text style={styles.miniLabel}>DATA E ORA</Text><Text style={{ color: theme.text, fontWeight: '700' }}>{date.toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).toUpperCase()}</Text></View>
            </TouchableOpacity>

            <View style={[styles.card, { borderLeftColor: theme.success }]}>
              <Ionicons name="cash" size={20} color={theme.success} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.miniLabel}>PREZZO A TESTA</Text>
                <TextInput 
                  placeholder="0.00" 
                  placeholderTextColor={theme.subText}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                  style={{ color: theme.text, fontWeight: '700', fontSize: 18, padding: 0 }}
                />
              </View>
            </View>

            {/* PRIVACY */}
            <TouchableOpacity 
              style={[styles.privacyBox, { borderColor: isPublic ? theme.success : theme.border }]} 
              onPress={() => setIsPublic(!isPublic)}
            >
              <View>
                <Text style={{ color: theme.text, fontWeight: '800' }}>{isPublic ? "PARTITA PUBBLICA" : "PARTITA PRIVATA"}</Text>
                <Text style={{ color: theme.subText, fontSize: 12 }}>{isPublic ? "Tutti possono vederla" : "Solo tramite invito"}</Text>
              </View>
              <Ionicons name={isPublic ? "eye" : "eye-off"} size={24} color={isPublic ? theme.success : theme.subText} />
            </TouchableOpacity>

          </View>
        ) : (
          <View style={styles.formContainer}>
             <TouchableOpacity style={[styles.uploadBox, { borderColor: theme.border, backgroundColor: theme.card }]}>
                <Ionicons name="videocam" size={40} color={theme.primary} />
                <Text style={{color: theme.text, fontWeight: '800', marginTop: 10}}>CARICA GIOCATA</Text>
             </TouchableOpacity>
          </View>
        )}

        <View style={{ padding: 20 }}>
          <TouchableOpacity style={[styles.mainBtn, { backgroundColor: theme.primary }]} onPress={handlePublish}>
            <Text style={styles.mainBtnText}>CREA PARTITA</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* DATE PICKER MODALE */}
      {showPicker && (
        <Modal transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.pickerContainer, { backgroundColor: theme.card }]}>
              <Text style={{color: theme.text, textAlign: 'center', fontWeight: '800', marginBottom: 10}}>SELEZIONA ORARIO</Text>
              <DateTimePicker 
                value={date} 
                mode="datetime" 
                display="spinner" 
                onChange={onDateChange}
                textColor={isDark ? 'white' : 'black'} 
              />
              <TouchableOpacity 
                style={[styles.mainBtn, { backgroundColor: theme.primary, marginTop: 10 }]} 
                onPress={() => setShowPicker(false)}
              >
                <Text style={styles.mainBtnText}>CONFERMA</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* SEARCH LOCATION MODALE */}
      <Modal visible={showLocationModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
          <View style={styles.searchHeader}>
            <Ionicons name="search" size={20} color={theme.subText} />
            <TextInput 
              placeholder="Cerca centro sportivo..." 
              placeholderTextColor={theme.subText}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => setShowLocationModal(false)}>
              <Text style={{ color: theme.primary, fontWeight: '700' }}>Annulla</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredLocations}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.locationItem, { borderBottomColor: theme.border }]} 
                onPress={() => { setLocation(item); setShowLocationModal(false); }}
              >
                <Ionicons name="map-outline" size={20} color={theme.subText} style={{marginRight: 10}} />
                <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  header: { padding: 20 },
  pageTitle: { fontSize: 40, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
  tabsWrapper: { paddingHorizontal: 20, marginBottom: 25 },
  tabContainer: { flexDirection: 'row', height: 48, borderRadius: 14, padding: 4 },
  tabButton: { flex: 1, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  formContainer: { paddingHorizontal: 20 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  modeBtn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '900' },
  label: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  formatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  formatBtn: { width: '48%', padding: 18, borderRadius: 16, alignItems: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 15, backgroundColor: '#FFF', marginBottom: 12, borderLeftWidth: 6, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  miniLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', marginBottom: 2 },
  privacyBox: { padding: 20, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  mainBtn: { height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  mainBtnText: { color: 'white', fontSize: 20, fontWeight: '900', fontStyle: 'italic' },
  uploadBox: { height: 180, borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  pickerContainer: { padding: 20, borderRadius: 25 },
  searchHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 10 },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '600' },
  locationItem: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1 }
});