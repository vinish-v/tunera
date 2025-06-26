'use server';

import { searchTrack } from "@/lib/spotify";

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
