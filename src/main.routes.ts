import { Routes } from '@angular/router'

export const mainRoutes: Routes = [
  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full',
  },
  {
    path: 'chat',
    children: [
      {
        path: '',
        loadComponent: () => import('./app/chat/chat.component').then((m) => m.ChatComponent),
      },
      {
        path: ':sessionId',
        loadComponent: () => import('./app/chat/chat.component').then((m) => m.ChatComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'chat',
  },
]
