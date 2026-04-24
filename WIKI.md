# RecipeVault — User Guide

## Overview

RecipeVault is a Progressive Web Application built with Ionic 7 and Angular 17. It allows users to browse recipes, plan weekly meals, generate a shopping list automatically, and save their favourite dishes with personal photos.

---

## Getting Started

### Prerequisites

- Node.js 18 or above
- npm 9 or above
- Ionic CLI 7 or above

```bash
npm install -g @ionic/cli
```

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/recipevault.git
cd recipevault
npm install
ionic serve
```

The app will open at `http://localhost:8100`.

---

## Features

### Recipes Tab
- Browse all recipes in a responsive grid
- Search by recipe name, cuisine, or tag using the live search bar
- Filter by category using the chip selector (e.g. Pasta, Curry, Dessert)
- Tap any recipe card to open the full detail view

### Recipe Detail Page
- View full ingredients list, step-by-step instructions, and nutritional info
- **Serving scaler** — adjust the servings slider and all ingredient amounts update live using two-way data binding
- Tap any step to mark it as completed
- Add the recipe to today's meal plan directly from this page
- Save/unsave the recipe using the heart icon
- Take or upload a photo of your finished dish using the camera button

### Meal Planner Tab
- View a 7-day rolling plan starting from today
- Tap **Add recipe** on any breakfast, lunch, or dinner slot to pick a recipe
- Tap a recipe card to navigate to its detail page
- Tap the × button to remove a meal from the plan
- The shopping list updates automatically when meals are added or removed
- Use the trash icon in the header to clear the entire week

### Shopping List Tab
- Automatically generated from all planned meals
- Ingredients from multiple recipes are aggregated (e.g. 3 onions across 3 recipes = 3 total)
- Tap any item to mark it as collected
- Tap the trash icon to remove all checked items

### Saved Recipes Tab
- All recipes you have hearted appear here
- Each card shows whether you have added a personal photo (camera badge)
- Tap **Photo** to retake or update your photo using the device camera
- Tap the trash icon to remove a recipe from your saved list

---

## Technical Architecture

| Requirement | Implementation |
|---|---|
| Angular standalone components | All pages and the app shell use `standalone: true` |
| Angular Router | 5 routes including a parameterised detail route `/recipe/:id` |
| Data binding | Interpolation throughout; `[(ngModel)]` on the servings slider |
| HttpClient + Observable | `RecipeService.loadRecipes()` fetches JSON from an external URL |
| IonicStorage | Favourites, meal plan, and shopping list persisted across sessions |
| Capacitor Camera | Used on recipe detail and saved recipes pages; works on mobile and desktop |
| No code comments | All logic is expressed through descriptive naming and clean architecture |

---

## Project Structure

```
src/
  app/
    models/         recipe.model.ts — interfaces for Recipe, MealPlanDay, ShoppingListItem
    services/       recipe, storage, meal-plan, camera services
    pages/          home, recipe-detail, meal-planner, shopping-list, my-recipes
    tabs/           ion-tabs shell component
  assets/
    data/           recipes.json — fetched via HttpClient
  theme/            Ionic CSS variable overrides
```

---

## Innovation Highlights

- **Live ingredient scaling** — two-way data binding on a range slider recalculates every ingredient amount proportionally in real time
- **Auto shopping list generation** — ingredients from all planned meals are aggregated by name and unit, deduplicating across recipes
- **User dish photos** — Capacitor Camera plugin lets users photograph their finished dish and attach it to a saved recipe, replacing the default image
- **Step completion tracker** — users can tick off cooking steps as they cook, with visual strikethrough feedback
- **Dark mode** — full dark theme support via CSS media query in `variables.scss`
- **Skeleton loading screens** — placeholder cards animate while recipes load from the JSON endpoint

---

## Known Limitations

- The JSON data URL must be accessible at runtime. If the remote URL is unavailable the app falls back to `assets/data/recipes.json`.
- Camera functionality requires permission grants on first use on mobile devices.
