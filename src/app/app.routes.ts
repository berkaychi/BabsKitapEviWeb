import { Routes } from '@angular/router';
import { HomeComponent } from './client/features/home/home.component';
import { LoginComponent } from './client/features/auth/components/login/login.component';
import { RegisterComponent } from './client/features/auth/components/register/register.component';
import { authGuard } from './core/guards/auth.guard';
import { CategoriesComponent } from './client/features/books/components/categories/categories.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'books',
    loadComponent: () =>
      import(
        './client/features/books/components/book-list/book-list.component'
      ).then((m) => m.BookListComponent),
  },
  {
    path: 'book/:id',
    loadComponent: () =>
      import(
        './client/features/books/components/book-detail/book-detail.component'
      ).then((m) => m.BookDetailComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./client/features/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'addresses/new',
        loadComponent: () =>
          import(
            './client/features/profile/components/address-form/address-form.component'
          ).then((m) => m.AddressFormComponent),
      },
      {
        path: 'addresses/:id/edit',
        loadComponent: () =>
          import(
            './client/features/profile/components/address-form/address-form.component'
          ).then((m) => m.AddressFormComponent),
      },
    ],
  },
  {
    path: 'books/category/:categoryId',
    loadComponent: () =>
      import(
        './client/features/books/components/book-list/book-list.component'
      ).then((m) => m.BookListComponent),
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './client/features/cart/components/cart-view/cart-view.component'
      ).then((m) => m.CartViewComponent),
  },
  { path: 'categories', component: CategoriesComponent },
  {
    path: 'publishers',
    loadComponent: () =>
      import(
        './client/features/books/components/publishers/publishers.component'
      ).then((m) => m.PublishersComponent),
  },
  {
    path: 'books/publisher/:publisherId',
    loadComponent: () =>
      import(
        './client/features/books/components/book-list/book-list.component'
      ).then((m) => m.BookListComponent),
  },
  { path: '**', redirectTo: '' },
];
