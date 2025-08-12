
import { deezerGet } from '@/lib/deezer';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { BackButton } from '@/components/layout/BackButton';

const SLUG_MAP = {
  'top-albums': {
    title: 'Top Albums',
    endpoint: 'chart/0/albums'
  },
  'top-tracks': {
    title: 'Top Tracks',
    endpoint: 'chart/0/tracks'
  },
  'top-artists': {
    title: 'Top Artists',
    endpoint: 'chart/0/artists'
  },
  'genres': {
    title: 'Genres',
    endpoint: 'genre'
  },
} as const;


function renderCard(item: any) {
    let image = '/img/placeholder.png';
    let titleText = '';
    let subtitleText = '';
    let link = '#';
    let isExternal = true;

    if (item.type === 'album') {
        image = item.cover_xl || item.cover_big || item.cover_medium;
        titleText = item.title;
        subtitleText = item.artist?.name || '';
        link = `/music/album/${item.id}`;
        isExternal = false;
    } else if (item.type === 'track') {
        image = item.album?.cover_xl || item.album?.cover_big;
        titleText = item.title;
        subtitleText = item.artist?.name || '';
        link = `/music/album/${item.album.id}`;
        isExternal = false;
    } else if (item.type === 'artist') {
        image = item.picture_xl || item.picture_big || item.picture_medium;
        titleText = item.name;
        subtitleText = item.nb_fan ? `${item.nb_fan.toLocaleString()} fans` : 'Artist';
        link = `/music/artist/${item.id}`;
        isExternal = false;
    } else if (item.type === 'genre') {
        image = item.picture_xl || item.picture_big;
        titleText = item.name;
        subtitleText = 'Genre';
        link = `https://www.deezer.com/genre/${item.id}`;
    }
    
    const cardContent = (
         <Card className="overflow-hidden h-full transition-all duration-300 group-hover:border-primary group-hover:shadow-primary/20 group-hover:shadow-2xl">
            <CardContent className="p-0">
                <div className="aspect-square relative img-container">
                    <Image src={image} alt={titleText} fill sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw" className="object-cover transition-transform group-hover:scale-105" />
                </div>
                <div className="p-3">
                    <p className="font-semibold text-sm truncate">{titleText}</p>
                    <p className="text-xs text-muted-foreground truncate">{subtitleText}</p>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div key={item.id} className="block group h-full">
            {isExternal ? (
                <a href={link} target="_blank" rel="noreferrer" className="h-full">
                    {cardContent}
                </a>
            ) : (
                <Link href={link} className="h-full">
                   {cardContent}
                </Link>
            )}
        </div>
    );
}

export default async function SeeAllMusicPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  if (!(slug in SLUG_MAP)) {
    notFound();
  }

  const { title, endpoint } = SLUG_MAP[slug as keyof typeof SLUG_MAP];
  const data = await deezerGet(endpoint, {limit: '50'});
  const items = data?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <h1 className="text-4xl font-black text-primary uppercase tracking-wider mb-8">
        {title}
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map(renderCard)}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
    return Object.keys(SLUG_MAP).map((slug) => ({ slug }));
}
