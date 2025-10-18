import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, doc, getDoc } from '@angular/fire/firestore';
import { UserProfile, UserRole } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  constructor(private firestore: Firestore) {}

  /**
   * Récupérer tous les utilisateurs par rôle
   */
  async getUsersByRole(role: UserRole): Promise<UserProfile[]> {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('role', '==', role), where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      
      const users: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
      });
      
      return users;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs par rôle:', error);
      return [];
    }
  }

  /**
   * Récupérer toutes les organisations
   */
  async getOrganizations(): Promise<UserProfile[]> {
    return this.getUsersByRole('org');
  }

  /**
   * Récupérer tous les donneurs
   */
  async getDonors(): Promise<UserProfile[]> {
    return this.getUsersByRole('donor');
  }

  /**
   * Rechercher des utilisateurs par nom ou email
   */
  async searchUsers(searchTerm: string, role?: UserRole): Promise<UserProfile[]> {
    try {
      const usersRef = collection(this.firestore, 'users');
      let q = query(usersRef, where('isActive', '==', true));
      
      if (role) {
        q = query(q, where('role', '==', role));
      }
      
      const querySnapshot = await getDocs(q);
      const users: UserProfile[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as UserProfile;
        
        // Recherche dans le nom, prénom, email et nom d'organisation
        const searchLower = searchTerm.toLowerCase();
        const matches = 
          userData.firstName?.toLowerCase().includes(searchLower) ||
          userData.lastName?.toLowerCase().includes(searchLower) ||
          userData.email.toLowerCase().includes(searchLower) ||
          userData.organization?.name?.toLowerCase().includes(searchLower);
          
        if (matches) {
          users.push(userData);
        }
      });
      
      return users;
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      return [];
    }
  }

  /**
   * Récupérer les donneurs éligibles par groupe sanguin
   */
  async getEligibleDonorsByBloodType(bloodType: string): Promise<UserProfile[]> {
    try {
      const donors = await this.getDonors();
      return donors.filter(donor => 
        donor.donor?.isEligible === true && 
        donor.donor?.bloodType === bloodType
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des donneurs par groupe sanguin:', error);
      return [];
    }
  }

  /**
   * Récupérer les organisations par ville
   */
  async getOrganizationsByCity(city: string): Promise<UserProfile[]> {
    try {
      const organizations = await this.getOrganizations();
      return organizations.filter(org => 
        org.organization?.city?.toLowerCase() === city.toLowerCase()
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des organisations par ville:', error);
      return [];
    }
  }

  /**
   * Récupérer les statistiques des utilisateurs
   */
  async getUserStatistics(): Promise<{
    totalUsers: number;
    totalDonors: number;
    totalOrganizations: number;
    eligibleDonors: number;
  }> {
    try {
      const [donors, organizations] = await Promise.all([
        this.getDonors(),
        this.getOrganizations()
      ]);

      const eligibleDonors = donors.filter(donor => donor.donor?.isEligible === true).length;

      return {
        totalUsers: donors.length + organizations.length,
        totalDonors: donors.length,
        totalOrganizations: organizations.length,
        eligibleDonors
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        totalUsers: 0,
        totalDonors: 0,
        totalOrganizations: 0,
        eligibleDonors: 0
      };
    }
  }
}


