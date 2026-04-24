import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MealPlanDay, Recipe, ShoppingListItem } from '../models/recipe.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class MealPlanService {
  private readonly MEAL_PLAN_KEY = 'rv_meal_plan';
  private readonly SHOPPING_LIST_KEY = 'rv_shopping_list';

  private mealPlanSubject = new BehaviorSubject<MealPlanDay[]>([]);
  mealPlan$ = this.mealPlanSubject.asObservable();

  private shoppingListSubject = new BehaviorSubject<ShoppingListItem[]>([]);
  shoppingList$ = this.shoppingListSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    const plan = await this.storageService.get<MealPlanDay[]>(this.MEAL_PLAN_KEY);
    const list = await this.storageService.get<ShoppingListItem[]>(this.SHOPPING_LIST_KEY);
    this.mealPlanSubject.next(plan ?? this.buildEmptyWeek());
    this.shoppingListSubject.next(list ?? []);
  }

  buildEmptyWeek(): MealPlanDay[] {
    const days: MealPlanDay[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({ date: date.toISOString().split('T')[0] });
    }
    return days;
  }

  async assignRecipe(
    date: string,
    mealType: 'breakfast' | 'lunch' | 'dinner',
    recipe: Recipe
  ): Promise<void> {
    const current = this.mealPlanSubject.value;
    const updated = current.map(day =>
      day.date === date ? { ...day, [mealType]: recipe } : day
    );
    this.mealPlanSubject.next(updated);
    await this.storageService.set(this.MEAL_PLAN_KEY, updated);
    await this.regenerateShoppingList(updated);
  }

  async removeRecipe(
    date: string,
    mealType: 'breakfast' | 'lunch' | 'dinner'
  ): Promise<void> {
    const current = this.mealPlanSubject.value;
    const updated = current.map(day => {
      if (day.date === date) {
        const updatedDay = { ...day };
        delete updatedDay[mealType];
        return updatedDay;
      }
      return day;
    });
    this.mealPlanSubject.next(updated);
    await this.storageService.set(this.MEAL_PLAN_KEY, updated);
    await this.regenerateShoppingList(updated);
  }

  private async regenerateShoppingList(plan: MealPlanDay[]): Promise<void> {
    const aggregated = new Map<string, ShoppingListItem>();

    plan.forEach(day => {
      [day.breakfast, day.lunch, day.dinner].forEach(recipe => {
        if (!recipe) return;
        recipe.ingredients.forEach(ingredient => {
          const key = `${ingredient.name.toLowerCase()}_${ingredient.unit}`;
          if (aggregated.has(key)) {
            const existing = aggregated.get(key)!;
            aggregated.set(key, { ...existing, amount: existing.amount + ingredient.amount });
          } else {
            aggregated.set(key, {
              name: ingredient.name,
              amount: ingredient.amount,
              unit: ingredient.unit,
              checked: false
            });
          }
        });
      });
    });

    const newList = Array.from(aggregated.values());
    const existingList = this.shoppingListSubject.value;
    const mergedList = newList.map(item => {
      const existing = existingList.find(
        e => e.name.toLowerCase() === item.name.toLowerCase() && e.unit === item.unit
      );
      return existing ? { ...item, checked: existing.checked } : item;
    });

    this.shoppingListSubject.next(mergedList);
    await this.storageService.set(this.SHOPPING_LIST_KEY, mergedList);
  }

  async toggleShoppingItem(itemName: string): Promise<void> {
    const updated = this.shoppingListSubject.value.map(item =>
      item.name === itemName ? { ...item, checked: !item.checked } : item
    );
    this.shoppingListSubject.next(updated);
    await this.storageService.set(this.SHOPPING_LIST_KEY, updated);
  }

  async clearCheckedItems(): Promise<void> {
    const updated = this.shoppingListSubject.value.filter(item => !item.checked);
    this.shoppingListSubject.next(updated);
    await this.storageService.set(this.SHOPPING_LIST_KEY, updated);
  }

  async clearMealPlan(): Promise<void> {
    const emptyWeek = this.buildEmptyWeek();
    this.mealPlanSubject.next(emptyWeek);
    this.shoppingListSubject.next([]);
    await this.storageService.set(this.MEAL_PLAN_KEY, emptyWeek);
    await this.storageService.set(this.SHOPPING_LIST_KEY, []);
  }

  getPlannedMealCount(): number {
    return this.mealPlanSubject.value.reduce((count, day) => {
      return count + (day.breakfast ? 1 : 0) + (day.lunch ? 1 : 0) + (day.dinner ? 1 : 0);
    }, 0);
  }

  formatDayLabel(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }
}
