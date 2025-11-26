import { Component, signal, computed, resource, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DogService, DogImage } from './services/dog.service';
import { FavoritesService } from './services/favorites.service';

/** Keeping this simpleish. As needed we could move this feature to a route instead of the root
 *  For now we'll start with adding in what we need and splitting it out if it gets too clunky
 *
 *  Focus of this app is to view random dogs, and favorite select dog images
 *  Assumption: we'll probably want to shuffle images, but keep our favorites
 */
@Component({
  imports: [CommonModule],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  // services
  private dogService = inject(DogService);
  public favoritesService = inject(FavoritesService);

  // Signals for state management
  protected selectedDog = signal<DogImage | null>(null);
  protected randomDogsCount = signal(10);

  /**
   * https://dog.ceo/dog-api/documentation/random
   * Now using DogService for API calls with error handling
   */
  protected dogImages = resource({
    loader: async () => {
      const count = this.randomDogsCount();
      return await this.dogService.getRandomDogs(count);
    }
  });

  // Computed signal to check if current dog is favorited
  protected isFavorited = computed(() => {
    const current = this.selectedDog();
    if (!current) return false;
    return this.favoritesService.isFavorited(current.url);
  });

  // Computed signal for the main display dog (selected or first from list)
  protected mainDog = computed(() => {
    const selected = this.selectedDog();
    if (selected) return selected;

    const images = this.dogImages.value();
    if (images && images.length > 0) {
      return images[0];
    }

    return null;
  });

  // Auto-select random dog when images load
  private autoSelectEffect = effect(() => {
    const images = this.dogImages.value();
    if (images && images.length > 0 && !this.selectedDog()) {
      // Pick a random dog from the batch
      const randomIndex = Math.floor(Math.random() * images.length);
      this.selectedDog.set(images[randomIndex]);
    }
  });

  // Add current dog to favorites (uses service)
  protected addToFavorites(): void {
    const current = this.selectedDog();
    if (current && !this.isFavorited()) {
      this.favoritesService.add(current);
    }
  }

  // Refresh dog images while keeping favorites
  protected refreshDogs(): void {
    // Clear selection so effect will pick a new hero from shuffled dogs
    this.selectedDog.set(null);
    this.dogImages.reload();
  }
}
