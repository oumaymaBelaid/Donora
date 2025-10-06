import { Component } from '@angular/core';
import { CampaignService } from 'src/app/services/campaign.service';
import { Campaign } from 'src/app/models/campaign.model';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  campaigns: Campaign[] = [];

  constructor(private cs: CampaignService, private nav: NavController) {}

  async ionViewWillEnter() {
    this.campaigns = await this.cs.getAll();
  }

  goToAdd() { this.nav.navigateForward('/pages/add-campaign'); }

  goToDetails(id: number) { this.nav.navigateForward(['/pages/details', id]); }
}
