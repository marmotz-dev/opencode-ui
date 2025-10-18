import { Routes } from '@angular/router'

export const mainRoutes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./app/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
]
