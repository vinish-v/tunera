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
    title: z.string(),
    artist: z.string(),
});

const SuggestSongsForMoodOutputSchema = z.object({
  songs: z
    .array(SongSchema)
    .describe('A list of song suggestions for the given mood, including title and artist.'),
});
export type SuggestSongsForMoodOutput = z.infer<typeof SuggestSongsForMoodOutputSchema>;

export async function suggestSongsForMood(input: SuggestSongsForMoodInput): Promise<SuggestSongsForMoodOutput> {
  return suggestSongsForMoodFlow(input);
}

const suggestSongsForMoodFlow = ai.defineFlow(
  {
    name: 'suggestSongsForMoodFlow',
    inputSchema: SuggestSongsForMoodInputSchema,
    outputSchema: SuggestSongsForMoodOutputSchema,
  },
  async (input) => {
    const songMap: { [key: string]: { title: string; artist: string }[] } = {
        happy: [
            { title: 'Walking on Sunshine', artist: 'Katrina & The Waves' },
            { title: 'Happy', artist: 'Pharrell Williams' },
            { title: 'Lovely Day', artist: 'Bill Withers' },
        ],
        sad: [
            { title: 'Hallelujah', artist: 'Leonard Cohen' },
            { title: 'Tears in Heaven', artist: 'Eric Clapton' },
            { title: 'Someone Like You', artist: 'Adele' },
        ],
        energetic: [
            { title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars' },
            { title: 'September', artist: 'Earth, Wind & Fire' },
            { title: 'Don\'t Stop Me Now', artist: 'Queen' },
        ],
        calm: [
            { title: 'Watermark', artist: 'Enya' },
            { title: 'Clair de Lune', artist: 'Claude Debussy' },
            { title: 'A Sky Full of Stars', artist: 'Coldplay' },
        ],
        romantic: [
            { title: 'Perfect', artist: 'Ed Sheeran' },
            { title: 'All of Me', artist: 'John Legend' },
            { title: 'Can\'t Help Falling in Love', artist: 'Elvis Presley' },
        ],
    };

    const mood = input.mood.toLowerCase();
    const songs = songMap[mood] || [{ title: 'Default Song 1', artist: 'The Defaults' }];

    return { songs };
  }
);
