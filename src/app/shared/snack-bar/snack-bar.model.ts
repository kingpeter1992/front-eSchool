export type SnackBarType = 'success' | 'error' | 'warning' | 'info' | 'question';

export interface SnackBarData {
  title?: string;
  message: string;
  type: SnackBarType;
  memeUrl?: string; // URL personnalisée optionnelle
  actionText?: string;
  onAction?: () => void;
}

// Memes/GIFs par défaut selon le contexte
export const DEFAULT_MEMES: Record<SnackBarType, string> = {
  question: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z0ZjR5eGZvd24wbXZ3eW4zeTNqODJzaXp2MmE4ZnhzeXZzNTB5ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7buirYcmV5nSwIRW/giphy.gif', // Confused / Thinking meme
  success: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOW11dzE3YmtueWV1ZDVvdTh6MG14d3B3M3I5M24wbHFqODN2dWV6eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cMso9wDwqSy3e/giphy.gif', // Leonardo DiCaprio Cheers
  error: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXZkMXpxN2JvdWp2OHBqdW40NDRqdTNtdG12cmZhMnEwbTBvdXV1bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hEc4k52gPJIXm/giphy.gif', // Tableflip / Facepalm
  warning: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXE4Zm94dzNwc3YyaWVxbGtrZmIyb20xNDM2bnI1YTR6OTNydTJuMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/51Uiuy5QBZNko/giphy.gif', // Surprised
  info: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTh1eWNmdWNsbzl5MHFuOHlxbTV0OHkxcTF0ZHBpY2d5eHZhbDZ3ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LpLd2NGvpaiys/giphy.gif' // Mind Blown
};
