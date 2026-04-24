export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface RecipeNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: number;
  title: string;
  category: string;
  cuisine: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  imageUrl: string;
  description: string;
  tags: string[];
  ingredients: RecipeIngredient[];
  steps: string[];
  nutrition: RecipeNutrition;
  userPhotoUrl?: string;
}

export interface MealPlanDay {
  date: string;
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
}

export interface ShoppingListItem {
  name: string;
  amount: number;
  unit: string;
  checked: boolean;
}

export interface SavedRecipe extends Recipe {
  savedAt: string;
  userPhotoUrl?: string;
}
