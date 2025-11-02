import { Routes } from '@angular/router'

export const routes: Routes = [
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
        loadComponent: () => import('./chat/chat.component').then((m) => m.ChatComponent),
      },
      {
        path: ':sessionId',
        loadComponent: () => import('./chat/chat.component').then((m) => m.ChatComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'chat',
  },
]
