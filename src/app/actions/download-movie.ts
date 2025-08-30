
'use server';

interface DownloadResult {
    success: boolean;
    message: string;
    output?: string;
}

// This function has been disabled.
export async function downloadMovieAction(movieName: string, year: number): Promise<DownloadResult> {
    console.log(`Received request to download: ${movieName} (${year})`);

    return { 
        success: false, 
        message: `This download method is currently disabled.` 
    };
}
