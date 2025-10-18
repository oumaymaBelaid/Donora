import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonTextarea, IonDatetimeButton, IonModal, IonDatetime, IonSelect, IonSelectOption, IonButton, IonItem } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { NavController } from '@ionic/angular';
import { CampaignService } from 'src/app/services/campaign.service';
import { Campaign } from 'src/app/models/campaign.model';

@Component({
  selector: 'app-add-campaign',
  templateUrl: './add-campaign.page.html',
  styleUrls: ['./add-campaign.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonTextarea, IonDatetimeButton, IonModal, IonDatetime, IonSelect, IonSelectOption, IonButton, IonItem, CommonModule, FormsModule, RouterLink]
})
export class AddCampaignPage {
  model: Campaign = { title: '', description: '', date: new Date().toISOString(), location: '', bloodType: '' };

  constructor(private cs: CampaignService, private nav: NavController) {}

  onDateChange(ev: any) {
    const v = ev?.detail?.value;
    if (v) this.model.date = v;
  }

  async submit() {
    await this.cs.add({ ...this.model });
    this.nav.navigateBack('/home');
  }
}
