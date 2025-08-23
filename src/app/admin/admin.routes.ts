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
      {
        path: 'categories',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './features/categories/category-list/category-list.component'
              ).then((m) => m.CategoryListComponent),
          },
          {
            path: 'new',
            loadComponent: () =>
              import(
                './features/categories/category-form/category-form.component'
              ).then((m) => m.CategoryFormComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import(
                './features/categories/category-form/category-form.component'
              ).then((m) => m.CategoryFormComponent),
          },
        ],
      },
      {
        path: 'publishers',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './features/publishers/publisher-list/publisher-list.component'
              ).then((m) => m.PublisherListComponent),
          },
          {
            path: 'new',
            loadComponent: () =>
              import(
                './features/publishers/publisher-form/publisher-form.component'
              ).then((m) => m.PublisherFormComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import(
                './features/publishers/publisher-form/publisher-form.component'
              ).then((m) => m.PublisherFormComponent),
          },
        ],
      },
      {
        path: 'users',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/users/user-list/user-list.component').then(
                (m) => m.UserListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/users/user-form/user-form.component').then(
                (m) => m.UserFormComponent
              ),
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import('./features/users/user-form/user-form.component').then(
                (m) => m.UserFormComponent
              ),
          },
        ],
      },

      {
        path: '**',
        redirectTo: 'admin',
        pathMatch: 'full',
      },
    ],
  },
];
