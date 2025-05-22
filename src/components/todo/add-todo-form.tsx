"use client";

import type { FC } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle } from "lucide-react";

const formSchema = z.object({
  text: z.string().min(1, "Task description cannot be empty.").max(200, "Task too long."),
});

interface AddTodoFormProps {
  onAddTodo: (text: string) => void;
}

export const AddTodoForm: FC<AddTodoFormProps> = ({ onAddTodo }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddTodo(values.text);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-3 mb-6 p-4 bg-card rounded-lg shadow">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel className="sr-only">New Task</FormLabel>
              <FormControl>
                <Input placeholder="What needs to be done?" {...field} className="text-base"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="shrink-0">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Task
        </Button>
      </form>
    </Form>
  );
};
