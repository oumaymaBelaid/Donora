import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '../../services/user-profile.service';
import { UserProfile, UserRole } from '../../services/auth.service';

@Component({
  selector: 'app-user-list',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Gestion des Utilisateurs</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Filtres -->
      <ion-segment [(ngModel)]="selectedRole" (ionChange)="filterUsers()">
        <ion-segment-button value="all">Tous</ion-segment-button>
        <ion-segment-button value="donor">Donneurs</ion-segment-button>
        <ion-segment-button value="org">Organisations</ion-segment-button>
      </ion-segment>

      <!-- Barre de recherche -->
      <ion-searchbar 
        [(ngModel)]="searchTerm" 
        (ionInput)="searchUsers()"
        placeholder="Rechercher un utilisateur...">
      </ion-searchbar>

      <!-- Statistiques -->
      <ion-card *ngIf="statistics">
        <ion-card-header>
          <ion-card-title>Statistiques</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>Total utilisateurs: {{ statistics.totalUsers }}</p>
          <p>Donneurs: {{ statistics.totalDonors }}</p>
          <p>Organisations: {{ statistics.totalOrganizations }}</p>
          <p>Donneurs éligibles: {{ statistics.eligibleDonors }}</p>
        </ion-card-content>
      </ion-card>

      <!-- Liste des utilisateurs -->
      <ion-list>
        <ion-item *ngFor="let user of filteredUsers">
          <ion-label>
            <h2>{{ user.firstName }} {{ user.lastName }}</h2>
            <h3>{{ user.email }}</h3>
            <p>
              Rôle: {{ user.role === 'donor' ? 'Donneur' : 'Organisation' }}
              <span *ngIf="user.role === 'org' && user.organization">
                - {{ user.organization.name }}
              </span>
              <span *ngIf="user.role === 'donor' && user.donor">
                - Groupe: {{ user.donor.bloodType }}
              </span>
            </p>
          </ion-label>
          <ion-badge 
            slot="end" 
            [color]="user.role === 'donor' ? 'primary' : 'secondary'">
            {{ user.role === 'donor' ? 'Donneur' : 'Org' }}
          </ion-badge>
        </ion-item>
      </ion-list>
    </ion-content>
  `
})
export class UserListComponent implements OnInit {
  users: UserProfile[] = [];
  filteredUsers: UserProfile[] = [];
  selectedRole: string = 'all';
  searchTerm: string = '';
  statistics: any = null;
  loading = false;

  constructor(private userProfileService: UserProfileService) {}

  async ngOnInit() {
    await this.loadUsers();
    await this.loadStatistics();
  }

  async loadUsers() {
    this.loading = true;
    try {
      // Charger tous les utilisateurs (donneurs + organisations)
      const [donors, organizations] = await Promise.all([
        this.userProfileService.getDonors(),
        this.userProfileService.getOrganizations()
      ]);
      
      this.users = [...donors, ...organizations];
      this.filteredUsers = [...this.users];
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadStatistics() {
    try {
      this.statistics = await this.userProfileService.getUserStatistics();
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const roleMatch = this.selectedRole === 'all' || user.role === this.selectedRole;
      const searchMatch = !this.searchTerm || 
        user.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.organization?.name?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return roleMatch && searchMatch;
    });
  }

  async searchUsers() {
    if (this.searchTerm.trim()) {
      // Recherche avec le service
      const searchResults = await this.userProfileService.searchUsers(
        this.searchTerm, 
        this.selectedRole === 'all' ? undefined : this.selectedRole as UserRole
      );
      this.filteredUsers = searchResults;
    } else {
      // Afficher tous les utilisateurs filtrés par rôle
      this.filterUsers();
    }
  }

  // Méthodes spécifiques pour différents types d'utilisateurs
  async loadDonorsByBloodType(bloodType: string) {
    const donors = await this.userProfileService.getEligibleDonorsByBloodType(bloodType);
    console.log(`Donneurs ${bloodType}:`, donors);
  }

  async loadOrganizationsByCity(city: string) {
    const organizations = await this.userProfileService.getOrganizationsByCity(city);
    console.log(`Organisations à ${city}:`, organizations);
  }
}


