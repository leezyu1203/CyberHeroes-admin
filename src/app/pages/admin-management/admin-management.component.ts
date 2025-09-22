import { Component } from '@angular/core';
import { CardModule } from "primeng/card";
import { UserService } from '../../services/user.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-management',
  imports: [CardModule, NgIf, AsyncPipe, ButtonModule],
  templateUrl: './admin-management.component.html',
  styleUrl: './admin-management.component.scss'
})
export class AdminManagementComponent {
  constructor(public userService: UserService) {}
}
