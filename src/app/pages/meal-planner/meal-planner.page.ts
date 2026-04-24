import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonChip, IonLabel, IonAlert, IonToast, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, closeOutline, trashOutline,
  sunnyOutline, partlySunnyOutline, moonOutline
} from 'ionicons/icons';
import { MealPlanService } from '../../services/meal-plan.service';
import { RecipeService } from '../../services/recipe.service';
import { MealPlanDay, Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-meal-planner',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonChip, IonLabel, IonToast, IonAlert
  ],
  templateUrl: './meal-planner.page.html',
  styleUrls: ['./meal-planner.page.scss']
})
export class MealPlannerPage implements OnInit, OnDestroy {
  mealPlan: MealPlanDay[] = [];
  availableRecipes: Recipe[] = [];
  toastMessage = '';
  showToast = false;

  private destroy$ = new Subject<void>();

  readonly mealTypes: Array<'breakfast' | 'lunch' | 'dinner'> = ['breakfast', 'lunch', 'dinner'];
  readonly mealIcons: Record<string, string> = {
    breakfast: 'sunny-outline',
    lunch: 'partly-sunny-outline',
    dinner: 'moon-outline'
  };

  constructor(
    private mealPlanService: MealPlanService,
    private recipeService: RecipeService,
    private router: Router,
    private alertCtrl: AlertController
  ) {
    addIcons({ addOutline, closeOutline, trashOutline, sunnyOutline, partlySunnyOutline, moonOutline });
  }

  ngOnInit(): void {
    this.mealPlanService.mealPlan$
      .pipe(takeUntil(this.destroy$))
      .subscribe(plan => (this.mealPlan = plan));

    this.recipeService.recipes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(recipes => (this.availableRecipes = recipes));
  }

  formatDay(dateString: string): string {
    return this.mealPlanService.formatDayLabel(dateString);
  }

  getRecipeForMeal(day: MealPlanDay, mealType: 'breakfast' | 'lunch' | 'dinner'): Recipe | undefined {
    return day[mealType];
  }

  async pickRecipe(day: MealPlanDay, mealType: 'breakfast' | 'lunch' | 'dinner'): Promise<void> {
    const inputs = this.availableRecipes.map(recipe => ({
      label: recipe.title,
      type: 'radio' as const,
      value: recipe.id
    }));

    const alert = await this.alertCtrl.create({
      header: `Pick ${mealType}`,
      subHeader: this.formatDay(day.date),
      inputs,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: async (recipeId: number) => {
            const recipe = this.availableRecipes.find(r => r.id === recipeId);
            if (recipe) {
              await this.mealPlanService.assignRecipe(day.date, mealType, recipe);
              this.presentToast(`${recipe.title} added to ${mealType}`);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async removeFromPlan(day: MealPlanDay, mealType: 'breakfast' | 'lunch' | 'dinner'): Promise<void> {
    await this.mealPlanService.removeRecipe(day.date, mealType);
    this.presentToast('Meal removed from plan');
  }

  openRecipe(recipe: Recipe): void {
    this.router.navigate(['/recipe', recipe.id]);
  }

  async clearPlan(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Clear Meal Plan',
      message: 'This will remove all meals and regenerate the shopping list. Are you sure?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Clear',
          role: 'destructive',
          handler: async () => {
            await this.mealPlanService.clearMealPlan();
            this.presentToast('Meal plan cleared');
          }
        }
      ]
    });
    await alert.present();
  }

  presentToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
  }

  get plannedMealCount(): number {
    return this.mealPlanService.getPlannedMealCount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
