import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { Auth, EmailAuthProvider, getAuth, reauthenticateWithCredential } from '@angular/fire/auth';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-first-time-login',
  imports: [CardModule, InputTextModule, FloatLabelModule, ReactiveFormsModule, ButtonModule, CommonModule, ToastModule],
  templateUrl: './first-time-login.component.html',
  styleUrl: './first-time-login.component.scss',
  providers: [MessageService]
})
export class FirstTimeLoginComponent implements OnInit {
  isLoading: boolean = false;
  resetPasswordForm!: FormGroup;

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router, private auth: Auth, private messageService: MessageService) {}

  ngOnInit() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), this.upperLowerValidator(), this.digitValidator(), this.specialCharValidator()]],
      confirm_password: ['', [Validators.required, this.matchPasswordValidator()]],
    });
  }

  onResetPassword() {
    if (!this.resetPasswordForm.valid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const password = this.resetPasswordForm.get('password')?.value;
    if (password) {
      this.userService.updatePassword(password).subscribe({
        next: async (res) => {
          const auth = getAuth();
          const user = auth.currentUser;
          if (user && user.email) {
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);
            await user.getIdToken(true);
          }
          this.router.navigate(['/']);
        }, error: (err) => {
          this.isLoading = false;
          if (err instanceof Error) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: String(err), life: 3000 });
          }
        }
      })
    }
  }

  async onLogout() {
    await this.userService.logout();
    this.router.navigate(['/login']);
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.resetPasswordForm.get(controlName);
    return !!(control && control.touched && control.invalid)
  }

  upperLowerValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      return hasUpper && hasLower ? null : { upperLower: true };
    }
  }

  digitValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasDigit = /\d/.test(value);
      return hasDigit ? null : { digit: true };
    }
  }

  specialCharValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasSpecialChar = /[!@#$%^&*]/.test(value);
      return hasSpecialChar ? null : { specialChar: true };
    }
  }

  matchPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const passwordValue = this.resetPasswordForm.get('password')?.value;
      return passwordValue === value ? null : { matchPassword: true };
    }
  }
}
