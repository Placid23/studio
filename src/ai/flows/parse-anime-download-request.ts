'use server';

/**
 * @fileOverview An AI agent that parses a natural language query to identify
 *               an anime title, season number, and episode number for download.
 *
 * - parseAnimeDownloadRequest - A function to parse the download request.
 * - ParseAnimeDownloadInput - The input type for the function.
 * - ParseAnimeDownloadOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ParseAnimeDownloadInputSchema = z.object({
  query: z.string().describe('The natural language query from the user, e.g., "download One Piece season 2 episode 5".'),
});
export type ParseAnimeDownloadInput = z.infer<typeof ParseAnimeDownloadInputSchema>;

export const ParseAnimeDownloadOutputSchema = z.object({
  title: z.string().describe('The title of the anime.'),
  season: z.number().optional().describe('The season number, if specified.'),
  episode: z.number().optional().describe('The episode number, if specified.'),
});
export type ParseAnimeDownloadOutput = z.infer<typeof ParseAnimeDownloadOutputSchema>;


export async function parseAnimeDownloadRequest(input: ParseAnimeDownloadInput): Promise<ParseAnimeDownloadOutput> {
  return parseAnimeDownloadRequestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseAnimeDownloadRequestPrompt',
  input: {schema: ParseAnimeDownloadInputSchema},
  output: {schema: ParseAnimeDownloadOutputSchema},
  prompt: `You are an expert at parsing user requests for downloading anime episodes.
Your task is to extract the anime title, season number, and episode number from the user's query.

- The title should be the name of the anime.
- The season and episode are optional. If they are not mentioned, do not include them in the output.
- The output must be in the specified JSON format.

User Query: {{{query}}}
`,
});

const parseAnimeDownloadRequestFlow = ai.defineFlow(
  {
    name: 'parseAnimeDownloadRequestFlow',
    inputSchema: ParseAnimeDownloadInputSchema,
    outputSchema: ParseAnimeDownloadOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
