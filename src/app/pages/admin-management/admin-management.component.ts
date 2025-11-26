import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { catchError, firstValueFrom, interval, of, Subscription, switchMap, tap } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { PasswordValidators } from '../../shared/password-validators';

@Component({
  selector: 'app-admin-management',
  imports: [CardModule, NgIf, AsyncPipe, ButtonModule, Dialog, InputText, ReactiveFormsModule, CommonModule, ToggleSwitchModule, ToastModule, TableModule, BadgeModule, SkeletonModule],
  templateUrl: './admin-management.component.html',
  styleUrl: './admin-management.component.scss',
  providers: [MessageService]
})
export class AdminManagementComponent implements OnInit, OnDestroy {
  visible: boolean = false;
  isFormLoading: boolean = false;
  isAdminListLoading: boolean = false;
  createAdminForm!: FormGroup;
  admins: Admin[] = [];
  hasAction: boolean = false;
  countdown = 0;
  isResetDisable: boolean = false;
  private timerSub?: Subscription;
  passwordCooldown: string = 'passwordCooldown';

  defaultTempPassword: string = 'Defau1t_@dmin';

  constructor(public userService: UserService, private router: Router, private fb: FormBuilder, private auth: Auth, private messageService: MessageService, private passwordValidator: PasswordValidators) {}

  async ngOnInit() {
    this.createAdminForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [this.defaultTempPassword, [Validators.required, Validators.minLength(8), this.passwordValidator.digitValidator(), this.passwordValidator.specialCharValidator(), this.passwordValidator.upperLowerValidator()]],
      isSuperadmin: [false],
    });

    const token = await this.auth.currentUser?.getIdTokenResult();
    if (token && !!token.claims['is_superadmin']) {
      await this.loadAdminList();
    }

    this.checkCooldown();
  }

  ngOnDestroy(): void {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }

  async onLogout() {
    await this.userService.logout();
    this.router.navigate(['/login']);
  }

  async onResetPassword() {
    try {
      this.isResetDisable = true;
      const user = await firstValueFrom(this.userService.currentUser$);
      const email = user?.email;
      if (!email) {
        throw new Error('No email found for current user.');
      }
      await this.userService.sendResetPasswordEmail(email);
      const nextAvailableTime = Date.now() + 120 * 1000;
      localStorage.setItem(this.passwordCooldown, nextAvailableTime.toString());
      this.startCountdown();
      this.messageService.add({severity: 'success', summary: 'Success', detail: 'Reset password email is successfully sent.', life: 3000 });
    } catch (error: any) {
      this.isResetDisable = false;
      if (error instanceof Error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: String(error), life: 3000 });
      }
    }
  }
  
  async onCreateAdmin() {
    if (!this.createAdminForm.valid) {
      this.createAdminForm.markAllAsTouched();
      return;
    }
    this.isFormLoading = true;
    this.createAdminForm.disable();
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
        this.isFormLoading = false;
        this.createAdminForm.enable();
      }), 
      catchError((err) => {
        if (err instanceof Error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: String(err), life: 3000 });
        }
        this.isFormLoading = false;
        this.createAdminForm.enable();
        return of(null);
      })
    ).subscribe();
  }

  async onDeleteAdmin(targetUid: string) {
    this.hasAction = true;
    this.userService.deleteAdmin(targetUid).pipe(
      switchMap(() => this.loadAdminList()),
      tap(() => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Admin is deleted!', life: 3000 });
        this.hasAction = false;
      }),
      catchError((err) => {
        if (err instanceof Error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: String(err), life: 3000 });
        }
        this.hasAction = false;
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
      password: this.defaultTempPassword,
      isSuperadmin: false,
    });
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.createAdminForm.get(controlName);
    return !!(control && control.touched && control.invalid)
  }

  private startCountdown(seconds: number = 120) {
      this.countdown = seconds;
      this.isResetDisable = true;
  
      if (this.timerSub) {
        this.timerSub.unsubscribe();
      }
      this.timerSub = interval(1000).subscribe(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          this.isResetDisable = false;
          localStorage.removeItem(this.passwordCooldown);
          if (this.timerSub) {
            this.timerSub.unsubscribe();
          }
        }
      })
    }
  
    private checkCooldown() {
      const storedTime = localStorage.getItem(this.passwordCooldown);
      if (storedTime) {
        const timeLeft = parseInt(storedTime) - Date.now();
        if (timeLeft > 0) {
          this.startCountdown(Math.ceil(timeLeft / 1000));
        }
      }
    }
}
