import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'books',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/books/book-list/book-list.component').then(
                (m) => m.BookListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/books/book-form/book-form.component').then(
                (m) => m.BookFormComponent
              ),
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import('./features/books/book-form/book-form.component').then(
                (m) => m.BookFormComponent
              ),
          },
        ],
      },

      { path: '**', redirectTo: '' },
    ],
  },
];
