import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { AdminDashboardService, DashboardStats } from '../../../core/services/admin-dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, StatsCardsComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;

  constructor(private adminDashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.adminDashboardService.getDashboardStats().subscribe((data) => {
      this.stats = data;
    });
  }
}
