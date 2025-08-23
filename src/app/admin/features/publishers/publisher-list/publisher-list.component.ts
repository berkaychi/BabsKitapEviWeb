import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Publisher } from '../../../../core/models/publisher.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AdminPublisherService } from '../../../core/services/admin-publisher.service';
import { PublisherService } from '../../../../core/services/publisher.service';

@Component({
  selector: 'app-publisher-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './publisher-list.component.html',
  styleUrls: ['./publisher-list.component.scss'],
})
export class PublisherListComponent implements OnInit, OnDestroy {
  publishers: Publisher[] = [];
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private adminPublisherService: AdminPublisherService,
    private publisherService: PublisherService
  ) {}

  ngOnInit(): void {
    this.loadPublishers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPublishers(): void {
    this.loading = true;
    this.error = null;
    this.publisherService
      .getPublishers()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (data) => {
          this.publishers = data;
        },
        error: (err) => {
          alert('Yayınevleri yüklenemedi.');
          this.error = 'Yayınevleri yüklenemedi.';
        },
      });
  }

  deletePublisher(publisher: Publisher): void {
    if (
      confirm(
        `"${publisher.name}" yayınevini silmek istediğinize emin misiniz?`
      )
    ) {
      this.adminPublisherService.deletePublisher(publisher.id).subscribe({
        next: () => {
          alert('Yayınevi başarıyla silindi.');
          this.loadPublishers();
        },
        error: (err) => {
          alert('Yayınevi silinirken bir hata oluştu.');
          console.error(err);
          this.error = 'Yayınevi silinirken bir hata oluştu.';
        },
      });
    }
  }
}
