import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton,
  IonButtons, IonButton, IonIcon, IonBadge, IonChip, IonLabel,
  IonItem, IonRange, IonNote, IonList, IonListHeader,
  IonToast, AlertController, ActionSheetController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  heartOutline, heart, timeOutline, peopleOutline,
  restaurantOutline, calendarOutline, checkmarkCircle,
  ellipsisHorizontal, cameraOutline, shareOutline
} from 'ionicons/icons';
import { RecipeService } from '../../services/recipe.service';
import { StorageService } from '../../services/storage.service';
import { MealPlanService } from '../../services/meal-plan.service';
import { CameraService } from '../../services/camera.service';
import { Recipe, RecipeIngredient } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton,
    IonButtons, IonButton, IonIcon, IonBadge, IonChip, IonLabel,
    IonItem, IonRange, IonNote, IonList, IonListHeader, IonToast
  ],
  templateUrl: './recipe-detail.page.html',
  styleUrls: ['./recipe-detail.page.scss']
})
export class RecipeDetailPage implements OnInit, OnDestroy {
  recipe: Recipe | null = null;
  isFavourite = false;
  servings = 4;
  activeTab: 'ingredients' | 'steps' | 'nutrition' = 'ingredients';
  toastMessage = '';
  showToast = false;
  userPhoto: string | null = null;
  completedSteps = new Set<number>();

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private storageService: StorageService,
    private mealPlanService: MealPlanService,
    private cameraService: CameraService,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController
  ) {
    addIcons({
      heartOutline, heart, timeOutline, peopleOutline,
      restaurantOutline, calendarOutline, checkmarkCircle,
      ellipsisHorizontal, cameraOutline, shareOutline
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        const id = Number(params.get('id'));
        return this.recipeService.getRecipeById(id);
      })
    ).subscribe(recipe => {
      if (recipe) {
        this.recipe = recipe;
        this.servings = recipe.servings;
        this.checkFavouriteStatus(recipe.id);
      }
    });
  }

  private async checkFavouriteStatus(id: number): Promise<void> {
    this.isFavourite = await this.storageService.isFavourite(id);
    const favourites = await this.storageService.getFavourites();
    const saved = favourites.find(r => r.id === id);
    this.userPhoto = saved?.userPhotoUrl ?? null;
  }

  async toggleFavourite(): Promise<void> {
    if (!this.recipe) return;
    if (this.isFavourite) {
      await this.storageService.removeFavourite(this.recipe.id);
      this.isFavourite = false;
      this.presentToast('Removed from saved recipes');
    } else {
      await this.storageService.saveFavourite({ ...this.recipe, savedAt: new Date().toISOString() });
      this.isFavourite = true;
      this.presentToast('Added to saved recipes ❤️');
    }
  }

  scaleAmount(ingredient: RecipeIngredient): number {
    if (!this.recipe) return ingredient.amount;
    return this.recipeService.scaleIngredientAmount(
      ingredient.amount,
      this.recipe.servings,
      this.servings
    );
  }

  async addToMealPlan(): Promise<void> {
    if (!this.recipe) return;
    const alert = await this.alertCtrl.create({
      header: 'Add to Meal Plan',
      message: `Add "${this.recipe.title}" to which meal?`,
      inputs: [
        { label: 'Breakfast', type: 'radio', value: 'breakfast' },
        { label: 'Lunch', type: 'radio', value: 'lunch' },
        { label: 'Dinner', type: 'radio', value: 'dinner' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: async (mealType: 'breakfast' | 'lunch' | 'dinner') => {
            if (!this.recipe || !mealType) return;
            const today = new Date().toISOString().split('T')[0];
            await this.mealPlanService.assignRecipe(today, mealType, this.recipe);
            this.presentToast(`Added to today's ${mealType} 📅`);
          }
        }
      ]
    });
    await alert.present();
  }

  async takePhoto(): Promise<void> {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Add your photo',
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera-outline',
          handler: async () => {
            const url = await this.cameraService.capturePhoto();
            if (url && this.recipe) {
              this.userPhoto = url;
              if (this.isFavourite) {
                await this.storageService.updateFavouritePhoto(this.recipe.id, url);
              } else {
                await this.storageService.saveFavourite({ ...this.recipe, savedAt: new Date().toISOString(), userPhotoUrl: url });
                this.isFavourite = true;
              }
              this.presentToast('Photo saved! ✨');
            }
          }
        },
        {
          text: 'Choose from Gallery',
          icon: 'share-outline',
          handler: async () => {
            const url = await this.cameraService.pickFromGallery();
            if (url && this.recipe) {
              this.userPhoto = url;
              if (this.isFavourite) {
                await this.storageService.updateFavouritePhoto(this.recipe.id, url);
              } else {
                await this.storageService.saveFavourite({ ...this.recipe, savedAt: new Date().toISOString(), userPhotoUrl: url });
                this.isFavourite = true;
              }
              this.presentToast('Photo saved! ✨');
            }
          }
        },
        { text: 'Cancel', role: 'cancel' }
      ]
    });
    await sheet.present();
  }

  toggleStep(index: number): void {
    if (this.completedSteps.has(index)) {
      this.completedSteps.delete(index);
    } else {
      this.completedSteps.add(index);
    }
  }

  isStepComplete(index: number): boolean {
    return this.completedSteps.has(index);
  }

  presentToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
  }

  setActiveTab(tab: 'ingredients' | 'steps' | 'nutrition'): void {
    this.activeTab = tab;
  }

  getTotalTime(): number {
    if (!this.recipe) return 0;
    return this.recipe.prepTime + this.recipe.cookTime;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
