import { colors, spacing, typography } from '@/components/design-system/tokens';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();

  const settingsOptions = [
    {
      title: 'Account',
      icon: 'person-outline',
      items: [
        { title: 'Profile', route: '../profile' },
        { title: 'Notifications', route: 'notifications' },
        { title: 'Privacy', route: 'privacy' },
      ]
    },
    {
      title: 'App',
      icon: 'settings-outline',
      items: [
        { title: 'Appearance', route: 'appearance' },
        { title: 'Offline Mode', route: 'offline-settings' },
        { title: 'Units', route: 'units' },
      ]
    },
    {
      title: 'Support',
      icon: 'help-buoy-outline',
      items: [
        { title: 'Help Center', route: 'help' },
        { title: 'Contact Us', route: 'contact' },
        { title: 'About', route: 'about' },
      ]
    },
    {
      title: 'Developer',
      icon: 'code-outline',
      items: [
        { title: 'Database Test', route: 'db' },
      ]
    }
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Settings' }} />

      <ScrollView style={styles.scrollView}>
        {settingsOptions.map((section, sectionIndex) => (
          <View key={`section-${sectionIndex}`} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={section.icon} size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={`item-${sectionIndex}-${itemIndex}`}
                style={styles.settingItem}
                onPress={() => router.push(item.route)}
              >
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingTitle: {
    ...typography.body,
    color: colors.text,
  },
});
