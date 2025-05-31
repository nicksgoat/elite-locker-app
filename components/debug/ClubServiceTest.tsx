import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { clubService } from '../../services/clubService';
import { checkSupabaseConnection } from '../../lib/supabase-new';
import { clearCache } from '../../lib/storage';

export default function ClubServiceTest() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    addResult('Testing Supabase connection...');
    
    try {
      const isConnected = await checkSupabaseConnection();
      addResult(`Supabase connected: ${isConnected}`);
    } catch (error) {
      addResult(`Connection error: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const testClubFetching = async () => {
    setIsLoading(true);
    addResult('Testing club fetching...');
    
    try {
      // Clear cache first
      await clearCache();
      addResult('Cache cleared');
      
      // Test getting all clubs
      const allClubs = await clubService.getClubs({ 
        limit: 5, 
        bypassCache: true 
      });
      addResult(`All clubs fetched: ${allClubs?.length || 0} clubs`);
      
      if (allClubs && allClubs.length > 0) {
        addResult(`First club: ${allClubs[0].name} (ID: ${allClubs[0].id})`);
      }
      
      // Test getting user clubs
      try {
        const userClubs = await clubService.getMyClubs({ 
          bypassCache: true 
        });
        addResult(`User clubs fetched: ${userClubs?.length || 0} clubs`);
        
        if (userClubs && userClubs.length > 0) {
          addResult(`First user club: ${userClubs[0].name}`);
        }
      } catch (error) {
        addResult(`User clubs error: ${error.message}`);
      }
      
    } catch (error) {
      addResult(`Club fetching error: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Club Service Test</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={testConnection}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={testClubFetching}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Club Fetching</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>
      
      {isLoading && (
        <Text style={styles.loadingText}>Testing...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    minWidth: 100,
  },
  clearButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    minWidth: 100,
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 15,
  },
  resultText: {
    color: '#FFF',
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  loadingText: {
    color: '#AAA',
    textAlign: 'center',
    marginTop: 10,
  },
});
