// This is a server-side file.
'use server';

/**
 * @fileOverview Determines the relevance of a task for inclusion in a Slack update.
 *
 * - determineTaskRelevance - A function that determines if a task is relevant.
 * - DetermineTaskRelevanceInput - The input type for the determineTaskRelevance function.
 * - DetermineTaskRelevanceOutput - The return type for the determineTaskRelevance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetermineTaskRelevanceInputSchema = z.object({
  task: z.string().describe('The task to evaluate for relevance.'),
  currentTasks: z.string().describe('A description of all current tasks.'),
});
export type DetermineTaskRelevanceInput = z.infer<
  typeof DetermineTaskRelevanceInputSchema
>;

const DetermineTaskRelevanceOutputSchema = z.object({
  isRelevant: z
    .boolean()
    .describe(
      'Whether the task is relevant for inclusion in the Slack update.'
    ),
  reason: z
    .string()
    .describe('The reason for the task being relevant or irrelevant.'),
});
export type DetermineTaskRelevanceOutput = z.infer<
  typeof DetermineTaskRelevanceOutputSchema
>;

export async function determineTaskRelevance(
  input: DetermineTaskRelevanceInput
): Promise<DetermineTaskRelevanceOutput> {
  return determineTaskRelevanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'determineTaskRelevancePrompt',
  input: {schema: DetermineTaskRelevanceInputSchema},
  output: {schema: DetermineTaskRelevanceOutputSchema},
  prompt: `You are an AI assistant helping to determine the relevance of individual tasks for inclusion in a Slack update.

  Given the following task:
  {{task}}

  And the context of current tasks:
  {{currentTasks}}

  Determine if the task is relevant for a Slack update. Consider factors such as urgency, importance, and impact on team members.

  Return a JSON object indicating whether the task is relevant and providing a brief reason for your determination.
  {
    "isRelevant": true or false,
    "reason": "Explanation of why the task is relevant or not"
  }`,
});

const determineTaskRelevanceFlow = ai.defineFlow(
  {
    name: 'determineTaskRelevanceFlow',
    inputSchema: DetermineTaskRelevanceInputSchema,
    outputSchema: DetermineTaskRelevanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
