
export type Song = { title: string; artist: string };
export type Mood = 'happy' | 'sad' | 'energetic' | 'calm' | 'surprise';

export const moodEmojis: Record<Mood, string> = {
    happy: '😊',
    sad: '😢',
    energetic: '⚡️',
    calm: '😌',
    surprise: '😮',
};

export const moodPlaylists: Record<Mood, Song[]> = {
    happy: [
        { title: "Don't Stop Me Now", artist: "Queen" },
        { title: "Happy", artist: "Pharrell Williams" },
        { title: "Walking on Sunshine", artist: "Katrina & The Waves" },
        { title: "Good as Hell", artist: "Lizzo" },
        { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars" },
        { title: "Shake It Off", artist: "Taylor Swift" },
        { title: "I Gotta Feeling", artist: "The Black Eyed Peas" },
        { title: "Three Little Birds", artist: "Bob Marley & The Wailers" },
    ],
    sad: [
        { title: "Someone Like You", artist: "Adele" },
        { title: "Hallelujah", artist: "Jeff Buckley" },
        { title: "Fix You", artist: "Coldplay" },
        { title: "Everybody Hurts", artist: "R.E.M." },
        { title: "Nothing Compares 2 U", artist: "Sinéad O'Connor" },
        { title: "I'm Not The Only One", artist: "Sam Smith" },
        { title: "Skinny Love", artist: "Bon Iver" },
        { title: "The Sound of Silence", artist: "Simon & Garfunkel" },
    ],
    energetic: [
        { title: "Eye of the Tiger", artist: "Survivor" },
        { title: "Thunderstruck", artist: "AC/DC" },
        { title: "Crazy Train", artist: "Ozzy Osbourne" },
        { title: "Can't Stop", artist: "Red Hot Chili Peppers" },
        { title: "Lose Yourself", artist: "Eminem" },
        { title: "Pump It", artist: "The Black Eyed Peas" },
        { title: "Welcome to the Jungle", artist: "Guns N' Roses" },
        { title: "Dog Days Are Over", artist: "Florence + The Machine" },
    ],
    calm: [
        { title: "Weightless", artist: "Marconi Union" },
        { title: "Clair de Lune", artist: "Claude Debussy" },
        { title: "Orinoco Flow", artist: "Enya" },
        { title: "Holocene", artist: "Bon Iver" },
        { title: "Here Comes The Sun", artist: "The Beatles" },
        { title: "Better Together", artist: "Jack Johnson" },
        { title: "Peaceful Easy Feeling", artist: "Eagles" },
        { title: "Landslide", artist: "Fleetwood Mac" },
    ],
    surprise: [
        { title: "Bohemian Rhapsody", artist: "Queen" },
        { title: "A-Punk", artist: "Vampire Weekend" },
        { title: "Mr. Brightside", artist: "The Killers" },
        { title: "Take On Me", artist: "a-ha" },
        { title: "Feel Good Inc.", artist: "Gorillaz" },
        { title: "Crazy", artist: "Gnarls Barkley" },
        { title: "Blinding Lights", artist: "The Weeknd" },
        { title: "Chop Suey!", artist: "System Of A Down" },
    ],
};
