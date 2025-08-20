import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Client routes (e-ticaret)
  {
    path: '',
    loadChildren: () =>
      import('./client/client.routes').then((m) => m.clientRoutes),
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () =>
      import('./admin/admin.routes').then((m) => m.adminRoutes),
  },

  // Wildcard route
  { path: '**', redirectTo: '' },
];
