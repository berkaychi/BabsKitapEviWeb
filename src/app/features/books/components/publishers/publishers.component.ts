import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Publisher } from '../../../../core/models/publisher.model';
import { PublisherService } from '../../../../core/services/publisher.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-publishers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './publishers.component.html',
  styleUrl: './publishers.component.scss',
})
export class PublishersComponent implements OnInit {
  isLoading = false;
  publishers: Publisher[] = [];
  error: string | null = null;

  constructor(
    private publisherService: PublisherService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPublishers();
  }

  loadPublishers(): void {
    this.isLoading = true;
    this.error = null;
    this.publisherService
      .getPublishers()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (data) => {
          this.publishers = data;
        },
        error: (err) => {
          this.error = 'Yayınevleri yüklenirken bir hata oluştu.';
          console.error('Yayınevleri yüklenemedi:', err);
        },
      });
  }

  trackByPublisherId(index: number, publisher: Publisher): number {
    return publisher.id;
  }

  viewPublisherBooks(publisherId: number): void {
    this.router.navigate(['/books/publisher', publisherId]);
  }
}
