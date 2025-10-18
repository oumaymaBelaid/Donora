import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { CampaignService } from 'src/app/services/campaign.service';
import { Campaign } from 'src/app/models/campaign.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,               // 🔹 important pour Angular standalone
  imports: [CommonModule, FormsModule, IonicModule, RouterLink], // 🔹 pour reconnaître les balises <ion-...> et routerLink
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  campaigns: Campaign[] = [];
  query = '';
  filterType: string = 'all';
  get isAuthenticated() { return this.auth.isAuthenticated(); }
  get isOrg() { return this.auth.isOrg(); }

  constructor(private cs: CampaignService, private nav: NavController, private auth: AuthService) {}

  async ionViewWillEnter() {
    this.campaigns = await this.cs.getAll();
  }

  goToAdd() { this.nav.navigateForward('/add-campaign'); }

  goToDetails(id: string) { this.nav.navigateForward(['/details', id]); }

  filteredCampaigns(): Campaign[] {
    const byQuery = (c: Campaign) =>
      (c.title?.toLowerCase().includes(this.query.toLowerCase()) ||
       c.location?.toLowerCase().includes(this.query.toLowerCase()) ||
       c.description?.toLowerCase().includes(this.query.toLowerCase()));
    const byType = (c: Campaign) => this.filterType === 'all' || (c.bloodType || '') === this.filterType;
    return (this.campaigns || []).filter(c => byQuery(c) && byType(c));
  }

  async logout() {
    await this.auth.logout();
  }
}