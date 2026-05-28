'use server';

import { adminAuth, adminStorage } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

interface DownloadResult {
    url?: string;
    error?: string;
    fileName?: string;
}

export async function downloadFileAction(filePath: string, bucketName: string, fileName: string): Promise<DownloadResult> {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;

    if (!token) {
        return { error: "You must be logged in to download files." };
    }

    try {
        await adminAuth.verifyIdToken(token);
        
        const bucket = adminStorage.bucket();
        const file = bucket.file(filePath);
        
        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 60 * 1000, // 1 minute
        });

        return { url, fileName };
    } catch (error) {
        console.error("Error creating signed download URL:", error);
        return { error: "Could not create download link." };
    }
}
