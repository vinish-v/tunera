
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
    prompt: `You are an expert at analyzing human emotions from a photograph.

    Based on the user's selfie, determine their primary mood. The mood should be a single word (e.g., happy, sad, energetic, calm, thoughtful).

    Also, provide a single emoji that best represents this mood.

    Finally, suggest a playlist of exactly 8 songs that perfectly match this mood. For each song, provide only the title and the primary artist. Do not include any other information.
    
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
