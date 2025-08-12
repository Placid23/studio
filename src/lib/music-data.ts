
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
}

// Sample data - in a real application, this would come from an API.
const sampleTracks: Track[] = [
  {
    id: '1',
    title: 'Ambient Gold',
    artist: 'Celestial Soundscapes',
    album: 'Atmospheres',
    coverUrl: 'https://placehold.co/500x500.png',
    audioUrl: 'https://cdn.pixabay.com/audio/2023/10/16/audio_29ce074e87.mp3',
  },
  {
    id: '2',
    title: 'Lofi Chill',
    artist: 'Urban Groove',
    album: 'Night Drive',
    coverUrl: 'https://placehold.co/500x500.png',
    audioUrl: 'https://cdn.pixabay.com/audio/2024/02/08/audio_790a3c48ea.mp3',
  },
  {
    id: '3',
    title: 'Epic Cinematic',
    artist: 'Orchestral Dreams',
    album: 'The Grand Score',
    coverUrl: 'https://placehold.co/500x500.png',
    audioUrl: 'https://cdn.pixabay.com/audio/2023/08/03/audio_eb7f7b243b.mp3',
  },
  {
    id: '4',
    title: 'Corporate Pop',
    artist: 'The Upbeats',
    album: 'Motivation Mix',
    coverUrl: 'https://placehold.co/500x500.png',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/08/04/audio_2dde64b20a.mp3',
  },
   {
    id: '5',
    title: 'Relaxing Meditation',
    artist: 'Zen Garden',
    album: 'Inner Peace',
    coverUrl: 'https://placehold.co/500x500.png',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1454e19275.mp3',
  },
  {
    id: '6',
    title: 'Acoustic Folk',
    artist: 'River Twain',
    album: 'Campfire Songs',
    coverUrl: 'https://placehold.co/500x500.png',
    audioUrl: 'https://cdn.pixabay.com/audio/2023/11/26/audio_a12a5c68aa.mp3',
  },
  {
    id: '7',
    title: 'Stomping Rock',
    artist: 'Riff Raiders',
    album: 'Adrenaline',
    coverUrl: 'https://placehold.co/500x500.png',
    audioUrl: 'https://cdn.pixabay.com/audio/2023/05/20/audio_55a873c761.mp3',
  },
  {
    id: '8',
    title: 'Future Bass',
    artist: 'Synthwave Surfer',
    album: 'Neon Nights',
    coverUrl: 'https://placehold.co/500x500.png',
    audioUrl: 'https://cdn.pixabay.com/audio/2023/02/03/audio_51c6198f32.mp3',
  },
];

export function getSampleTracks(): Track[] {
  return sampleTracks;
}
