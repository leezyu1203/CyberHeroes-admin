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
import { catchError, of, switchMap, tap } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-admin-management',
  imports: [CardModule, NgIf, AsyncPipe, ButtonModule, Dialog, InputText, ReactiveFormsModule, CommonModule, ToggleSwitchModule, ToastModule, TableModule, BadgeModule, SkeletonModule],
  templateUrl: './admin-management.component.html',
  styleUrl: './admin-management.component.scss',
  providers: [MessageService]
})
export class AdminManagementComponent implements OnInit {
  visible: boolean = false;
  isFormLoading: boolean = false;
  isAdminListLoading: boolean = false;
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
      await this.loadAdminList();
    }
  }

  async onLogout() {
    await this.userService.logout();
    this.router.navigate(['/login']);
  }
  
  async onCreateAdmin() {
    if (!this.createAdminForm.valid) {
      this.createAdminForm.markAllAsTouched();
      return;
    }
    this.isFormLoading = true;
    const payload: Admin = {
      username: this.createAdminForm.get('username')?.value,
      email: this.createAdminForm.get('email')?.value,
      is_superadmin: this.createAdminForm.get('isSuperadmin')?.value,
      disabled: false,
      failed_attempts: 0,
      is_first_login: true,
    }
    const password: string = this.createAdminForm.get('password')?.value;
    // console.log(payload, password);
    this.userService.createAdmin(payload, password).pipe(
      switchMap(() => this.loadAdminList()),
      tap(() => {
        this.toggleCreateAdminDialogVisibility();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'New admin created!', life: 3000 });
      }), 
      catchError((err) => {
        if (err instanceof Error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: String(err), life: 3000 });
        }
        this.isFormLoading = false;
        return of(null);
      })
    ).subscribe();
  }

  async onDeleteAdmin(targetUid: string) {
    this.userService.deleteAdmin(targetUid).pipe(
      switchMap(() => this.loadAdminList()),
      tap(() => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Message is deleted!', life: 3000 });
      }),
      catchError((err) => {
        if (err instanceof Error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: String(err), life: 3000 });
        }
        this.isFormLoading = false;
        return of(null);
      })
    ).subscribe();
  }

  async loadAdminList() {
    this.isAdminListLoading = true;
    this.userService.getAdminList().subscribe({
      next: res => {
        this.admins = res;
        this.isAdminListLoading = false;
        console.log(this.admins)
      },
      error: err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
        this.isAdminListLoading = false;
      }
    });
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
