import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
    canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard) as any],
  },
  {
    path: 'add-campaign',
    loadComponent: () => import('./pages/add-campaign/add-campaign.page').then(m => m.AddCampaignPage),
    canActivate: [() => import('./guards/auth.guard').then(m => m.orgGuard) as any],
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./pages/details/details.page').then(m => m.DetailsPage),
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard) as any],
  },
];
