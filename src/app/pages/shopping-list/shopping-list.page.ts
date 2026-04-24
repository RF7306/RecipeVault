import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonIcon, IonItem, IonCheckbox, IonLabel, IonNote,
  IonList, IonListHeader, IonBadge, IonToast
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline, checkmarkDoneOutline, cartOutline } from 'ionicons/icons';
import { MealPlanService } from '../../services/meal-plan.service';
import { ShoppingListItem } from '../../models/recipe.model';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonIcon, IonItem, IonCheckbox, IonLabel, IonNote,
    IonList, IonListHeader, IonBadge, IonToast
  ],
  templateUrl: './shopping-list.page.html',
  styleUrls: ['./shopping-list.page.scss']
})
export class ShoppingListPage implements OnInit, OnDestroy {
  shoppingList: ShoppingListItem[] = [];
  toastMessage = '';
  showToast = false;

  private destroy$ = new Subject<void>();

  constructor(private mealPlanService: MealPlanService) {
    addIcons({ trashOutline, checkmarkDoneOutline, cartOutline });
  }

  ngOnInit(): void {
    this.mealPlanService.shoppingList$
      .pipe(takeUntil(this.destroy$))
      .subscribe(list => (this.shoppingList = list));
  }

  async toggleItem(item: ShoppingListItem): Promise<void> {
    await this.mealPlanService.toggleShoppingItem(item.name);
  }

  async clearChecked(): Promise<void> {
    await this.mealPlanService.clearCheckedItems();
    this.presentToast('Checked items removed');
  }

  get uncheckedItems(): ShoppingListItem[] {
    return this.shoppingList.filter(i => !i.checked);
  }

  get checkedItems(): ShoppingListItem[] {
    return this.shoppingList.filter(i => i.checked);
  }

  presentToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
