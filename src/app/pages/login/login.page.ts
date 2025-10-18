import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonSegment, IonSegmentButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonSpinner, AlertController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonSegment, IonSegmentButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonSpinner, CommonModule, FormsModule],
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
    // Validation des champs obligatoires
    if (!this.email || !this.password) {
      this.showError('Veuillez remplir tous les champs');
      return;
    }

    // Validation de l'email
    if (!this.isValidEmail(this.email)) {
      this.showError('Veuillez entrer une adresse email valide');
      return;
    }

    // Validation du mot de passe
    if (this.password.length < 6) {
      this.showError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Validation pour l'inscription
    if (this.mode === 'register' && !this.role) {
      this.showError('Veuillez sélectionner votre rôle');
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      if (this.mode === 'login') {
        // Connexion
        await this.auth.loginWithEmail(this.email.trim().toLowerCase(), this.password);
      } else {
        // Inscription
        await this.auth.registerWithEmail(this.email.trim().toLowerCase(), this.password, this.role);
        await this.showSuccessMessage();
      }
      
      // Redirection vers l'accueil
      this.router.navigateByUrl('/home');
    } catch (error: any) {
      console.error('Erreur d\'authentification:', error);
      this.handleAuthError(error);
    } finally {
      this.loading = false;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private handleAuthError(error: any) {
    let message = 'Une erreur est survenue';
    
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'Aucun utilisateur trouvé avec cet email. Vérifiez votre adresse email ou créez un compte.';
          break;
        case 'auth/wrong-password':
          message = 'Mot de passe incorrect. Vérifiez votre mot de passe.';
          break;
        case 'auth/invalid-credential':
          message = 'Email ou mot de passe incorrect. Vérifiez vos identifiants ou créez un compte si vous n\'en avez pas.';
          break;
        case 'auth/email-already-in-use':
          message = 'Cet email est déjà utilisé. Essayez de vous connecter ou utilisez un autre email.';
          break;
        case 'auth/weak-password':
          message = 'Le mot de passe doit contenir au moins 6 caractères';
          break;
        case 'auth/invalid-email':
          message = 'Format d\'email invalide. Vérifiez votre adresse email.';
          break;
        case 'auth/too-many-requests':
          message = 'Trop de tentatives de connexion. Veuillez patienter quelques minutes avant de réessayer.';
          break;
        case 'auth/network-request-failed':
          message = 'Erreur de connexion. Vérifiez votre connexion internet.';
          break;
        default:
          console.error('Code d\'erreur Firebase non géré:', error.code);
          message = error.message || 'Une erreur inattendue est survenue. Veuillez réessayer.';
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

  private async showSuccessMessage() {
    const alert = await this.alertController.create({
      header: 'Inscription réussie !',
      message: `Bienvenue ${this.role === 'donor' ? 'donneur' : 'organisation'} !`,
      buttons: ['Continuer']
    });
    
    await alert.present();
  }

  switchMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.errorMessage = '';
    this.password = '';
  }
}