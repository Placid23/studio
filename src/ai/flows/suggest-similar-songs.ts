'use server';

/**
 * @fileOverview AI agent that suggests similar songs based on a given song's details.
 *
 * - suggestSimilarSongs - A function that suggests similar songs.
 * - SuggestSimilarSongsInput - The input type for the suggestSimilarSongs function.
 * - SuggestSimilarSongsOutput - The return type for the suggestSimilarSongs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSimilarSongsInputSchema = z.object({
  title: z.string().describe('The title of the song.'),
  artist: z.string().describe('The artist of the song.'),
  genre: z.string().describe('The genre of the song.'),
});
export type SuggestSimilarSongsInput = z.infer<typeof SuggestSimilarSongsInputSchema>;

const SuggestSimilarSongsOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      title: z.string().describe('The title of the suggested song.'),
      artist: z.string().describe('The artist of the suggested song.'),
      album: z.string().describe('The album of the suggested song.'),
      reason: z.string().describe('A brief reason why this song is a good suggestion.'),
    })
  ).describe('An array of suggested similar songs.'),
});
export type SuggestSimilarSongsOutput = z.infer<typeof SuggestSimilarSongsOutputSchema>;

export async function suggestSimilarSongs(input: SuggestSimilarSongsInput): Promise<SuggestSimilarSongsOutput> {
  return suggestSimilarSongsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSimilarSongsPrompt',
  input: {schema: SuggestSimilarSongsInputSchema},
  output: {schema: SuggestSimilarSongsOutputSchema},
  prompt: `You are a world-class DJ and music expert with an encyclopedic knowledge of music across all genres.

  Based on the details of the song provided below, suggest 5 other songs that the user might enjoy. Consider the song's tempo, mood, genre, instrumentation, and artist similarities.

  Song Title: {{{title}}}
  Artist: {{{artist}}}
  Genre: {{{genre}}}

  For each suggestion, provide the song title, artist, the album it's on, and a short, compelling reason why it's a great recommendation.
  
  Format your response as a JSON array of song objects.`,
});

const suggestSimilarSongsFlow = ai.defineFlow(
  {
    name: 'suggestSimilarSongsFlow',
    inputSchema: SuggestSimilarSongsInputSchema,
    outputSchema: SuggestSimilarSongsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
