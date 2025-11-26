import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { DogService } from './services/dog.service';
import { FavoritesService } from './services/favorites.service';

describe('App Component', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let favoritesService: FavoritesService;

  beforeEach(async () => {
    const dogServiceMock = {
      getRandomDogs: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: DogService, useValue: dogServiceMock },
        FavoritesService,
      ],
    }).compileComponents();

    favoritesService = TestBed.inject(FavoritesService);
    localStorage.clear();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  it('should add dog to favorites', () => {
    const dog = { url: 'test.jpg', breed: 'Husky' };
    component['selectedDog'].set(dog);

    component['addToFavorites']();

    expect(favoritesService.favorites().length).toBe(1);
    expect(component['isFavorited']()).toBe(true);
  });
});
