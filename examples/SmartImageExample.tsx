import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SmartImage } from '@/components/ui/SmartImage';
import { Ionicons } from '@expo/vector-icons';

/**
 * Example component showing how to use the SmartImage component
 */
export const SmartImageExample: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Local Asset Example</Text>
      <SmartImage
        source="devon_allen/profile.jpg"
        style={styles.image}
        placeholder={
          <View style={[styles.image, styles.placeholder]}>
            <Ionicons name="person" size={40} color="#AAAAAA" />
          </View>
        }
      />
      
      <Text style={styles.title}>Remote URL Example</Text>
      <SmartImage
        source="https://pbs.twimg.com/profile_images/1646276656264916992/1Kl3xbdA_400x400.jpg"
        style={styles.image}
        placeholder={
          <View style={[styles.image, styles.placeholder]}>
            <Ionicons name="person" size={40} color="#AAAAAA" />
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    marginTop: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholder: {
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SmartImageExample;
