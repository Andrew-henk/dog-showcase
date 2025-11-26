import { Injectable } from '@angular/core';

export interface DogImage {
  url: string;
  breed: string;
}

interface DogApiResponse {
  message: string | string[];
  status: string;
}

/**
 * Dog API Service
 * Handles all Dog API interactions with error handling and retry logic
 */
@Injectable({
  providedIn: 'root'
})
export class DogService {
  private readonly API_BASE = 'https://dog.ceo/api';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  /**
   * Fetch random dog images with error handling and retry
   */
  async getRandomDogs(count: number): Promise<DogImage[]> {
    const response = await this.fetchWithRetry(
      `${this.API_BASE}/breeds/image/random/${count}`
    );
    const data: DogApiResponse = await response.json();

    if (data.status === 'success' && Array.isArray(data.message)) {
      return data.message.map(url => ({
        url,
        breed: this.extractBreedFromUrl(url)
      }));
    }

    throw new Error('Invalid API response format');
  }

  /**
   * Fetch with retry logic and exponential backoff
   * Actual fetch happens here
   */
  private async fetchWithRetry(url: string, retries = this.MAX_RETRIES): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        // If last retry, throw error
        if (i === retries - 1) {
          throw error;
        }

        // Exponential backoff: wait longer with each retry
        const delay = this.RETRY_DELAY * Math.pow(2, i);
        await this.sleep(delay);
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Extract breed name from Dog API image URL
   */
  extractBreedFromUrl(url: string): string {
    const parts = url.split('/');
    const breedIndex = parts.indexOf('breeds') + 1;

    if (breedIndex > 0 && breedIndex < parts.length) {
      const breedPart = parts[breedIndex];

      // Handle sub-breeds (e.g., "terrier-australian" -> "Australian Terrier")
      const breedNames = breedPart.split('-');
      if (breedNames.length > 1) {
        return breedNames.reverse().map(name =>
          name.charAt(0).toUpperCase() + name.slice(1)
        ).join(' ');
      }

      return breedPart.charAt(0).toUpperCase() + breedPart.slice(1);
    }

    return 'Unknown Breed';
  }
}
