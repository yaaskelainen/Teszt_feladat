/**
 * Utility functions for the frontend.
 */

/**
 * Combines multiple class names into a single string.
 */
export function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
