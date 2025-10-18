import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, updateDoc, Timestamp } from '@angular/fire/firestore';

export type UserRole = 'org' | 'donor';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  organization?: {
    name: string;
    address?: string;
    city?: string;
    postalCode?: string;
    type: 'hospital' | 'blood_bank' | 'clinic' | 'other';
  };
  donor?: {
    bloodType?: string;
    dateOfBirth?: Date;
    address?: string;
    city?: string;
    postalCode?: string;
    isEligible?: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  isActive: boolean;
}

export interface AuthUser {
  role: UserRole;
  id: string; // organisation id (email/slug) ou donneur id (email)
  profile?: UserProfile;
}

const USERS_COLLECTION = 'users';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private auth: Auth, private db: Firestore) {
    onAuthStateChanged(this.auth, async (u) => {
      if (u) {
        const role = await this.fetchRole(u);
        const profile = await this.fetchUserProfile(u);
        
        // Mettre à jour la dernière connexion
        if (profile) {
          await this.updateLastLogin(u.uid);
        }
        
        this.currentUserSubject.next({ 
          id: u.email || u.uid, 
          role: role || 'donor',
          profile: profile || undefined
        });
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  private async fetchRole(user: User): Promise<UserRole | null> {
    try {
      const ref = doc(this.db, `${USERS_COLLECTION}/${user.uid}`);
      const snap = await getDoc(ref);
      const data = snap.data() as UserProfile;
      return data?.role ?? null;
    } catch (error) {
      console.error('Erreur lors de la récupération du rôle:', error);
      return null;
    }
  }

  private async fetchUserProfile(user: User): Promise<UserProfile | null> {
    try {
      const ref = doc(this.db, `${USERS_COLLECTION}/${user.uid}`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
  }

  async loginWithEmail(email: string, password: string) {
    // Normaliser l'email (minuscules et suppression des espaces)
    const normalizedEmail = email.trim().toLowerCase();
    await signInWithEmailAndPassword(this.auth, normalizedEmail, password);
  }

  async registerWithEmail(email: string, password: string, role: UserRole, additionalInfo?: Partial<UserProfile>) {
    // Normaliser l'email (minuscules et suppression des espaces)
    const normalizedEmail = email.trim().toLowerCase();
    const cred = await createUserWithEmailAndPassword(this.auth, normalizedEmail, password);
    
    // Créer le profil utilisateur complet
    const userProfile: UserProfile = {
      uid: cred.user.uid,
      email: normalizedEmail,
      role,
      firstName: additionalInfo?.firstName || '',
      lastName: additionalInfo?.lastName || '',
      phone: additionalInfo?.phone || '',
      organization: role === 'org' ? {
        name: additionalInfo?.organization?.name || '',
        address: additionalInfo?.organization?.address || '',
        city: additionalInfo?.organization?.city || '',
        postalCode: additionalInfo?.organization?.postalCode || '',
        type: additionalInfo?.organization?.type || 'other'
      } : undefined,
      donor: role === 'donor' ? {
        bloodType: additionalInfo?.donor?.bloodType || '',
        dateOfBirth: additionalInfo?.donor?.dateOfBirth || undefined,
        address: additionalInfo?.donor?.address || '',
        city: additionalInfo?.donor?.city || '',
        postalCode: additionalInfo?.donor?.postalCode || '',
        isEligible: additionalInfo?.donor?.isEligible || true
      } : undefined,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      isActive: true
    };
    
    const ref = doc(this.db, `${USERS_COLLECTION}/${cred.user.uid}`);
    await setDoc(ref, userProfile);
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      const ref = doc(this.db, `${USERS_COLLECTION}/${uid}`);
      await updateDoc(ref, {
        lastLoginAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dernière connexion:', error);
    }
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const ref = doc(this.db, `${USERS_COLLECTION}/${uid}`);
      await updateDoc(ref, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const ref = doc(this.db, `${USERS_COLLECTION}/${uid}`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
  }

  async logout() {
    await signOut(this.auth);
  }

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  isOrg(): boolean {
    return this.currentUserSubject.value?.role === 'org';
  }

  isDonor(): boolean {
    return this.currentUserSubject.value?.role === 'donor';
  }
}



