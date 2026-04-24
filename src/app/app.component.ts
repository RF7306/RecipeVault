import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { RecipeService } from './services/recipe.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  template: `<ion-app><ion-router-outlet /></ion-app>`
})
export class AppComponent implements OnInit {
  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.recipeService.loadRecipes().subscribe();
  }
}
