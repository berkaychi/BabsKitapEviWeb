import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="d-flex flex-column min-vh-100">
      <!-- E-ticaret Header -->
      <app-header></app-header>

      <!-- Ana İçerik -->
      <main class="flex-grow-1">
        <router-outlet></router-outlet>
      </main>

      <!-- E-ticaret Footer -->
      <app-footer></app-footer>
    </div>
  `,
})
export class ClientLayoutComponent {}
