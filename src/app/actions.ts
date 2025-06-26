
'use server';

import { searchTrack } from "@/lib/spotify";
import { getVibeFromImage as getVibeFromImageFlow } from "@/ai/flows/mood-flow";
import type { VibeRequest, VibeResponse } from "@/ai/schemas";

export async function getTrackInfo(song: { title: string; artist: string }) {
    const query = `${song.title} ${song.artist}`;
    try {
        const track = await searchTrack(query);
        return track;
    } catch (error)        {
        console.error("Error fetching track info:", error);
        return null;
    }
}

const MOCK_VIBES = {
  Happy: {
    emoji: '😊',
    songs: [
      { title: "Don't Stop Me Now", artist: 'Queen' },
      { title: 'Happy', artist: 'Pharrell Williams' },
      { title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars' },
      { title: 'Walking on Sunshine', artist: 'Katrina & The Waves' },
      { title: 'Good Vibrations', artist: 'The Beach Boys' },
      { title: 'Lovely Day', artist: 'Bill Withers' },
      { title: 'Three Little Birds', artist: 'Bob Marley & The Wailers' },
      { title: 'I Gotta Feeling', artist: 'The Black Eyed Peas' },
    ],
  },
  Sad: {
    emoji: '😢',
    songs: [
        { title: 'Someone Like You', artist: 'Adele' },
        { title: 'Hallelujah', artist: 'Jeff Buckley' },
        { title: 'Yesterday', artist: 'The Beatles' },
        { title: 'Everybody Hurts', artist: 'R.E.M.' },
        { title: 'Tears in Heaven', artist: 'Eric Clapton' },
        { title: 'The Sound of Silence', artist: 'Simon & Garfunkel' },
        { title: 'Fix You', artist: 'Coldplay' },
        { title: 'My Immortal', artist: 'Evanescence' },
    ],
  },
  Energetic: {
    emoji: '⚡️',
    songs: [
        { title: 'Eye of the Tiger', artist: 'Survivor' },
        { title: 'Thunderstruck', artist: 'AC/DC' },
        { title: 'Born to Run', artist: 'Bruce Springsteen' },
        { title: "Can't Stop the Feeling!", artist: 'Justin Timberlake' },
        { title: 'Shake It Off', artist: 'Taylor Swift' },
        { title: 'Hey Ya!', artist: 'OutKast' },
        { title: 'Mr. Brightside', artist: 'The Killers' },
        { title: 'Pump It', artist: 'The Black Eyed Peas' },
    ],
  },
  Calm: {
    emoji: '😌',
    songs: [
        { title: 'Weightless', artist: 'Marconi Union' },
        { title: 'Clair de Lune', artist: 'Claude Debussy' },
        { title: 'Orinoco Flow', artist: 'Enya' },
        { title: 'Watermark', artist: 'Enya' },
        { title: 'Acoustic #3', artist: 'The Goo Goo Dolls' },
        { title: 'Better Together', artist: 'Jack Johnson' },
        { title: 'Holocene', artist: 'Bon Iver' },
        { title: 'Here Comes the Sun', artist: 'The Beatles' },
    ],
  },
  Thoughtful: {
    emoji: '🤔',
    songs: [
        { title: 'Bohemian Rhapsody', artist: 'Queen' },
        { title: 'Stairway to Heaven', artist: 'Led Zeppelin' },
        { title: 'Imagine', artist: 'John Lennon' },
        { title: 'Mad World', artist: 'Gary Jules' },
        { title: 'The Boxer', artist: 'Simon & Garfunkel' },
        { title: 'Wish You Were Here', artist: 'Pink Floyd' },
        { title: 'Sound and Vision', artist: 'David Bowie' },
        { title: 'Let It Be', artist: 'The Beatles' },
    ],
  }
};
type MockMood = keyof typeof MOCK_VIBES;

async function getMockVibe(request: VibeRequest): Promise<VibeResponse> {
    const moods = Object.keys(MOCK_VIBES) as MockMood[];
    
    // In mock mode, we cycle through moods instead of picking one randomly
    // to give a sense of change on "refresh". We can use the number of previous songs for this.
    const moodIndex = (request.previousSongs?.length || 0) % moods.length;
    const randomMood = moods[moodIndex];
    const vibe = MOCK_VIBES[randomMood];

    // Note: The mock function doesn't filter by language or exclude previous songs for simplicity.
    return {
        mood: randomMood,
        emoji: vibe.emoji,
        songs: vibe.songs,
    };
}


export async function getVibeFromImage(request: VibeRequest) {
    const useAI = process.env.USE_AI !== 'false'; // Defaults to true if not set or not 'false'

    if (!useAI) {
        console.log("Using mock data for mood analysis.");
        return getMockVibe(request);
    }

    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            console.error("GEMINI_API_KEY is not set, but USE_AI is true. Falling back to mock data.");
            return getMockVide(request);
        }
        return await getVibeFromImageFlow(request);
    } catch (error) {
        console.error("Error in getVibeFromImage flow, falling back to mock:", error);
        // Fallback to mock data on AI error to keep the app functional
        return getMockVibe(request);
    }
}
