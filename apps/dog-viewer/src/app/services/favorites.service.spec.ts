import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoritesService);
  });

  it('should add and remove favorites', () => {
    const dog = { url: 'test.jpg', breed: 'Husky' };

    service.add(dog);
    expect(service.favorites().length).toBe(1);
    expect(service.isFavorited(dog.url)).toBe(true);

    service.removeDog(dog);
    expect(service.favorites().length).toBe(0);
  });
});
