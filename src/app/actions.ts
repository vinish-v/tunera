
'use server';

import { searchTrack } from "@/lib/spotify";
import { getVibeFromImage as getVibeFromImageFlow } from "@/ai/flows/mood-flow";
import type { VibeRequest } from "@/ai/schemas";

export async function getTrackInfo(song: { title: string; artist: string }) {
    const query = `${song.title} ${song.artist}`;
    try {
        const track = await searchTrack(query);
        return track;
    } catch (error) {
        console.error("Error fetching track info:", error);
        return null;
    }
}

export async function getVibeFromImage(request: VibeRequest) {
    try {
        return await getVibeFromImageFlow(request);
    } catch (error) {
        console.error("Error in getVibeFromImage flow:", error);
        return null; 
    }
}
