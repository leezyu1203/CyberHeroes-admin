import { Component, OnInit } from '@angular/core';
import { CardModule } from "primeng/card";
import { Admin, UserService } from '../../services/user.service';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import { InputText } from "primeng/inputtext";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch'
import { Auth } from '@angular/fire/auth';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-admin-management',
  imports: [CardModule, NgIf, AsyncPipe, ButtonModule, Dialog, InputText, ReactiveFormsModule, CommonModule, ToggleSwitchModule, ToastModule, TableModule, BadgeModule],
  templateUrl: './admin-management.component.html',
  styleUrl: './admin-management.component.scss',
  providers: [MessageService]
})
export class AdminManagementComponent implements OnInit {
  visible: boolean = false;
  createAdminForm!: FormGroup;
  admins: Admin[] = [];

  constructor(public userService: UserService, private router: Router, private fb: FormBuilder, private auth: Auth, private messageService: MessageService) {}

  async ngOnInit() {
    this.createAdminForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      isSuperadmin: [false],
    });

    const token = await this.auth.currentUser?.getIdTokenResult();
    if (token && !!token.claims['is_superadmin']) {
      this.userService.getAdminList().subscribe({
        next: res => {
          this.admins = res;
          console.log(this.admins)
        },
        error: err => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
        }
      })
    }
  }

  async onLogout() {
    await this.userService.logout();
    this.router.navigate(['/login']);
  }
  
  async onCreateAdmin() {
    this.toggleCreateAdminDialogVisibility();
  }

  get isSuperadmin(): boolean {
    return false;
  }

  toggleCreateAdminDialogVisibility() {
    if (this.visible) {
      this.resetCreateAdminForm();
    }
    this.visible = !this.visible;
  }

  resetCreateAdminForm() {
    this.createAdminForm.reset({
      username: '',
      email: '',
      password: '',
      isSuperadmin: false,
    });
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.createAdminForm.get(controlName);
    return !!(control && control.touched && control.invalid)
  }
}
