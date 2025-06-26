
import { z } from 'zod';

export const VibeRequestSchema = z.object({
    photoDataUri: z
        .string()
        .describe("A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
    previousSongs: z.array(z.object({
        title: z.string(),
        artist: z.string(),
    })).optional().describe('A list of songs that have already been suggested and should be excluded from the new playlist.'),
    language: z.string().describe('The language for the song suggestions. The songs should be strictly in this language.'),
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
