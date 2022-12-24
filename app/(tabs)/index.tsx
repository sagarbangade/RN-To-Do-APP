import { BottomTabs } from '@/components/bottom-tabs';
import { ThemedView } from '@/components/themed-view';
import { TodoForm } from '@/components/todo-form';
import { TodoItem } from '@/components/todo-item';
import { useTodos } from '@/hooks/use-todos';
import { CreateTodoInput, Todo } from '@/types/todo';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Banner,
  Card,
  FAB,
  Searchbar,
  Text,
} from 'react-native-paper';

export default function TodoScreen() {
  const {
    todos,
    allTodos,
    loading,
    error,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    refresh,
  } = useTodos();

  const [formVisible, setFormVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const handleCreateTodo = useCallback(async (input: CreateTodoInput) => {
    await createTodo(input);
  }, [createTodo]);

  const handleUpdateTodo = useCallback(async (input: CreateTodoInput | Partial<Todo>) => {
    if (editingTodo) {
      await updateTodo(editingTodo.id, input);
      setEditingTodo(null);
    }
  }, [editingTodo, updateTodo]);

  const handleEdit = useCallback((todo: Todo) => {
    setEditingTodo(todo);
    setFormVisible(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormVisible(false);
    setEditingTodo(null);
  }, []);

  const handleSubmit = useCallback(async (input: CreateTodoInput | Partial<Todo>) => {
    if (editingTodo) {
      await handleUpdateTodo(input);
    } else {
      await handleCreateTodo(input as CreateTodoInput);
    }
    handleCloseForm();
  }, [editingTodo, handleUpdateTodo, handleCreateTodo, handleCloseForm]);


  const handleToggle = useCallback((id: number) => {
    toggleTodo(id);
  }, [toggleTodo]);

  const handleDelete = useCallback((id: number) => {
    deleteTodo(id);
  }, [deleteTodo]);

  const counts = useMemo(() => {
    const all = allTodos.length;
    const active = allTodos.filter((t) => t.status === 'pending').length;
    const completed = allTodos.filter((t) => t.status === 'completed').length;
    return { all, active, completed };
  }, [allTodos]);

  const renderItem = useCallback(({ item }: { item: Todo }) => (
    <TodoItem
      todo={item}
      onToggle={handleToggle}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
  ), [handleToggle, handleDelete, handleEdit]);

  if (loading && todos.length === 0) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading todos...</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text variant="headlineLarge" style={styles.title}>
            My Todos
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {counts.active} active, {counts.completed} completed
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search todos..."
          onChangeText={setSearchTerm}
          value={searchTerm}
          style={styles.searchbar}
          icon={searchTerm ? undefined : 'magnify'}
          clearIcon={searchTerm ? 'close-circle' : undefined}
          onClearIconPress={() => setSearchTerm('')}
        />
      </View>

      {error && (
        <Banner
          visible={!!error}
          actions={[
            {
              label: 'Dismiss',
              onPress: () => { },
            },
          ]}
          icon="alert-circle"
          style={styles.banner}>
          {error}
        </Banner>
      )}

      <View style={styles.contentWrapper}>
        {todos.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="displaySmall" style={styles.emptyIcon}>
                ✓
              </Text>
              <Text variant="titleLarge" style={styles.emptyText}>
                {searchTerm ? 'No todos found' : 'No todos yet'}
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                {searchTerm
                  ? 'Try a different search term'
                  : 'Tap the + button to create your first todo'}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <FlatList
            data={todos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refresh}
              />
            }
          />
        )}
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setFormVisible(true)}
        label="New Todo"
      />

      <BottomTabs
        activeFilter={filter}
        onFilterChange={setFilter}
        counts={counts}
      />

      <TodoForm
        visible={formVisible}
        todo={editingTodo}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchbar: {
    elevation: 2,
  },
  banner: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  contentWrapper: {
    flex: 1,
    paddingBottom: 80,
  },
  emptyCard: {
    marginHorizontal: 16,
    marginTop: 40,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 64,
    opacity: 0.3,
    marginBottom: 16,
  },
  emptyText: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    opacity: 0.7,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 70,
  },
});
