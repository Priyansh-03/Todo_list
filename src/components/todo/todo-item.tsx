"use client";

import type { FC } from 'react';
import type { Todo } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FilePenLine, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onEditTodo: (todo: Todo) => void;
}

export const TodoItem: FC<TodoItemProps> = ({ todo, onToggleComplete, onDeleteTodo, onEditTodo }) => {
  return (
    <Card className={cn("mb-3 transition-all duration-300 ease-in-out hover:shadow-lg", todo.completed ? "bg-muted/50" : "bg-card")}>
      <CardContent className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <Checkbox
            id={`todo-${todo.id}`}
            checked={todo.completed}
            onCheckedChange={() => onToggleComplete(todo.id)}
            aria-label={todo.completed ? "Mark task as incomplete" : "Mark task as complete"}
          />
          <label
            htmlFor={`todo-${todo.id}`}
            className={cn(
              "text-base font-medium cursor-pointer break-words w-full",
              todo.completed ? "line-through text-muted-foreground" : "text-card-foreground"
            )}
          >
            {todo.text}
          </label>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEditTodo(todo)}
            aria-label="Edit task"
            className="text-foreground/70 hover:text-primary"
            disabled={todo.completed}
          >
            <FilePenLine className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteTodo(todo.id)}
            aria-label="Delete task"
            className="text-foreground/70 hover:text-destructive"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
