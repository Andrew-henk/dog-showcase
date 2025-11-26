import { Injectable, signal, effect } from '@angular/core';

export interface FavoriteDog {
  url: string;
  breed: string;
}

/**
 * Favorites Persistence Service
 * Handles saving/loading favorites with localStorage
 */
@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'dog-viewer-favorites';

  // Internal writable signal
  private _favorites = signal<FavoriteDog[]>([]);

  // Expose read-only signal
  public readonly favorites = this._favorites.asReadonly();

  constructor() {
    this.loadFromStorage();

    // Auto-save whenever favorites change
    effect(() => {
      const favs = this._favorites();
      this.saveToStorage(favs);
    });
  }

  /**
   * Load favorites from localStorage on init
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        // Validate structure
        if (Array.isArray(parsed)) {
          const validated = parsed.filter(item =>
            item &&
            typeof item.url === 'string' &&
            typeof item.breed === 'string'
          );

          this._favorites.set(validated);
          console.log(`Loaded ${validated.length} favorites from localStorage`);
        }
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error);
      // Reset to empty on error
      this._favorites.set([]);
    }
  }

  /**
   * Save favorites to localStorage
   */
  private saveToStorage(favorites: FavoriteDog[]): void {
    try {
      const serialized = JSON.stringify(favorites);
      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save favorites to localStorage:', error);
    }
  }

  /**
   * Add dog to favorites
   */
  add(dog: { url: string; breed: string }): boolean {
    // Check if already favorited
    if (this.isFavorited(dog.url)) {
      return false;
    }

    this._favorites.update(favs => [...favs, dog]);
    return true;
  }

  /**
   * Remove dog from favorites
   */
  removeDog(dog: { url: string }): boolean {
    const beforeLength = this._favorites().length;

    this._favorites.update(favs =>
      favs.filter(fav => fav.url !== dog.url)
    );

    return this._favorites().length < beforeLength;
  }

  /**
   * Check if dog is favorited
   */
  isFavorited(dogUrl: string): boolean {
    return this._favorites().some(fav => fav.url === dogUrl);
  }

}
