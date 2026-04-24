import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SavedRecipe } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private storageReady = new BehaviorSubject<boolean>(false);

  private readonly FAVOURITES_KEY = 'rv_favourites';

  constructor(private storage: Storage) {
    this.initialiseStorage();
  }

  private async initialiseStorage(): Promise<void> {
    await this.storage.create();
    this.storageReady.next(true);
  }

  private whenReady(): Observable<boolean> {
    return this.storageReady.pipe(
      map(ready => {
        if (!ready) throw new Error('Storage not ready');
        return ready;
      })
    );
  }

  async saveFavourite(recipe: SavedRecipe): Promise<void> {
    const current = await this.getFavourites();
    const exists = current.find(r => r.id === recipe.id);
    if (!exists) {
      current.push({ ...recipe, savedAt: new Date().toISOString() });
      await this.storage.set(this.FAVOURITES_KEY, current);
    }
  }

  async removeFavourite(recipeId: number): Promise<void> {
    const current = await this.getFavourites();
    const updated = current.filter(r => r.id !== recipeId);
    await this.storage.set(this.FAVOURITES_KEY, updated);
  }

  async getFavourites(): Promise<SavedRecipe[]> {
    const stored = await this.storage.get(this.FAVOURITES_KEY);
    return stored ?? [];
  }

  async isFavourite(recipeId: number): Promise<boolean> {
    const favourites = await this.getFavourites();
    return favourites.some(r => r.id === recipeId);
  }

  async updateFavouritePhoto(recipeId: number, photoUrl: string): Promise<void> {
    const current = await this.getFavourites();
    const updated = current.map(r =>
      r.id === recipeId ? { ...r, userPhotoUrl: photoUrl } : r
    );
    await this.storage.set(this.FAVOURITES_KEY, updated);
  }

  async set(key: string, value: unknown): Promise<void> {
    await this.storage.set(key, value);
  }

  async get<T>(key: string): Promise<T | null> {
    return this.storage.get(key);
  }

  async remove(key: string): Promise<void> {
    await this.storage.remove(key);
  }
}
