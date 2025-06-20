# **App Name**: NovaStream

## Core Features:

- Home Page Carousels: Home page featuring 'Trending Now' and genre-based carousels. Each carousel is horizontally scrollable.
- Movie Details Page: Details page featuring the Movie's title, year, duration, genre(s), rating, synopsis, cast list, trailer player and an 'Add to Watchlist' button.
- Search Page: Search bar with live filtering. Filter by: Title, Genre, Rating, Year. Debounced input for performance.
- AI-Powered Suggestions: When viewing a movie, use Gemini (or OpenAI/Genkit) to suggest 'You might also like...' based on movie themes, genre, similar cast/director, viewer history (optional). Integrated as a backend API using Genkit (or Google Cloud Functions)

## Style Guidelines:

- Clean, visual-first, Netflix-style interface. Responsive Grid (mobile, tablet, desktop). Emphasis on poster and thumbnail art
- Background: #0f0f0f (deep black/gray)
- Accent: #e50914 (Netflix red)
- CTA Buttons: #1db954 (Spotify green) or #ff3c00 (bold orange)
- Text Primary: #ffffff
- Text Secondary: #b3b3b3
- Font: 'Inter', sans-serif
- Headings: Bold, all-caps for sections
- Body text: Medium weight, clean spacing
- Use minimalist icons: White filled/outlined from `Lucide` or `Heroicons`. Consistent size (e.g., 24px)