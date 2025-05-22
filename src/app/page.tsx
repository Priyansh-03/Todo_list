
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Todo } from '@/components/todo/types';
import { AppHeader } from '@/components/layout/app-header';
import { AddTodoForm } from '@/components/todo/add-todo-form';
import { TodoList } from '@/components/todo/todo-list';
import { EditTodoDialog } from '@/components/todo/edit-todo-dialog';
import { useToast } from '@/hooks/use-toast';
import { summarizePendingTodos } from '@/ai/flows/summarize-pending-todos';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

type MoleState = 'hidden' | 'visible' | 'whacked';
interface Mole {
  id: number;
  state: MoleState;
}

const patienceQuotes = [
  "Patience is not the ability to wait, but the ability to keep a good attitude while waiting.",
  "The two most powerful warriors are patience and time.",
  "Patience is bitter, but its fruit is sweet.",
  "Adopt the pace of nature: her secret is patience.",
  "One moment of patience may ward off great disaster. One moment of impatience may ruin a whole life.",
  "All great achievements require time and patience.",
  "Patience is the calm acceptance that things can happen in a different order than the one you have in mind.",
  "He that can have patience can have what he will.",
  "Our patience will achieve more than our force.",
  "With love and patience, nothing is impossible."
];

const QUOTE_CHANGE_INTERVAL = 7000; // 7 seconds
const MOLE_POP_MIN_INTERVAL = 1200; // 1.2 seconds
const MOLE_POP_RANDOM_INTERVAL = 800; // up to 0.8 seconds additional
const MOLE_VISIBLE_MIN_DURATION = 1500; // 1.5 seconds
const MOLE_VISIBLE_RANDOM_DURATION = 1000; // up to 1 second additional

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingTodos, setIsLoadingTodos] = useState<boolean>(true);
  const { toast } = useToast();

  // Whack-a-Mole game state
  const [moles, setMoles] = useState<Mole[]>(
    Array.from({ length: 9 }, (_, i) => ({ id: i, state: 'hidden' as MoleState }))
  );
  const [whackScore, setWhackScore] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [motivationalQuote, setMotivationalQuote] = useState<string>("");


  useEffect(() => {
    setIsLoadingTodos(true);
    const todosCol = collection(db, 'todos');
    const q = query(todosCol, orderBy('completed', 'asc'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedTodos = querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          text: data.text,
          completed: data.completed,
          createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        } as Todo;
      });
      setTodos(fetchedTodos);
      setIsLoadingTodos(false);
    }, (error) => {
      console.error("Error fetching todos: ", error);
      toast({ title: "Error", description: "Could not fetch tasks from Firestore.", variant: "destructive" });
      setIsLoadingTodos(false);
    });

    return () => unsubscribe();
  }, [toast]);
  
  const selectRandomQuote = useCallback(() => {
    setMotivationalQuote(patienceQuotes[Math.floor(Math.random() * patienceQuotes.length)]);
  }, []);

  // Whack-a-Mole game logic & Quote handling
  const startGame = useCallback(() => {
    setMoles(Array.from({ length: 9 }, (_, i) => ({ id: i, state: 'hidden' as MoleState })));
    setWhackScore(0);
    setIsGameActive(true);
    selectRandomQuote();
  }, [selectRandomQuote]);

  const handleWhack = (id: number) => {
    if (!isGameActive) return;

    setMoles(prevMoles =>
      prevMoles.map(mole => {
        if (mole.id === id) {
          if (mole.state === 'visible') {
            setWhackScore(prevScore => prevScore + 10);
            return { ...mole, state: 'whacked' as MoleState };
          } else if (mole.state === 'hidden') {
            setWhackScore(prevScore => prevScore - 2); // Penalty for clicking empty hole
          }
        }
        return mole;
      })
    );
    
    // Briefly show "whacked" state then hide
    setTimeout(() => {
        setMoles(prevMoles => prevMoles.map(mole => mole.id === id && mole.state === 'whacked' ? {...mole, state: 'hidden' as MoleState} : mole));
    }, 300);
  };

  // Start/stop game based on loading state
  useEffect(() => {
    if (isLoadingTodos) {
      startGame();
    } else {
      setIsGameActive(false);
    }
  }, [isLoadingTodos, startGame]);

  // Quote changing interval
  useEffect(() => {
    let quoteInterval: NodeJS.Timeout | undefined;
    if (isLoadingTodos) {
      quoteInterval = setInterval(() => {
        selectRandomQuote();
      }, QUOTE_CHANGE_INTERVAL);
    }
    return () => {
      if (quoteInterval) clearInterval(quoteInterval);
    };
  }, [isLoadingTodos, selectRandomQuote]);


  // Game loop for showing moles
  useEffect(() => {
    let moleTimer: NodeJS.Timeout | undefined;
    if (isGameActive && isLoadingTodos) {
      moleTimer = setInterval(() => {
        setMoles(prevMoles => {
          const hiddenMoles = prevMoles.filter(m => m.state === 'hidden' || m.state === 'whacked');
          if (hiddenMoles.length > 0) {
            const moleToPopIndex = Math.floor(Math.random() * hiddenMoles.length);
            const moleToPop = hiddenMoles[moleToPopIndex];
            
            const newMoles = prevMoles.map(m =>
              m.id === moleToPop.id ? { ...m, state: 'visible' as MoleState } : m
            );

            // Auto-hide mole if not whacked after some time & penalize
            setTimeout(() => {
              setMoles(currentMoles =>
                currentMoles.map(m => {
                  if (m.id === moleToPop.id && m.state === 'visible') { // Check if it's still visible (i.e., not whacked)
                    setWhackScore(prevScore => prevScore - 5); // Penalty for missed mole
                    return { ...m, state: 'hidden' as MoleState };
                  }
                  return m;
                })
              );
            }, MOLE_VISIBLE_MIN_DURATION + Math.random() * MOLE_VISIBLE_RANDOM_DURATION);

            return newMoles;
          }
          return prevMoles;
        });
      }, MOLE_POP_MIN_INTERVAL + Math.random() * MOLE_POP_RANDOM_INTERVAL);
    }
    return () => {
      if (moleTimer) clearInterval(moleTimer);
    };
  }, [isGameActive, isLoadingTodos]);


  const handleAddTodo = async (text: string) => {
    try {
      const newTodoData = {
        text,
        completed: false,
        createdAt: Timestamp.now(),
      };
      await addDoc(collection(db, 'todos'), newTodoData);
      toast({ title: "Task Added!", description: `"${text}" has been added to your list.` });
    } catch (error) {
      console.error("Error adding todo: ", error);
      toast({ title: "Error Adding Task", description: "Could not add task to Firestore.", variant: "destructive" });
    }
  };

  const handleToggleComplete = async (id: string) => {
    const todoToUpdate = todos.find(todo => todo.id === id);
    if (!todoToUpdate) return;
    try {
      const todoRef = doc(db, 'todos', id);
      await updateDoc(todoRef, {
        completed: !todoToUpdate.completed,
      });
    } catch (error) {
      console.error("Error updating todo: ", error);
      toast({ title: "Error Updating Task", description: "Could not update task status.", variant: "destructive" });
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const todoRef = doc(db, 'todos', id);
      await deleteDoc(todoRef);
      toast({ title: "Task Deleted", variant: "destructive" });
    } catch (error) {
      console.error("Error deleting todo: ", error);
      toast({ title: "Error Deleting Task", description: "Could not delete task.", variant: "destructive" });
    }
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleSaveEdit = async (id: string, newText: string) => {
    try {
      const todoRef = doc(db, 'todos', id);
      await updateDoc(todoRef, {
        text: newText,
      });
      setEditingTodo(null);
      toast({ title: "Task Updated!" });
    } catch (error) {
      console.error("Error saving todo: ", error);
      toast({ title: "Error Saving Task", description: "Could not save task.", variant: "destructive" });
      setEditingTodo(null);
    }
  };

  const handleSummarizeAndSend = async () => {
    setIsSummarizing(true);
    setSummary(null);

    const pendingTasks = todos.filter((todo) => !todo.completed).map((todo) => todo.text);

    if (pendingTasks.length === 0) {
      toast({
        title: "No Pending Tasks",
        description: "There are no pending tasks to summarize.",
      });
      setIsSummarizing(false);
      return;
    }

    try {
      const result = await summarizePendingTodos({ todos: pendingTasks });
      setSummary(result.summary);
      toast({
        title: "AI Summary Generated!",
        description: "The AI-generated summary is ready and displayed below.",
        duration: 8000,
      });
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Error Generating Summary",
        description: "Could not generate AI summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [todos]);

  if (isLoadingTodos) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <AppHeader onSummarize={() => {}} isSummarizing={false} />
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
          <p className="text-xl font-semibold text-foreground mb-2">Loading your tasks...</p>
          {motivationalQuote && (
            <p className="text-lg italic text-foreground/80 mb-6 max-w-md transition-opacity duration-500 ease-in-out">
              &ldquo;{motivationalQuote}&rdquo;
            </p>
          )}
          <p className="text-muted-foreground mb-6 max-w-lg">
            As the quote suggests, a little patience goes a long way! While we prepare your tasks, why not test your reflexes with Whack-a-Mole?
          </p>

          <Card className="p-4 shadow-lg w-full max-w-sm rounded-xl">
            <CardHeader className="p-2 pb-1">
              <CardTitle className="text-xl text-center text-primary">Whack-a-Mole!</CardTitle>
              <CardDescription className="text-center text-lg">Score: <span className={cn("font-bold", whackScore >= 0 ? "text-accent" : "text-destructive")}>{whackScore}</span></CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-3">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {moles.map(mole => (
                  <Button
                    key={mole.id}
                    variant="outline"
                    className={cn(
                      "h-20 w-full flex items-center justify-center text-3xl sm:text-4xl transition-all duration-150 rounded-lg shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      mole.state === 'visible' && "bg-primary/10 hover:bg-primary/20 ring-2 ring-primary animate-bounce",
                      mole.state === 'whacked' && "bg-accent/80 text-accent-foreground scale-90",
                      mole.state === 'hidden' && "bg-muted/40 hover:bg-muted/60"
                    )}
                    onClick={() => handleWhack(mole.id)}
                    disabled={!isGameActive || mole.state === 'whacked'} // Allow clicking hidden moles
                    aria-label={`Mole ${mole.id + 1} ${mole.state}`}
                  >
                    {mole.state === 'visible' ? '😮' : mole.state === 'whacked' ? '😵' : '🕳️'}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader onSummarize={handleSummarizeAndSend} isSummarizing={isSummarizing} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <AddTodoForm onAddTodo={handleAddTodo} />
          <TodoList
            todos={sortedTodos}
            onToggleComplete={handleToggleComplete}
            onDeleteTodo={handleDeleteTodo}
            onEditTodo={handleEditTodo}
          />
          {summary && (
            <Card className="mt-8 shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary">AI Generated Summary for Slack</CardTitle>
                <CardDescription>This summary is ready to be shared.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed whitespace-pre-wrap">{summary}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      {editingTodo && (
        <EditTodoDialog
          todo={editingTodo}
          onSave={handleSaveEdit}
          onOpenChange={(isOpen) => !isOpen && setEditingTodo(null)}
        />
      )}
    </div>
  );
}
