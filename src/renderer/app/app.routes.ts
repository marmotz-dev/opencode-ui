import { Routes } from '@angular/router'
import { LoadingComponent } from './loading/loading.component'
import { ipcReadyGuard } from './shared/guard/ipc-ready.guard'

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'loading',
    pathMatch: 'full',
  },
  {
    path: 'loading',
    component: LoadingComponent,
  },
  {
    path: 'chat',
    canActivate: [ipcReadyGuard],
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
