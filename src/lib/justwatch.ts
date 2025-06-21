'use server';
import JustWatch from 'justwatch-api';
import type { Movie, Show } from './types';

export interface StreamingProvider {
  name: string;
  iconUrl: string;
  url: string;
}

const justWatch = new JustWatch({ country: 'US' });

// A simple in-memory cache for providers to avoid re-fetching on every call within a single request lifecycle.
let providersCache: any[] | null = null;

async function getAllProviders() {
    if (providersCache) {
        return providersCache;
    }
    try {
      providersCache = await justWatch.getProviders();
    } catch (error) {
      console.error('Failed to fetch JustWatch providers:', error);
      providersCache = []; // Prevent refetching on the same request if it fails
    }
    return providersCache;
}

export async function getStreamingProviders(
    title: string,
    type: 'movie' | 'show',
    releaseYear?: number
): Promise<StreamingProvider[]> {
    try {
        const providers = await getAllProviders();
        if (!providers || providers.length === 0) {
            return [];
        }

        const providerMap = new Map(providers.map(p => [p.id, p]));

        const searchResult = await justWatch.search({ query: title, contentType: type });
        
        // Find the best match, optionally using release year
        const bestMatch = searchResult?.items?.find(item => item.original_release_year === releaseYear) || searchResult?.items?.[0];

        if (!bestMatch || !bestMatch.offers) {
            return [];
        }

        const uniqueProviders = new Map<number, StreamingProvider>();

        bestMatch.offers.forEach(offer => {
            // We're interested in 'flatrate' (subscription) services.
            if (offer.monetization_type === 'flatrate' && offer.urls.standard_web) {
                const provider = providerMap.get(offer.provider_id);
                if (provider && !uniqueProviders.has(provider.id)) {
                    uniqueProviders.set(provider.id, {
                        name: provider.clear_name,
                        iconUrl: `https://images.justwatch.com${provider.icon_url.replace('{profile}', 's100')}`,
                        url: offer.urls.standard_web,
                    });
                }
            }
        });

        return Array.from(uniqueProviders.values());
    } catch (error) {
        // Don't log expected 404s for titles not found
        if (!(error instanceof Error && error.message.includes('404'))) {
          console.error(`Error fetching JustWatch data for "${title}":`, error);
        }
        return [];
    }
}
