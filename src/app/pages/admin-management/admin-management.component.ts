import { Component } from '@angular/core';
import { CardModule } from "primeng/card";
import { UserService } from '../../services/user.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-management',
  imports: [CardModule, NgIf, AsyncPipe, ButtonModule],
  templateUrl: './admin-management.component.html',
  styleUrl: './admin-management.component.scss'
})
export class AdminManagementComponent {
  constructor(public userService: UserService, private router: Router) {}

  async onLogout() {
    await this.userService.logout();
    this.router.navigate(['/login']);
  }
}
