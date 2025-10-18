import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonSegment, IonSegmentButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonText, IonSpinner, IonIcon, AlertController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonSegment, IonSegmentButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonText, IonSpinner, IonIcon, CommonModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  role: UserRole = 'donor';
  email = '';
  password = '';
  mode: 'login' | 'register' = 'login';
  loading = false;
  errorMessage = '';

  constructor(
    private auth: AuthService, 
    private router: Router,
    private alertController: AlertController
  ) {}

  async submit() {
    if (!this.email || !this.password) {
      this.showError('Veuillez remplir tous les champs');
      return;
    }

    // Validation supplémentaire pour l'inscription
    if (this.mode === 'register' && !this.role) {
      this.showError('Veuillez sélectionner votre rôle');
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      if (this.mode === 'login') {
        // Connexion : authentifier l'utilisateur
        await this.auth.loginWithEmail(this.email, this.password);
        
        // Redirection selon le rôle après connexion
        await this.redirectBasedOnRole();
      } else {
        // Inscription : créer un nouveau compte avec le rôle choisi
        await this.auth.registerWithEmail(this.email, this.password, this.role);
        
        // Message de succès pour l'inscription
        await this.showSuccessMessage();
        
        // Redirection selon le rôle après inscription
        await this.redirectBasedOnRole();
      }
    } catch (error: any) {
      console.error('Erreur d\'authentification:', error);
      this.handleAuthError(error);
    } finally {
      this.loading = false;
    }
  }

  private handleAuthError(error: any) {
    let message = 'Une erreur est survenue';
    
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'Aucun utilisateur trouvé avec cet email';
          break;
        case 'auth/wrong-password':
          message = 'Mot de passe incorrect';
          break;
        case 'auth/email-already-in-use':
          message = 'Cet email est déjà utilisé';
          break;
        case 'auth/weak-password':
          message = 'Le mot de passe doit contenir au moins 6 caractères';
          break;
        case 'auth/invalid-email':
          message = 'Format d\'email invalide';
          break;
        case 'auth/too-many-requests':
          message = 'Trop de tentatives. Veuillez réessayer plus tard';
          break;
        default:
          message = error.message || message;
      }
    }
    
    this.showError(message);
  }

  private async showError(message: string) {
    this.errorMessage = message;
    
    const alert = await this.alertController.create({
      header: 'Erreur',
      message: message,
      buttons: ['OK']
    });
    
    await alert.present();
  }

  switchMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.errorMessage = '';
    this.password = '';
  }

  private async redirectBasedOnRole() {
    // Attendre un court délai pour s'assurer que l'utilisateur est bien authentifié
    setTimeout(async () => {
      const currentUser = this.auth.currentUser;
      
      if (currentUser?.role === 'org') {
        // Les organisations sont redirigées vers la page d'accueil avec accès aux fonctionnalités d'organisation
        await this.router.navigateByUrl('/home');
      } else if (currentUser?.role === 'donor') {
        // Les donneurs sont redirigés vers la page d'accueil pour voir les campagnes
        await this.router.navigateByUrl('/home');
      } else {
        // Fallback vers la page d'accueil
        await this.router.navigateByUrl('/home');
      }
    }, 500);
  }

  private async showSuccessMessage() {
    const alert = await this.alertController.create({
      header: 'Inscription réussie !',
      message: `Bienvenue ${this.role === 'donor' ? 'donneur' : 'organisation'} ! Votre compte a été créé avec succès.`,
      buttons: ['Continuer']
    });
    
    await alert.present();
  }
}


