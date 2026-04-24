import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'meal-planner',
        loadComponent: () => import('./pages/meal-planner/meal-planner.page').then(m => m.MealPlannerPage)
      },
      {
        path: 'shopping-list',
        loadComponent: () => import('./pages/shopping-list/shopping-list.page').then(m => m.ShoppingListPage)
      },
      {
        path: 'my-recipes',
        loadComponent: () => import('./pages/my-recipes/my-recipes.page').then(m => m.MyRecipesPage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'recipe/:id',
    loadComponent: () => import('./pages/recipe-detail/recipe-detail.page').then(m => m.RecipeDetailPage)
  },
  {
    path: '**',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];
