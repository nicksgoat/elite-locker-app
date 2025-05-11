import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppLayoutProps {
  children: React.ReactNode;
  hideNavBar?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  hideNavBar = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: hideNavBar ? 0 : insets.bottom }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default AppLayout;