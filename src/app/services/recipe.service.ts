import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Recipe } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly jsonUrl =
    'https://raw.githubusercontent.com/YOUR_USERNAME/recipevault/main/src/assets/data/recipes.json';
  private readonly fallbackUrl = 'assets/data/recipes.json';

  private recipesSubject = new BehaviorSubject<Recipe[]>([]);
  recipes$ = this.recipesSubject.asObservable();

  private searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject.asObservable();

  private activeCategorySubject = new BehaviorSubject<string>('All');
  activeCategory$ = this.activeCategorySubject.asObservable();

  constructor(private http: HttpClient) {}

  loadRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.jsonUrl).pipe(
      catchError(() => this.http.get<Recipe[]>(this.fallbackUrl)),
      tap(recipes => this.recipesSubject.next(recipes)),
      catchError(() => of([]))
    );
  }

  getRecipeById(id: number): Observable<Recipe | undefined> {
    return this.recipes$.pipe(
      map(recipes => recipes.find(r => r.id === id))
    );
  }

  getCategories(): Observable<string[]> {
    return this.recipes$.pipe(
      map(recipes => {
        const categories = [...new Set(recipes.map(r => r.category))];
        return ['All', ...categories];
      })
    );
  }

  getFilteredRecipes(): Observable<Recipe[]> {
    return this.recipes$.pipe(
      map(recipes => {
        const term = this.searchTermSubject.value.toLowerCase();
        const category = this.activeCategorySubject.value;
        return recipes.filter(recipe => {
          const matchesSearch =
            !term ||
            recipe.title.toLowerCase().includes(term) ||
            recipe.tags.some(t => t.includes(term)) ||
            recipe.cuisine.toLowerCase().includes(term);
          const matchesCategory =
            category === 'All' || recipe.category === category;
          return matchesSearch && matchesCategory;
        });
      })
    );
  }

  updateSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
  }

  updateActiveCategory(category: string): void {
    this.activeCategorySubject.next(category);
  }

  getDifficultyColor(difficulty: string): string {
    const colorMap: Record<string, string> = {
      Easy: 'success',
      Medium: 'warning',
      Hard: 'danger'
    };
    return colorMap[difficulty] ?? 'medium';
  }

  scaleIngredientAmount(baseAmount: number, baseServings: number, targetServings: number): number {
    const scaled = (baseAmount / baseServings) * targetServings;
    return Math.round(scaled * 10) / 10;
  }
}
