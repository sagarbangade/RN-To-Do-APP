import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Todo, TodoPriority } from '@/types/todo';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Chip, Divider, Text, useTheme } from 'react-native-paper';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (todo: Todo) => void;
}

const priorityColors: Record<TodoPriority, { light: string; dark: string }> = {
  low: { light: '#4CAF50', dark: '#81C784' },
  medium: { light: '#FF9800', dark: '#FFB74D' },
  high: { light: '#F44336', dark: '#E57373' },
};

export const TodoItem = React.memo(function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: TodoItemProps) {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const isDark = colorScheme === 'dark';
  const priorityColor = priorityColors[todo.priority][isDark ? 'dark' : 'light'];
  const isCompleted = todo.status === 'completed';
  const [expanded, setExpanded] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(todo.id) },
      ]
    );
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr} at ${timeStr}`;
  };

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !isCompleted;
  const dueDateTime = formatDateTime(todo.dueDate);

  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline + '30' },
        isCompleted && styles.completedContainer,
      ]}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => onToggle(todo.id)}
          activeOpacity={0.7}>
          <View
            style={[
              styles.checkbox,
              isCompleted && styles.checkboxChecked,
              { borderColor: priorityColor },
            ]}>
            {isCompleted && (
              <IconSymbol name="checkmark" size={16} color={priorityColor} />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.textContainer}>
          {/* Title */}
          <TouchableOpacity
            onPress={() => onToggle(todo.id)}
            activeOpacity={0.7}
            style={styles.titleContainer}>
            <ThemedText
              style={[
                styles.title,
                isCompleted && styles.completedText,
              ]}>
              {todo.title}
            </ThemedText>
          </TouchableOpacity>

          {/* Meta Information Row */}
          <View style={styles.metaContainer}>
            {todo.category && (
              <Chip
                mode="outlined"
                style={styles.chip}
                textStyle={styles.chipText}>
                {todo.category}
              </Chip>
            )}
            <Chip
              mode="flat"
              style={[styles.chip, { backgroundColor: priorityColor + '20' }]}
              textStyle={[styles.chipText, { color: priorityColor }]}>
              {todo.priority}
            </Chip>
            {todo.dueDate && (
              <View style={[
                styles.dateChip,
                { backgroundColor: theme.colors.surfaceVariant + '80' },
                isOverdue && styles.overdueChip
              ]}>
                <IconSymbol
                  name="calendar"
                  size={14}
                  color={isOverdue ? '#F44336' : theme.colors.onSurfaceVariant}
                />
                <ThemedText
                  style={[
                    styles.dateText,
                    { color: theme.colors.onSurfaceVariant },
                    isOverdue && styles.overdueDate,
                  ]}
                  numberOfLines={1}>
                  {dueDateTime}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Description Accordion at Bottom */}
          {todo.description && (
            <>
              <Divider style={[styles.divider, { backgroundColor: theme.colors.outline + '20' }]} />
              {expanded && (
                <View style={styles.accordionContent}>
                  <Text
                    style={[
                      styles.description,
                      { color: theme.colors.onSurface },
                      isCompleted && styles.completedText,
                    ]}>
                    {todo.description}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(todo)} style={styles.actionButton}>
          <IconSymbol name="pencil" size={18} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
          <IconSymbol name="trash" size={18} color="#F44336" />
        </TouchableOpacity>
        {todo.description && (
          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            style={styles.actionButton}>
            <IconSymbol
              name={expanded ? 'chevron.down' : 'chevron.right'}
              size={18}
              color={Colors[colorScheme ?? 'light'].text}
            />
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  completedContainer: {
    opacity: 0.65,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'transparent',
  },
  textContainer: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    height: 28,
    marginRight: 0,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 6,
    maxWidth: '100%',
    flexShrink: 1,
  },
  overdueChip: {
    backgroundColor: '#FFEBEE',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
    flexShrink: 1,
  },
  overdueDate: {
    color: '#F44336',
    fontWeight: '700',
  },
  divider: {
    marginVertical: 12,
    opacity: 0.2,
  },
  accordionContent: {
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 0,
  },
  description: {
    fontSize: 14,
    opacity: 0.75,
    lineHeight: 22,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
    marginLeft: 12,
    paddingTop: 2,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
});
