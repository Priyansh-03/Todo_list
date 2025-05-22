import { config } from 'dotenv';
config();

import '@/ai/flows/determine-task-relevance.ts';
import '@/ai/flows/summarize-pending-todos.ts';