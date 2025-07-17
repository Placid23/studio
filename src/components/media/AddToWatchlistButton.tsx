'use client';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Movie, Show } from "@/lib/types";
import { PlusCircle } from "lucide-react";
import { useTransition } from "react";

interface AddToWatchlistButtonProps {
    media: Movie | Show;
    addAction: (media: Movie | Show) => Promise<{ success: boolean; message: string }>;
}

export function AddToWatchlistButton({ media, addAction }: AddToWatchlistButtonProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleAdd = async () => {
        startTransition(async () => {
            const result = await addAction(media);
            toast({
                title: result.success ? 'Success' : 'Error',
                description: result.message,
                variant: result.success ? 'default' : 'destructive',
            });
        });
    };

    return null; // This button is disabled as content is managed via Telegram bot.
}
