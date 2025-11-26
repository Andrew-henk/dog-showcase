import { TestBed } from '@angular/core/testing';
import { DogService } from './dog.service';

describe('DogService', () => {
  let service: DogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DogService);
  });

  it('should fetch and return dog images', async () => {
    const mockResponse = {
      message: [
        'https://images.dog.ceo/breeds/husky/dog1.jpg',
        'https://images.dog.ceo/breeds/beagle/dog2.jpg',
      ],
      status: 'success',
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)
    );

    const result = await service.getRandomDogs(2);

    expect(result.length).toBe(2);
    expect(result[0].breed).toBe('Husky');
    expect(result[1].breed).toBe('Beagle');
  });

  it('should extract breed from URL', () => {
    expect(
      service.extractBreedFromUrl('https://images.dog.ceo/breeds/husky/dog.jpg')
    ).toBe('Husky');
    expect(
      service.extractBreedFromUrl(
        'https://images.dog.ceo/breeds/terrier-australian/dog.jpg'
      )
    ).toBe('Australian Terrier');
  });
});
