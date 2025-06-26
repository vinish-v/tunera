
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
    prompt: `You are an expert at analyzing human emotions from a photograph, with a keen eye for subtle facial expressions.

Your task is to analyze the user's selfie and determine their primary mood. Pay close attention to their eyes, mouth, and overall facial posture.

1.  **Determine the primary mood.** The mood must be a single, descriptive word. Here are some examples of valid moods:
    *   Happy
    *   Sad
    *   Energetic
    *   Calm
    *   Thoughtful
    *   Excited
    *   Content
    *   Melancholy
    *   Playful
    *   Serious

2.  **Select a single emoji** that best represents this mood.

3.  **Suggest a playlist of exactly 8 songs** that perfectly match this mood. For each song, provide only the title and the primary artist. Do not include any other information.

{{#if previousSongs}}
IMPORTANT: Do not suggest any of the following songs, as they have already been recommended to the user. Generate a completely new list of songs.
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
