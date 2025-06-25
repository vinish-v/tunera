//PredictMoodFromSelfie story
'use server';
/**
 * @fileOverview Predicts the mood from a selfie and suggests songs.
 *
 * - predictMoodFromSelfie - A function that handles the mood prediction process.
 * - PredictMoodFromSelfieInput - The input type for the predictMoodFromSelfie function.
 * - PredictMoodFromSelfieOutput - The return type for the predictMoodFromSelfie function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictMoodFromSelfieInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A selfie photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type PredictMoodFromSelfieInput = z.infer<typeof PredictMoodFromSelfieInputSchema>;

// Define the moods we have playlists for.
const MoodEnum = z.enum(['happy', 'sad', 'energetic', 'calm', 'romantic', 'fear', 'anger', 'surprise', 'disgust']);

const PredictMoodFromSelfieOutputSchema = z.object({
  mood: MoodEnum.describe('The predicted mood from the selfie. Must be one of happy, sad, energetic, calm, romantic, fear, anger, surprise, or disgust.'),
  emoji: z.string().describe('A single emoji that represents the mood.'),
});
export type PredictMoodFromSelfieOutput = z.infer<typeof PredictMoodFromSelfieOutputSchema>;

export async function predictMoodFromSelfie(input: PredictMoodFromSelfieInput): Promise<PredictMoodFromSelfieOutput> {
  return predictMoodFromSelfieFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictMoodFromSelfiePrompt',
  input: {schema: PredictMoodFromSelfieInputSchema},
  output: {schema: PredictMoodFromSelfieOutputSchema},
  prompt: `You are a mood analysis expert. Analyze the user's selfie and determine their mood.

You MUST classify the mood into one of the following categories: happy, sad, energetic, calm, romantic, fear, anger, surprise, disgust.

You MUST also provide a single emoji character that represents the predicted mood.

Selfie: {{media url=photoDataUri}}

Respond with the mood category and the emoji.`,
});

const predictMoodFromSelfieFlow = ai.defineFlow(
  {
    name: 'predictMoodFromSelfieFlow',
    inputSchema: PredictMoodFromSelfieInputSchema,
    outputSchema: PredictMoodFromSelfieOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
