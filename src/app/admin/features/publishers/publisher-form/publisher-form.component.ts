import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';
import { CreatePublisherRequest } from '../../../../core/models/publisher.model';
import { CommonModule } from '@angular/common';
import { PublisherService } from '../../../../core/services/publisher.service';
import { AdminPublisherService } from '../../../core/services/admin-publisher.service';

@Component({
  selector: 'app-publisher-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './publisher-form.component.html',
  styleUrls: ['./publisher-form.component.scss'],
})
export class PublisherFormComponent {
  publisherForm!: FormGroup;
  isEditMode = false;
  publisherId?: number;
  loading = false;
  submitting = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private publisherService: PublisherService,
    private adminPublisherService: AdminPublisherService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.publisherForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  checkEditMode(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.publisherId = +id;
        this.loadPublisher();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPublisher(): void {
    if (!this.publisherId) return;
    this.loading = true;
    this.error = null;

    this.publisherService
      .getPublisherById(this.publisherId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (publisher) => {
          this.publisherForm.patchValue({ name: publisher.name });
        },
        error: (err) => {
          this.error = 'Yayınevi yüklenemedi: ' + err.message;
          this.goBack();
        },
      });
  }

  onSubmit(): void {
    if (this.publisherForm.invalid) return;
    this.submitting = true;
    if (this.isEditMode) {
      const updatePublisher = {
        id: this.publisherId!,
        ...this.publisherForm.value,
      };
      this.adminPublisherService
        .updatePublisher(updatePublisher)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => ((this.submitting = false), (this.loading = false)))
        )
        .subscribe({
          next: () => {
            alert('Yayınevi başarıyla güncellendi.');
            this.goBack();
          },
          error: (err) => {
            alert('Yayınevi güncellenemedi');
            this.error = 'Yayınevi güncellenemedi: ' + err.message;
          },
        });
    } else {
      const newPublisher: CreatePublisherRequest = this.publisherForm.value;
      this.adminPublisherService
        .createPublisher(newPublisher)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.submitting = false))
        )
        .subscribe({
          next: () => {
            alert('Yayınevi başarıyla oluşturuldu.');
            this.goBack();
          },
          error: (err) => {
            alert('Yayınevi oluşturulamadı');
            this.error = 'Yayınevi oluşturulamadı: ' + err.message;
          },
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/publishers']);
  }
}
