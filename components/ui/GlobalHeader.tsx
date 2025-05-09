import { GlobalHeader as DesignSystemGlobalHeader } from '@/components/design-system/navigation';
import React from 'react';

interface GlobalHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  transparent?: boolean;
}

// Use the design system GlobalHeader component
const GlobalHeader: React.FC<GlobalHeaderProps> = (props) => {
  return <DesignSystemGlobalHeader {...props} />;
};

export default GlobalHeader;