import { Routes } from '@angular/router';
import { ClientLayoutComponent } from './layout/client-layout.component';
import { authGuard } from '../core/guards/auth.guard';

export const clientRoutes: Routes = [
  {
    path: '',
    component: ClientLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../client/features/home/home.component').then(
            (m) => m.HomeComponent
          ),
      },
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            loadComponent: () =>
              import(
                '../client/features/auth/components/login/login.component'
              ).then((m) => m.LoginComponent),
          },
          {
            path: 'register',
            loadComponent: () =>
              import(
                '../client/features/auth/components/register/register.component'
              ).then((m) => m.RegisterComponent),
          },
          { path: '', redirectTo: 'login', pathMatch: 'full' },
        ],
      },
      {
        path: 'books',
        loadComponent: () =>
          import(
            '../client/features/books/components/book-list/book-list.component'
          ).then((m) => m.BookListComponent),
      },
      {
        path: 'book/:id',
        loadComponent: () =>
          import(
            '../client/features/books/components/book-detail/book-detail.component'
          ).then((m) => m.BookDetailComponent),
      },
      {
        path: 'books/category/:categoryId',
        loadComponent: () =>
          import(
            '../client/features/books/components/book-list/book-list.component'
          ).then((m) => m.BookListComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import(
            '../client/features/books/components/categories/categories.component'
          ).then((m) => m.CategoriesComponent),
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        loadComponent: () =>
          import(
            '../client/features/cart/components/cart-view/cart-view.component'
          ).then((m) => m.CartViewComponent),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('../client/features/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
    ],
  },
];
