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

const SongSchema = z.object({
    title: z.string().describe("The title of the song."),
    artist: z.string().describe("The artist of the song."),
});

const SuggestSongsForMoodOutputSchema = z.object({
  songs: z
    .array(SongSchema)
    .min(3)
    .max(5)
    .describe('A list of 3 to 5 song suggestions for the given mood, including title and artist.'),
});
export type SuggestSongsForMoodOutput = z.infer<typeof SuggestSongsForMoodOutputSchema>;

export async function suggestSongsForMood(input: SuggestSongsForMoodInput): Promise<SuggestSongsForMoodOutput> {
  return suggestSongsForMoodFlow(input);
}

const prompt = ai.definePrompt({
    name: 'suggestSongsPrompt',
    input: {schema: SuggestSongsForMoodInputSchema},
    output: {schema: SuggestSongsForMoodOutputSchema},
    prompt: `You are a world-class DJ. Given a mood, suggest a few songs that fit that vibe.

    Mood: {{{mood}}}
    
    Provide a list of 3-5 songs. For each song, include the title and artist.`,
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
      // Fallback in case the model fails or returns an empty list
      return {
        songs: [
          { title: "Don't Worry, Be Happy", artist: 'Bobby McFerrin' },
          { title: 'Three Little Birds', artist: 'Bob Marley & The Wailers' },
          { title: 'Here Comes The Sun', artist: 'The Beatles' },
        ],
      };
    }
    return output;
  }
);
