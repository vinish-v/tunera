'use server';
/**
 * @fileOverview AI agent that suggests songs based on the user's mood.
 *
 * - suggestSongsForMood - A function that suggests songs for a given mood.
 * - SuggestSongsForMoodInput - The input type for the suggestSongsForMood function.
 * - SuggestSongsForMoodOutput - The return type for the suggestSongsForMood function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSongsForMoodInputSchema = z.object({
  mood: z.string().describe('The mood of the user.'),
});
export type SuggestSongsForMoodInput = z.infer<typeof SuggestSongsForMoodInputSchema>;

const SuggestSongsForMoodOutputSchema = z.object({
  songs: z
    .array(z.string())
    .describe('A list of song suggestions for the given mood.'),
});
export type SuggestSongsForMoodOutput = z.infer<typeof SuggestSongsForMoodOutputSchema>;

export async function suggestSongsForMood(input: SuggestSongsForMoodInput): Promise<SuggestSongsForMoodOutput> {
  return suggestSongsForMoodFlow(input);
}

const getSongsForMood = ai.defineTool({
  name: 'getSongsForMood',
  description: 'Returns a list of songs that match the given mood.',
  inputSchema: z.object({
    mood: z.string().describe('The mood to find songs for.'),
  }),
  outputSchema: z.array(z.string()),
}, async (input) => {
  const songMap: { [key: string]: string[] } = {
    happy: ['Walking on Sunshine', 'Happy', 'Lovely Day'],
    sad: ['Hallelujah', 'Tears in Heaven', 'Someone Like You'],
    energetic: ['Uptown Funk', 'September', 'Don\'t Stop Me Now'],
    calm: ['Watermark', 'Clair de Lune', 'A Sky Full of Stars'],
    romantic: ['Perfect', 'All of Me', 'Can\'t Help Falling in Love'],
  };

  const mood = input.mood.toLowerCase();
  return songMap[mood] || ['Default Song 1', 'Default Song 2', 'Default Song 3'];
});

const suggestSongsForMoodPrompt = ai.definePrompt({
  name: 'suggestSongsForMoodPrompt',
  tools: [getSongsForMood],
  input: {schema: SuggestSongsForMoodInputSchema},
  output: {schema: SuggestSongsForMoodOutputSchema},
  prompt: `Based on the user's mood, suggest a list of songs using the getSongsForMood tool.

Mood: {{{mood}}}
`,
});

const suggestSongsForMoodFlow = ai.defineFlow(
  {
    name: 'suggestSongsForMoodFlow',
    inputSchema: SuggestSongsForMoodInputSchema,
    outputSchema: SuggestSongsForMoodOutputSchema,
  },
  async input => {
    const {output} = await suggestSongsForMoodPrompt(input);
    return output!;
  }
);
