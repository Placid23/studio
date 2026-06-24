'use server';

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

interface RatingData {
    averageRating: number;
    totalRatings: number;
}

export async function getMediaRating(mediaId: string): Promise<RatingData> {
    try {
        // Guard against admin SDK initialization issues
        if (!adminDb) return { averageRating: 0, totalRatings: 0 };
        
        const doc = await adminDb.collection('media_ratings').doc(mediaId).get().catch(() => null);
        if (!doc || !doc.exists) {
            return { averageRating: 0, totalRatings: 0 };
        }
        const data = doc.data()!;
        return {
            averageRating: data.averageRating || 0,
            totalRatings: data.totalRatings || 0
        };
    } catch (error) {
        console.warn(`[getMediaRating] Silently handled error for ${mediaId}:`, error);
        return { averageRating: 0, totalRatings: 0 };
    }
}

export async function getUserRating(mediaId: string): Promise<number> {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;
    if (!token || !adminAuth || !adminDb) return 0;

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;
        const doc = await adminDb.collection('users').doc(userId).collection('user_ratings').doc(mediaId).get().catch(() => null);
        return (doc && doc.exists) ? doc.data()?.rating || 0 : 0;
    } catch (error) {
        return 0;
    }
}

export async function submitRatingAction(mediaId: string, rating: number): Promise<{ success: boolean; message: string }> {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;

    if (!token) {
        return { success: false, message: "You must be logged in to rate media." };
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const mediaRef = adminDb.collection('media_ratings').doc(mediaId);
        const userRatingRef = adminDb.collection('users').doc(userId).collection('user_ratings').doc(mediaId);

        await adminDb.runTransaction(async (transaction) => {
            const mediaDoc = await transaction.get(mediaRef);
            const userRatingDoc = await transaction.get(userRatingRef);

            let oldUserRating = 0;
            if (userRatingDoc.exists) {
                oldUserRating = userRatingDoc.data()?.rating || 0;
            }

            let currentAvg = 0;
            let currentCount = 0;

            if (mediaDoc.exists) {
                currentAvg = mediaDoc.data()?.averageRating || 0;
                currentCount = mediaDoc.data()?.totalRatings || 0;
            }

            let newCount = currentCount;
            let newSum = currentAvg * currentCount;

            if (userRatingDoc.exists) {
                newSum = newSum - oldUserRating + rating;
            } else {
                newCount++;
                newSum += rating;
            }

            const newAvg = newSum / newCount;

            transaction.set(userRatingRef, { rating, updatedAt: Date.now() });
            transaction.set(mediaRef, {
                averageRating: newAvg,
                totalRatings: newCount,
                lastRatedAt: Date.now()
            }, { merge: true });
        });

        revalidatePath(`/movies/${mediaId}`);
        revalidatePath(`/shows/${mediaId}`);
        revalidatePath(`/anime/${mediaId}`);
        
        return { success: true, message: "Rating submitted successfully!" };
    } catch (error: any) {
        console.error("Error submitting rating:", error);
        return { success: false, message: error.message || "Failed to submit rating." };
    }
}
