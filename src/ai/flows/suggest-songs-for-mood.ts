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

const SongSchema = z.object({
    title: z.string().describe("The title of the song."),
    artist: z.string().describe("The artist of the song."),
});

const SuggestSongsForMoodInputSchema = z.object({
  mood: z.string().describe('The mood of the user.'),
  language: z.string().optional().describe('The language for the song suggestions.'),
  history: z.array(SongSchema).optional().describe('A list of previously suggested songs to avoid repeating.'),
});
export type SuggestSongsForMoodInput = z.infer<typeof SuggestSongsForMoodInputSchema>;

const SuggestSongsForMoodOutputSchema = z.object({
  songs: z
    .array(SongSchema)
    .min(8)
    .max(8)
    .describe('A list of 8 song suggestions for the given mood, including title and artist.'),
});
export type SuggestSongsForMoodOutput = z.infer<typeof SuggestSongsForMoodOutputSchema>;

export async function suggestSongsForMood(input: SuggestSongsForMoodInput): Promise<SuggestSongsForMoodOutput> {
  return suggestSongsForMoodFlow(input);
}

const prompt = ai.definePrompt({
    name: 'suggestSongsPrompt',
    input: {schema: SuggestSongsForMoodInputSchema},
    output: {schema: SuggestSongsForMoodOutputSchema},
    config: {
        temperature: 1.0,
    },
    prompt: `You are a music expert and world-class DJ. Your task is to suggest 8 songs that embody the provided mood.

The mood is: {{{mood}}}.

{{#if language}}
You MUST suggest songs exclusively in the following language: {{{language}}}. It is critical that you do not include songs in any other language. All 8 songs must be in {{{language}}}.
{{/if}}

For each song, include the title and artist.
To ensure variety, you MUST provide a different list of songs each time you are asked for the same mood.

{{#if history}}
You MUST NOT suggest any of the following songs which have already been recommended. Do not repeat songs from this list:
{{#each history}}
- {{{this.title}}} by {{{this.artist}}}
{{/each}}
{{/if}}`,
});

const suggestSongsForMoodFlow = ai.defineFlow(
  {
    name: 'suggestSongsForMoodFlow',
    inputSchema: SuggestSongsForMoodInputSchema,
    outputSchema: SuggestSongsForMoodOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || output.songs.length === 0) {
      throw new Error(`Failed to generate song suggestions for mood: ${input.mood}`);
    }
    return output;
  }
);
