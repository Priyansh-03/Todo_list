
'use server';

/**
 * @fileOverview Summarizes pending to-do items for efficient Slack updates.
 *
 * - summarizePendingTodos - A function that summarizes pending to-do items.
 * - SummarizePendingTodosInput - The input type for the summarizePendingTodos function.
 * - SummarizePendingTodosOutput - The return type for the summarizePendingTodos function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePendingTodosInputSchema = z.object({
  todos: z.array(z.string()).describe('A list of pending to-do items.'),
});
export type SummarizePendingTodosInput = z.infer<typeof SummarizePendingTodosInputSchema>;

const SummarizePendingTodosOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the pending to-do items, tailored for a Slack update.'),
});
export type SummarizePendingTodosOutput = z.infer<typeof SummarizePendingTodosOutputSchema>;

export async function summarizePendingTodos(input: SummarizePendingTodosInput): Promise<SummarizePendingTodosOutput> {
  return summarizePendingTodosFlow(input);
}

const summarizePendingTodosPrompt = ai.definePrompt({
  name: 'summarizePendingTodosPrompt',
  input: {schema: SummarizePendingTodosInputSchema},
  output: {schema: SummarizePendingTodosOutputSchema},
  prompt: `You are an expert AI assistant specializing in creating concise and actionable summaries for team updates on Slack.

Your task is to summarize the following list of pending to-do items. **Do not simply repeat the tasks verbatim.** Instead, extract the most important information, group related items if appropriate, and provide a brief, high-level overview that is quick to read and understand.

Pending To-Do Items:
{{#each todos}}
- {{{this}}}
{{/each}}

Generate a summary that:
- Is clear, concise, and informative.
- Highlights key actions or themes from the list.
- Uses newlines to separate distinct points or summarized tasks.
- If the list is diverse or long, consider using bullet points (e.g., '*') for clarity.
- Avoids directly copying the original task phrasing; rephrase and condense.
- Is suitable for a professional Slack update.

Slack Update Summary:`,
});

const summarizePendingTodosFlow = ai.defineFlow(
  {
    name: 'summarizePendingTodosFlow',
    inputSchema: SummarizePendingTodosInputSchema,
    outputSchema: SummarizePendingTodosOutputSchema,
  },
  async input => {
    const {output} = await summarizePendingTodosPrompt(input);
    return output!;
  }
);

