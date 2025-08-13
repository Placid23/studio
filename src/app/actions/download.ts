'use server';

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

interface DownloadResult {
    url?: string;
    error?: string;
    fileName?: string;
}

// This function generates a signed URL for downloading a file from a specified bucket.
export async function downloadFileAction(filePath: string, bucket: 'videos' | 'songs', fileName: string): Promise<DownloadResult> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "You must be logged in to download files." };
    }
    
    // Sanitize file path to prevent path traversal
    let sanitizedPath = filePath;
    try {
        const url = new URL(filePath);
        const pathParts = url.pathname.split(`/${bucket}/`);
        if (pathParts.length > 1) {
            sanitizedPath = pathParts[1];
        }
    } catch (e) {
        // Not a URL, assume it's already a path
    }

    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(sanitizedPath, 60, { // URL is valid for 60 seconds
            download: true // This prompts the browser to download the file
        });

    if (error) {
        console.error("Error creating signed download URL:", error);
        return { error: "Could not create download link." };
    }

    return { url: data.signedUrl, fileName };
}
