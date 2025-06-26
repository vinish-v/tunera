'use server';
/**
 * @fileOverview An AI flow to analyze a user's mood from a photo and suggest songs.
 * 
 * - getVibeFromImage - Analyzes an image and returns a mood and a playlist.
 * - VibeRequest - The input type for the flow.
 * - VibeResponse - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const VibeRequestSchema = z.object({
    photoDataUri: z
        .string()
        .describe("A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type VibeRequest = z.infer<typeof VibeRequestSchema>;

export const VibeResponseSchema = z.object({
    mood: z.string().describe('The primary mood detected in the photo (e.g., happy, sad, energetic, calm, thoughtful).'),
    emoji: z.string().describe('A single emoji that best represents the detected mood.'),
    songs: z.array(z.object({
        title: z.string().describe('The title of the suggested song.'),
        artist: z.string().describe('The artist of the suggested song.'),
    })).describe('A playlist of 8 songs that perfectly match the mood.'),
});
export type VibeResponse = z.infer<typeof VibeResponseSchema>;

export async function getVibeFromImage(input: VibeRequest): Promise<VibeResponse> {
    return moodFlow(input);
}

const moodPrompt = ai.definePrompt({
    name: 'moodPrompt',
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
        
        // Ensure we always return exactly 8 songs
        if (output.songs.length > 8) {
            output.songs = output.songs.slice(0, 8);
        }

        return output;
    }
);
