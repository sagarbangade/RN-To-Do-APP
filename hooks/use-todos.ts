import { dbService } from '@/services/database';
import { CreateTodoInput, Todo, TodoFilter, UpdateTodoInput } from '@/types/todo';
import { useCallback, useEffect, useState } from 'react';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let result: Todo[];

      // Always load all todos for counts
      const all = await dbService.getAllTodos();
      setAllTodos(all);

      if (searchTerm.trim()) {
        result = await dbService.searchTodos(searchTerm);
      } else {
        result = await dbService.getTodosByFilter(filter);
      }

      setTodos(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm]);

  useEffect(() => {
    const init = async () => {
      try {
        await dbService.initialize();
        await loadTodos();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
      loadTodos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, searchTerm]);

  const createTodo = useCallback(async (input: CreateTodoInput) => {
    try {
      const newTodo = await dbService.createTodo(input);
      await loadTodos();
      return newTodo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
      throw err;
    }
  }, [loadTodos]);

  const updateTodo = useCallback(async (id: number, input: UpdateTodoInput) => {
    try {
      const updated = await dbService.updateTodo(id, input);
      await loadTodos();
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
      throw err;
    }
  }, [loadTodos]);

  const deleteTodo = useCallback(async (id: number) => {
    try {
      await dbService.deleteTodo(id);
      await loadTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
      throw err;
    }
  }, [loadTodos]);

  const toggleTodo = useCallback(async (id: number) => {
    try {
      await dbService.toggleTodoStatus(id);
      await loadTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle todo');
      throw err;
    }
  }, [loadTodos]);

  return {
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
    refresh: loadTodos,
  };
}

