import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonList, IonText } from '@ionic/angular/standalone';
import { CampaignService } from 'src/app/services/campaign.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonList, IonText, CommonModule, FormsModule]
})
export class ProfilePage {
  donorId = '';
  history: Array<{ donorId: string; campaignId: number; date: string }> = [];

  constructor(private cs: CampaignService) {}

  async loadHistory() {
    this.history = await this.cs.getHistoryForDonor(this.donorId);
  }
}
