import { Routes } from '@angular/router';
import { AuthGuard } from './upload/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'podiums', pathMatch: 'full' },
  { 
    path: 'podiums', 
    loadComponent: () => import('./podiums/podiums-container/podiums-container.component').then(c => c.PodiumsContainerComponent)
  },
  {
    path: 'stats',
    loadComponent: () => import('./stats/stats-container/stats-container.component').then(c => c.StatsContainerComponent)
  },
  { 
    path: 'charts', 
    loadComponent: () => import('./charts/chart-container/chart-container.component').then(c => c.ChartContainerComponent)
  },
  { 
    path: 'leaderboard', 
    loadComponent: () => import('./leaderboard/leaderboard-container/leaderboard-container.component').then(c => c.LeaderboardContainerComponent)
  },
  {
    path: 'upload',
    canActivate: [AuthGuard],
    loadComponent: () => import('./upload/image-upload/image-upload.component').then(c => c.ImageUploadComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./upload/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'version-history',
    loadComponent: () => import('./version-history/version-history.component').then(c => c.VersionHistoryComponent)
  },
  { 
    path: '**', 
    redirectTo: 'podiums' 
  }
];
