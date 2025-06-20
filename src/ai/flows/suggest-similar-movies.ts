'use server';

/**
 * @fileOverview AI agent that suggests similar movies based on a given movie's details.
 *
 * - suggestSimilarMovies - A function that suggests similar movies.
 * - SuggestSimilarMoviesInput - The input type for the suggestSimilarMovies function.
 * - SuggestSimilarMoviesOutput - The return type for the suggestSimilarMovies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSimilarMoviesInputSchema = z.object({
  title: z.string().describe('The title of the movie.'),
  genre: z.string().describe('The genre of the movie.'),
  cast: z.string().describe('A comma separated list of actors in the movie.'),
  director: z.string().describe('The director of the movie.'),
  synopsis: z.string().describe('A brief synopsis of the movie.'),
});
export type SuggestSimilarMoviesInput = z.infer<typeof SuggestSimilarMoviesInputSchema>;

const SuggestSimilarMoviesOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      title: z.string().describe('The title of the suggested movie.'),
      genre: z.string().describe('The genre of the suggested movie.'),
      cast: z.string().describe('A comma separated list of actors in the suggested movie.'),
      director: z.string().describe('The director of the suggested movie.'),
      synopsis: z.string().describe('A brief synopsis of the suggested movie.'),
    })
  ).describe('An array of suggested similar movies.'),
});
export type SuggestSimilarMoviesOutput = z.infer<typeof SuggestSimilarMoviesOutputSchema>;

export async function suggestSimilarMovies(input: SuggestSimilarMoviesInput): Promise<SuggestSimilarMoviesOutput> {
  return suggestSimilarMoviesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSimilarMoviesPrompt',
  input: {schema: SuggestSimilarMoviesInputSchema},
  output: {schema: SuggestSimilarMoviesOutputSchema},
  prompt: `You are an expert movie buff with a vast knowledge of films.

  Based on the details of the movie below, suggest other movies that the user might enjoy. Consider themes, genre, similar cast/director, and overall tone.

  Title: {{{title}}}
  Genre: {{{genre}}}
  Cast: {{{cast}}}
  Director: {{{director}}}
  Synopsis: {{{synopsis}}}

  Suggest 5 movies.
  Ensure that the suggested movies are diverse and not just sequels or prequels of the same movie.
  Make sure to include the title, genre, cast, director, and synopsis for each suggested movie.

  Format your response as a JSON array of movie objects.`,
});

const suggestSimilarMoviesFlow = ai.defineFlow(
  {
    name: 'suggestSimilarMoviesFlow',
    inputSchema: SuggestSimilarMoviesInputSchema,
    outputSchema: SuggestSimilarMoviesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
