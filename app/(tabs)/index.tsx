import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import VideoPost from '../../components/VideoPost';

const { height } = Dimensions.get('screen');

// Dati Mock (Video verticali di esempio)
const VIDEOS = [
  {
    id: '1',
    uri: '://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    username: 'travel_lover',
    description: 'Viaggio incredibile nelle montagne! 🏔️ #travel #nature',
    likes: '1.2M',
    comments: '4050'
  },
  {
    id: '2',
    uri: 'ommondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    username: 'tech_guru',
    description: 'Recensione veloce del nuovo setup! 💻 #setup #gaming',
    likes: '850k',
    comments: '200'
  },
  {
    id: '3',
    uri: 'https://.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    username: 'movie_clips',
    description: 'Animazione 3D open source classica 🐘',
    likes: '45k',
    comments: '120'
  },
];

export default function VideoFeed() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Ottimizzazione: useCallback per evitare re-render inutili
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // Il video cambia quando è visibile al 50%
  }).current;

  return (
    <View style={styles.container}>
      {/* 1. Nascondiamo Header e rendiamo Status Bar trasparente */}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <FlatList
        data={VIDEOS}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <VideoPost 
            uri={item.uri} 
            isActive={index === activeIndex} 
            item={item} 
          />
        )}
        
        // 2. Configurazione Paging Verticale (Style TikTok)
        pagingEnabled
        snapToInterval={height} // Forza lo snap all'altezza esatta dello schermo
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        
        // 3. Gestione Viewability
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        
        // 4. Disabilita gli inset automatici di iOS (Rimuove le bande bianche)
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        
        // 5. Ottimizzazioni memoria
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});