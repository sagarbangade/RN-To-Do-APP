import { CreateTodoInput, Todo, UpdateTodoInput } from '@/types/todo';
import * as SQLite from 'expo-sqlite';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('todos.db');
      await this.createTables();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        priority TEXT NOT NULL DEFAULT 'medium',
        category TEXT,
        dueDate TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
  }

  async getAllTodos(): Promise<Todo[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<Todo>(
      'SELECT * FROM todos ORDER BY createdAt DESC',
      []
    );
    return result;
  }

  async getTodoById(id: number): Promise<Todo | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<Todo>(
      'SELECT * FROM todos WHERE id = ?',
      [id]
    );
    return result || null;
  }

  async createTodo(input: CreateTodoInput): Promise<Todo> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const todo: Omit<Todo, 'id'> = {
      title: input.title,
      description: input.description || undefined,
      status: 'pending',
      priority: input.priority || 'medium',
      category: input.category || undefined,
      dueDate: input.dueDate || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.db.runAsync(
      `INSERT INTO todos (title, description, status, priority, category, dueDate, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        todo.title,
        todo.description ?? null,
        todo.status,
        todo.priority,
        todo.category ?? null,
        todo.dueDate ?? null,
        todo.createdAt,
        todo.updatedAt,
      ]
    );

    const createdTodo = await this.getTodoById(result.lastInsertRowId);
    if (!createdTodo) throw new Error('Failed to create todo');
    return createdTodo;
  }

  async updateTodo(id: number, input: UpdateTodoInput): Promise<Todo> {
    if (!this.db) throw new Error('Database not initialized');

    const existing = await this.getTodoById(id);
    if (!existing) throw new Error('Todo not found');

    const updates: Record<string, any> = {
      ...input,
      updatedAt: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return existing;
    }

    const setClause = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.keys(updates).map(key => updates[key]);

    await this.db.runAsync(
      `UPDATE todos SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    const updatedTodo = await this.getTodoById(id);
    if (!updatedTodo) throw new Error('Failed to update todo');
    return updatedTodo;
  }

  async deleteTodo(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM todos WHERE id = ?', [id]);
  }

  async toggleTodoStatus(id: number): Promise<Todo> {
    const todo = await this.getTodoById(id);
    if (!todo) throw new Error('Todo not found');

    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    return this.updateTodo(id, { status: newStatus });
  }

  async getTodosByFilter(filter: 'all' | 'active' | 'completed'): Promise<Todo[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM todos';
    const params: any[] = [];
    if (filter === 'active') {
      query += ' WHERE status = ?';
      params.push('pending');
    } else if (filter === 'completed') {
      query += ' WHERE status = ?';
      params.push('completed');
    }
    query += ' ORDER BY createdAt DESC';

    const result = await this.db.getAllAsync<Todo>(query, params);
    return result;
  }

  async searchTodos(searchTerm: string): Promise<Todo[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<Todo>(
      `SELECT * FROM todos 
       WHERE title LIKE ? OR description LIKE ? 
       ORDER BY createdAt DESC`,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );
    return result;
  }
}

export const dbService = new DatabaseService();

