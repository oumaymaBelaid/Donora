import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

export type UserRole = 'org' | 'donor';
export interface AuthUser {
  role: UserRole;
  id: string; // organisation id (email/slug) ou donneur id (email)
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
        this.currentUserSubject.next({ id: u.email || u.uid, role: role || 'donor' });
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  private async fetchRole(user: User): Promise<UserRole | null> {
    try {
      const ref = doc(this.db, `${USERS_COLLECTION}/${user.uid}`);
      const snap = await getDoc(ref);
      const data = snap.data() as any;
      return data?.role ?? null;
    } catch {
      return null;
    }
  }

  async loginWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async registerWithEmail(email: string, password: string, role: UserRole) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    const ref = doc(this.db, `${USERS_COLLECTION}/${cred.user.uid}`);
    await setDoc(ref, { role, email });
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



