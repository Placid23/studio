'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadFileAction } from '@/app/actions/download';

interface DownloadButtonProps {
    filePath: string;
    bucket: 'videos' | 'songs';
    fileName: string;
    disabled?: boolean;
}

export function DownloadButton({ filePath, bucket, fileName, disabled = false }: DownloadButtonProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleDownload = () => {
        if (disabled || !filePath) {
            toast({
                title: 'Download Not Available',
                description: 'This item has not been added to the server yet.',
                variant: 'destructive'
            });
            return;
        }

        startTransition(async () => {
            const result = await downloadFileAction(filePath, bucket, fileName);

            if (result.error || !result.url) {
                toast({
                    title: 'Download Failed',
                    description: result.error || 'Could not generate a download link.',
                    variant: 'destructive',
                });
                return;
            }

            // Create a temporary link to trigger the download
            const link = document.createElement('a');
            link.href = result.url;
            // The 'download' attribute suggests a filename to the browser
            link.setAttribute('download', result.fileName || 'download');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    return (
        <Button onClick={handleDownload} disabled={isPending || disabled} size="lg" variant="outline">
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Preparing...
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
