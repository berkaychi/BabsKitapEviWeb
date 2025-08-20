import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ title || 'Onay' }}</h5>
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        (click)="onCancel()"
      ></button>
    </div>

    <div class="modal-body">
      <p class="mb-0">
        {{ message || 'Ürünü sepetten çıkarmak istediğinize emin misiniz?' }}
      </p>
    </div>

    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-outline-secondary"
        (click)="onCancel()"
      >
        {{ cancelText || 'Vazgeç' }}
      </button>
      <button type="button" class="btn btn-danger" (click)="onConfirm()">
        {{ confirmText || 'Evet' }}
      </button>
    </div>
  `,
})
export class ConfirmDialogComponent {
  @Input() title = 'Onay';
  @Input() message = 'Ürünü sepetten çıkarmak istediğinize emin misiniz?';
  @Input() confirmText = 'Evet';
  @Input() cancelText = 'Vazgeç';

  constructor(public activeModal: NgbActiveModal) {}

  onConfirm(): void {
    this.activeModal.close(true);
  }

  onCancel(): void {
    this.activeModal.dismiss(false);
  }
}
