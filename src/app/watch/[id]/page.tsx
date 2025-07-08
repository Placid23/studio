import { BackButton } from '@/components/layout/BackButton';
import { AlertTriangle } from 'lucide-react';

export default async function WatchPage() {
    return (
        <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-4">
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
                <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-destructive">Playback Not Available</h1>
                <p className="mt-2 text-destructive/80">The streaming method has been updated. This page is temporarily disabled.</p>
                 <div className="mt-6">
                    <BackButton />
                </div>
            </div>
        </div>
    );
}
