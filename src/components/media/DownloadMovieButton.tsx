
'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadMovieAction } from '@/app/actions/download-movie';

interface DownloadMovieButtonProps {
    movieName: string;
    movieYear: number;
}

export function DownloadMovieButton({ movieName, movieYear }: DownloadMovieButtonProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleDownload = () => {
        startTransition(async () => {
            toast({
                title: 'Starting Download...',
                description: `Requesting download for ${movieName}. This may take a few minutes.`,
            });
            
            const result = await downloadMovieAction(movieName, movieYear);

            toast({
                title: result.success ? 'Success' : 'Error',
                description: result.message,
                variant: result.success ? 'default' : 'destructive',
            });
        });
    };

    return (
        <Button onClick={handleDownload} disabled={isPending} size="lg" variant="outline">
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Initiating...
                </>
            ) : (
                <>
                    <Download className="mr-2 h-6 w-6" />
                    Download
                </>
            )}
        </Button>
    );
}
