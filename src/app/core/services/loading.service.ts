import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  setLoading(loading: boolean): void {
    if (loading) {
      this.startLoading();
    } else {
      this.stopLoading();
    }
  }
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingOperations = new Set<string>();

  constructor() {}

  get isLoading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  startLoading(operationId?: string): void {
    if (operationId) {
      this.loadingOperations.add(operationId);
    }
    this.loadingSubject.next(true);
  }

  stopLoading(operationId?: string): void {
    if (operationId) {
      this.loadingOperations.delete(operationId);
      if (this.loadingOperations.size > 0) {
        return;
      }
    }
    this.loadingSubject.next(false);
  }

  stopAllLoading(): void {
    this.loadingOperations.clear();
    this.loadingSubject.next(false);
  }
}
