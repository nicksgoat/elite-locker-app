import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ClubServiceTest from '../components/debug/ClubServiceTest';

export default function DebugClubScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ClubServiceTest />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
