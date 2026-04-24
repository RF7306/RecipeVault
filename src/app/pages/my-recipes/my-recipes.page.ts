import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonBadge, IonToast, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline, bookmarkOutline, timeOutline, cameraOutline } from 'ionicons/icons';
import { StorageService } from '../../services/storage.service';
import { CameraService } from '../../services/camera.service';
import { SavedRecipe } from '../../models/recipe.model';

@Component({
  selector: 'app-my-recipes',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonCardContent, IonBadge, IonToast
  ],
  templateUrl: './my-recipes.page.html',
  styleUrls: ['./my-recipes.page.scss']
})
export class MyRecipesPage implements OnInit {
  savedRecipes: SavedRecipe[] = [];
  toastMessage = '';
  showToast = false;

  constructor(
    private storageService: StorageService,
    private cameraService: CameraService,
    private router: Router,
    private alertCtrl: AlertController
  ) {
    addIcons({ trashOutline, bookmarkOutline, timeOutline, cameraOutline });
  }

  ngOnInit(): void {
    this.loadSavedRecipes();
  }

  ionViewWillEnter(): void {
    this.loadSavedRecipes();
  }

  private async loadSavedRecipes(): Promise<void> {
    this.savedRecipes = await this.storageService.getFavourites();
  }

  openRecipe(recipe: SavedRecipe): void {
    this.router.navigate(['/recipe', recipe.id]);
  }

  async confirmRemove(recipe: SavedRecipe): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Remove Recipe',
      message: `Remove "${recipe.title}" from saved recipes?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Remove',
          role: 'destructive',
          handler: async () => {
            await this.storageService.removeFavourite(recipe.id);
            await this.loadSavedRecipes();
            this.presentToast('Recipe removed');
          }
        }
      ]
    });
    await alert.present();
  }

  async updatePhoto(recipe: SavedRecipe): Promise<void> {
    const url = await this.cameraService.capturePhoto();
    if (url) {
      await this.storageService.updateFavouritePhoto(recipe.id, url);
      await this.loadSavedRecipes();
      this.presentToast('Photo updated ✨');
    }
  }

  getTotalTime(recipe: SavedRecipe): number {
    return recipe.prepTime + recipe.cookTime;
  }

  presentToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
  }
}
