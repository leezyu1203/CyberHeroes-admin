import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component';
import { RippleModule } from 'primeng/ripple';
import { DashboardService } from '../../services/dashboard.service';
import { SkeletonModule } from 'primeng/skeleton';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [ButtonModule, DashboardCardComponent, RippleModule, SkeletonModule, NgIf],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  counts!: {messages: number, rules: number, emails: number}
  isLoading: boolean = true;

  constructor(private dashboardService: DashboardService) {}

  async ngOnInit() {
    this.counts = await this.dashboardService.getDashboardCounts();
    this.isLoading = false;
    console.log(this.counts)
  }
}
