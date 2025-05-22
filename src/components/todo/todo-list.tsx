
"use client";

import type { FC } from 'react';
import type { Todo } from "./types";
import { TodoItem } from "./todo-item";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TodoListProps {
  todos: Todo[];
  onToggleComplete: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onEditTodo: (todo: Todo) => void;
}

export const TodoList: FC<TodoListProps> = ({ todos, onToggleComplete, onDeleteTodo, onEditTodo }) => {
  if (todos.length === 0) {
    return (
      <Card className="mt-6 text-center shadow">
        <CardHeader>
          <CardTitle>All Clear!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You have no tasks. Add some to get started!</p>
          {/* Image removed as per user request */}
        </CardContent>
      </Card>
    );
  }

  const pendingTasks = todos.filter(todo => !todo.completed);
  const completedTasks = todos.filter(todo => todo.completed);

  return (
    <div className="mt-6 space-y-6">
      {pendingTasks.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">Pending Tasks ({pendingTasks.length})</h2>
          <ScrollArea className="h-[calc(100vh_/_3)] pr-3"> {/* Max height relative to viewport */}
            {pendingTasks.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggleComplete={onToggleComplete}
                onDeleteTodo={onDeleteTodo}
                onEditTodo={onEditTodo}
              />
            ))}
          </ScrollArea>
        </section>
      )}

      {completedTasks.length > 0 && (
         <section>
          <h2 className="text-xl font-semibold mb-3 text-green-600">Completed Tasks ({completedTasks.length})</h2>
          <ScrollArea className="h-[calc(100vh_/_4)] pr-3"> {/* Max height relative to viewport */}
            {completedTasks.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggleComplete={onToggleComplete}
                onDeleteTodo={onDeleteTodo}
                onEditTodo={onEditTodo}
              />
            ))}
          </ScrollArea>
        </section>
      )}
    </div>
  );
};
