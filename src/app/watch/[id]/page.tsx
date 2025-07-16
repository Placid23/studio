
import { BackButton } from '@/components/layout/BackButton';
import { AlertTriangle } from 'lucide-react';

export default function WatchPage() {
    return (
        <div className="bg-background text-white min-h-screen flex flex-col relative">
            <header className="absolute top-0 left-0 p-4 z-20 w-full bg-gradient-to-b from-black/70 to-transparent">
                <BackButton className="border-white/30 bg-black/20 hover:bg-white/10 text-white backdrop-blur-sm" />
            </header>
            
            <main className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center p-4">
                    <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
                    <h1 className="text-2xl font-bold">Streaming Not Available</h1>
                    <p className="text-muted-foreground max-w-md">This streaming method is no longer supported. Please explore other titles.</p>
                </div>
            </main>
        </div>
    );
}
