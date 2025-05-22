export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // Store as ISO string for easier serialization
}
