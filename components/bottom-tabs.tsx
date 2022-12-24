import { TodoFilter } from '@/types/todo';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface BottomTabsProps {
  activeFilter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
  };
}

const tabs: { key: TodoFilter; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'format-list-bulleted' },
  { key: 'active', label: 'Pending', icon: 'clock-outline' },
  { key: 'completed', label: 'Completed', icon: 'check-circle' },
];

export function BottomTabs({ activeFilter, onFilterChange, counts }: BottomTabsProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.key;
        const count = counts[tab.key];

        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              isActive && { backgroundColor: theme.colors.primaryContainer },
            ]}
            onPress={() => onFilterChange(tab.key)}
            activeOpacity={0.7}>
            <Text
              variant="labelMedium"
              style={[
                styles.tabLabel,
                isActive && { color: theme.colors.onPrimaryContainer },
              ]}>
              {tab.label}
            </Text>
            {count > 0 && (
              <View
                style={[
                  styles.badge,
                  isActive
                    ? { backgroundColor: theme.colors.primary }
                    : { backgroundColor: theme.colors.onSurfaceVariant },
                ]}>
                <Text
                  variant="labelSmall"
                  style={[
                    styles.badgeText,
                    isActive && { color: theme.colors.onPrimary },
                  ]}>
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
});

