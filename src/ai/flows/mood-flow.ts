'use server';
/**
 * @fileOverview An AI flow to analyze a user's mood from a photo and suggest songs.
 * 
 * - getVibeFromImage - Analyzes an image and returns a mood and a playlist.
 */

import { ai } from '@/ai/genkit';
import { VibeRequest, VibeRequestSchema, VibeResponse, VibeResponseSchema } from '@/ai/schemas';

export async function getVibeFromImage(input: VibeRequest): Promise<VibeResponse> {
    return moodFlow(input);
}

const moodPrompt = ai.definePrompt({
    name: 'moodPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: VibeRequestSchema },
    output: { schema: VibeResponseSchema },
    prompt: `You are an expert at analyzing human emotions from a photograph, with a keen eye for subtle facial expressions. You are also a world-class DJ who curates perfect playlists.

Your task is to analyze the user's selfie and determine their primary mood, then create a matching playlist.

1.  **Determine the primary mood.** Analyze the user's facial expression, paying close attention to their eyes, mouth, and overall posture. The mood must be a single, descriptive word from the following list: Happy, Sad, Energetic, Calm, Thoughtful, Excited, Content, Melancholy, Playful, Serious.

2.  **Select a single emoji** that best represents this mood.

3.  **Generate a strictly-matching playlist.** Based *only* on the mood you just determined, suggest a playlist of exactly 8 songs. The genre and style of these songs must be a direct and obvious match for the mood. For example, for a 'Calm' mood, you might suggest ambient or lo-fi tracks. For an 'Energetic' mood, suggest upbeat pop or dance music. For each song, provide only the title and the primary artist. **The songs must be in the following language: {{language}}.**

{{#if previousSongs}}
IMPORTANT: Do not suggest any of the following songs, as they have already been recommended to the user. Generate a completely new list of songs, ensuring they still strictly match the detected mood and language.
{{#each previousSongs}}
- "{{title}}" by {{artist}}
{{/each}}
{{/if}}

Analyze this photo: {{media url=photoDataUri}}`,
});

const moodFlow = ai.defineFlow(
    {
        name: 'moodFlow',
        inputSchema: VibeRequestSchema,
        outputSchema: VibeResponseSchema,
    },
    async (input) => {
        const { output } = await moodPrompt(input);

        if (!output) {
            throw new Error("The AI failed to generate a response.");
        }
        
        // Ensure we always return at most 8 songs
        if (output.songs.length > 8) {
            output.songs = output.songs.slice(0, 8);
        }

        return output;
    }
);
