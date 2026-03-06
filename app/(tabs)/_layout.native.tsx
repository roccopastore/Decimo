import { NativeTabs } from 'expo-router/unstable-native-tabs';
// Importiamo Icon e Label separatamente come abbiamo visto prima
import { Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Video</Label>
        <Icon sf="video.fill" drawable="videocam" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="matches">
        <Label>Matches</Label>
        <Icon sf="sportscourt.fill" drawable="emoji-events" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="publish">
        <Label>Publish</Label>
        <Icon sf="plus.circle.fill" drawable="add-circle" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="team">
        <Label>Squadra</Label>
        <Icon sf="shield.fill" /> 
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label>Profile</Label>
        <Icon sf="person.crop.circle.fill" drawable="account-circle" />
      </NativeTabs.Trigger>

    </NativeTabs>
  );
}