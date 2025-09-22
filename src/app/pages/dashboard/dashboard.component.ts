import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-dashboard',
  imports: [ButtonModule, DashboardCardComponent, RippleModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
