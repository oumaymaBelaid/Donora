import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonButton, IonList, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignService } from 'src/app/services/campaign.service';
import { Campaign } from 'src/app/models/campaign.model';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonButton, IonList, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, CommonModule, FormsModule]
})
export class DetailsPage {
  campaign?: Campaign;
  donorId = '';

  constructor(private route: ActivatedRoute, private router: Router, private cs: CampaignService) {
    this.load();
  }

  async load() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.campaign = await this.cs.getById(id);
  }

  async register() {
    if (!this.campaign?.id || !this.donorId) return;
    await this.cs.registerParticipant(this.campaign.id, this.donorId);
    await this.load();
  }
}
