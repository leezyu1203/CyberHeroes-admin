import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NgClass } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-dashboard-card',
  imports: [ButtonModule, NgClass, RouterLink],
  templateUrl: './dashboard-card.component.html',
  styleUrl: './dashboard-card.component.scss'
})
export class DashboardCardComponent {
  @Input() title!: string;
  @Input() icon!: string;
  @Input() value!: number;
  @Input() hasMinRequired!: boolean;
  @Input() minRequired!: number;
  @Input() routerLink!: string;
}
