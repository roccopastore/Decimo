import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Usiamo 'screen' per prendere l'altezza fisica completa (inclusa la status bar/notch)
const { height, width } = Dimensions.get('screen');

type VideoPostProps = {
  uri: string;
  isActive: boolean;
  item: {
    id: string;
    username: string;
    description: string;
    likes: string;
    comments: string;
  };
};

export default function VideoPost({ uri, isActive, item }: VideoPostProps) {
  // Configurazione del Player
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = false;
  });

  // Gestione Play/Pause basata sullo scroll
  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls={false}
        contentFit="cover" // Fondamentale per riempire lo schermo
      />

      {/* Sfumatura nera in basso per leggere meglio il testo */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />

      {/* UI OVERLAY */}
      <View style={styles.overlay}>
        
        {/* Colonna Destra (Azioni) */}
        <View style={styles.rightColumn}>
          <ActionButton icon="heart" label={item.likes} color="white" />
          <ActionButton icon="chatbubble-ellipses" label={item.comments} color="white" />
          <ActionButton icon="share-social" label="Share" color="white" />
          <View style={styles.profileCircle}>
             <Ionicons name="add" size={20} color="white" style={styles.addIcon} />
          </View>
        </View>

        {/* Info in Basso */}
        <View style={styles.bottomInfo}>
          <Text style={styles.username}>@{item.username}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.musicRow}>
            <Ionicons name="musical-notes" size={15} color="white" />
            <Text style={styles.musicText}>Suono originale - {item.username}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// Componente helper per i pulsanti
function ActionButton({ icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <TouchableOpacity style={styles.actionButton}>
      <Ionicons name={icon} size={35} color={color} />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
    backgroundColor: 'black',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 300, // Altezza della sfumatura
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    // Padding bottom calcolato per stare SOPRA la Native TabBar
    // Aumentalo se le tab coprono il testo (90-110 è standard)
    paddingBottom: Platform.OS === 'android' ? 80 : 100,
    paddingHorizontal: 15,
  },
  rightColumn: {
    position: 'absolute',
    right: 10,
    bottom: 140, // Sopra le scritte
    alignItems: 'center',
    gap: 20,
  },
  actionButton: { alignItems: 'center' },
  actionLabel: { color: 'white', marginTop: 5, fontSize: 12, fontWeight: '600' },
  profileCircle: {
    width: 45, height: 45, borderRadius: 25, borderWidth: 1, borderColor: 'white',
    backgroundColor: '#333', marginTop: 10, justifyContent: 'center', alignItems: 'center'
  },
  addIcon: { backgroundColor: '#FF0050', borderRadius: 10, position: 'absolute', bottom: -5 },
  bottomInfo: { maxWidth: '80%', marginBottom: 10 },
  username: { color: 'white', fontWeight: 'bold', fontSize: 17, marginBottom: 5 },
  description: { color: 'white', fontSize: 15, marginBottom: 10 },
  musicRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  musicText: { color: 'white', fontSize: 14 },
});