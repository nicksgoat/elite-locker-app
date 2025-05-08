import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DateHeaderProps {
  date: string;
}

const DateHeader: React.FC<DateHeaderProps> = ({ date }) => (
  <View style={styles.dateHeaderContainer}>
    <View style={styles.dateHeaderLine} />
    <Text style={styles.dateHeaderText}>{date}</Text>
    <View style={styles.dateHeaderLine} />
  </View>
);

const styles = StyleSheet.create({
  dateHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 8, // Use consistent padding
  },
  dateHeaderText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  dateHeaderLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: 'rgba(142, 142, 147, 0.3)',
  },
});

export default DateHeader; 