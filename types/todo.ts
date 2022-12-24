export type TodoPriority = 'low' | 'medium' | 'high';
export type TodoStatus = 'pending' | 'completed';

export interface Todo {
  id: number;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  category?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: TodoPriority;
  category?: string;
  dueDate?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  category?: string;
  dueDate?: string;
}

export type TodoFilter = 'all' | 'active' | 'completed';

