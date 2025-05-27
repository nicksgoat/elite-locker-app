import { colors, spacing, typography } from '../../../components/design-system/tokens';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();

  const settingsOptions = [
    {
      title: 'Account',
      icon: 'person-outline' as keyof typeof Ionicons.glyphMap,
      items: [
        { title: 'Profile', route: '../profile' },
        { title: 'Notifications', route: 'notifications' },
        { title: 'Privacy', route: 'privacy' },
      ]
    },
    {
      title: 'App',
      icon: 'settings-outline' as keyof typeof Ionicons.glyphMap,
      items: [
        { title: 'Appearance', route: 'appearance' },
        { title: 'Offline Mode', route: 'offline-settings' },
        { title: 'Units', route: 'units' },
      ]
    },
    {
      title: 'Support',
      icon: 'help-buoy-outline' as keyof typeof Ionicons.glyphMap,
      items: [
        { title: 'Help Center', route: 'help' },
        { title: 'Contact Us', route: 'contact' },
        { title: 'About', route: 'about' },
      ]
    },
    {
      title: 'Developer',
      icon: 'code-outline' as keyof typeof Ionicons.glyphMap,
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
              <Ionicons name={section.icon} size={20} color={colors.dark.brand.primary} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={`item-${sectionIndex}-${itemIndex}`}
                style={styles.settingItem}
                onPress={() => router.push(item.route)}
              >
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.dark.text.secondary} />
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
    backgroundColor: colors.dark.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.spacing.lg,
    padding: spacing.spacing.md,
    backgroundColor: colors.dark.background.card,
    borderRadius: 12,
    marginHorizontal: spacing.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.primary,
    paddingBottom: spacing.spacing.sm,
  },
  sectionTitle: {
    ...typography.textVariants.h3,
    color: colors.dark.text.primary,
    marginLeft: spacing.spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.primary,
  },
  settingTitle: {
    ...typography.textVariants.body,
    color: colors.dark.text.primary,
  },
});
