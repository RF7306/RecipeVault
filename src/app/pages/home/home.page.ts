import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
  IonChip, IonLabel, IonCard, IonCardHeader, IonCardTitle,
  IonCardSubtitle, IonCardContent, IonBadge, IonIcon, IonSkeletonText,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, flameOutline, starOutline } from 'ionicons/icons';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
    IonChip, IonLabel, IonCard, IonCardHeader, IonCardTitle,
    IonCardSubtitle, IonCardContent, IonBadge, IonIcon, IonSkeletonText,
    IonSpinner
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
  filteredRecipes: Recipe[] = [];
  categories: string[] = [];
  activeCategory = 'All';
  searchTerm = '';
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private recipeService: RecipeService,
    private router: Router
  ) {
    addIcons({ timeOutline, flameOutline, starOutline });
  }

  ngOnInit(): void {
    this.recipeService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(cats => (this.categories = cats));

    this.recipeService.getFilteredRecipes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(recipes => {
        this.filteredRecipes = recipes;
        this.isLoading = false;
      });
  }

  onSearchChange(event: CustomEvent): void {
    this.searchTerm = event.detail.value ?? '';
    this.recipeService.updateSearchTerm(this.searchTerm);
  }

  selectCategory(category: string): void {
    this.activeCategory = category;
    this.recipeService.updateActiveCategory(category);
  }

  openRecipe(recipe: Recipe): void {
    this.router.navigate(['/recipe', recipe.id]);
  }

  getTotalTime(recipe: Recipe): number {
    return recipe.prepTime + recipe.cookTime;
  }

  trackById(_index: number, recipe: Recipe): number {
    return recipe.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
