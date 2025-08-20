import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  NgbDropdownModule,
  NgbCollapseModule,
} from '@ng-bootstrap/ng-bootstrap';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  Subscription,
} from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { CartService } from '../../../core/services/cart.service';
import { Router } from '@angular/router';
import { BookFilterService } from '../../../core/services/book-filter.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbDropdownModule,
    NgbCollapseModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuCollapsed = true;
  cartItemCount = 0;
  currentUser: User | null = null;
  searchQuery: string | null = '';
  private searchSubject = new Subject<string>();
  private authSubscription?: Subscription;
  private cartSubscription?: Subscription;
  private filterSubscription?: Subscription;
  private searchSubscription?: Subscription;

  constructor(
    public authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private filterService: BookFilterService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.cartService.fetchCart().subscribe();
      }
    });

    this.cartSubscription = this.cartService.cart$.subscribe((cart) => {
      this.cartItemCount = this.cartService.getDifferentBooksCount();
    });

    this.filterSubscription = this.filterService.state$.subscribe((state) => {
      this.searchQuery = state.searchTerm;
    });

    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.filterService.updateSearchTerm(searchTerm);

        if (!this.router.url.startsWith('/books')) {
          this.router.navigate(['/books'], {
            queryParams: { search: searchTerm },
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.cartSubscription?.unsubscribe();
    this.filterSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }

  toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  onLogout(): void {
    this.cartService.clearLocalCart();
    this.authService.logout();
  }

  getUserDisplayName(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return 'Kullanıcı';
  }

  onSearch(): void {
    this.filterService.updateSearchTerm(this.searchQuery || '');
    if (!this.router.url.startsWith('/books')) {
      this.router.navigate(['/books'], {
        queryParams: { search: this.searchQuery || '' },
      });
    }
  }

  onSearchInput(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm);
  }

  onSearchSubmit(): void {
    this.searchSubject.next(this.searchQuery || '');
  }
}
