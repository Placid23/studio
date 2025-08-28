
'use server';

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface DownloadResult {
    success: boolean;
    message: string;
    output?: string;
}

// This function executes a local Node.js script to download a movie.
export async function downloadMovieAction(movieName: string, year: number): Promise<DownloadResult> {
    console.log(`Received request to download: ${movieName} (${year})`);

    // Basic sanitization to prevent command injection
    const sanitizedMovieName = movieName.replace(/[^a-zA-Z0-9\s-]/g, '');
    const sanitizedYear = String(year).replace(/[^0-9]/g, '');
    const outputFileName = `${sanitizedMovieName.replace(/\s/g, '_')}_${sanitizedYear}.mp4`;

    const command = `node movie_downloader.js --site "https://fzmovies.live" --query "${sanitizedMovieName} ${sanitizedYear}" --out "${outputFileName}" --headless true`;

    console.log(`Executing command: ${command}`);

    try {
        // We are executing a local script. This requires the server environment
        // to have Node.js, Puppeteer, and a compatible Chrome/Chromium installed.
        const { stdout, stderr } = await execAsync(command, { timeout: 300000 }); // 5 minute timeout

        if (stderr) {
            console.error(`Script stderr: ${stderr}`);
            // Continue if stderr has content, as some tools log progress to stderr.
            // A true failure will typically throw an error.
        }

        console.log(`Script stdout: ${stdout}`);
        
        return { 
            success: true, 
            message: `Download process for "${movieName}" started successfully. Check server logs for progress.`,
            output: stdout,
        };

    } catch (error: any) {
        console.error('Error executing download script:', error);
        return { 
            success: false, 
            message: `Failed to start download for "${movieName}". Error: ${error.message}` 
        };
    }
}
