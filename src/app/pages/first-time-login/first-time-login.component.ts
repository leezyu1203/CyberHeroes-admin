import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { firstValueFrom, interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-first-time-login',
  imports: [CardModule, InputTextModule, FloatLabelModule, ReactiveFormsModule, ButtonModule, CommonModule, ToastModule],
  templateUrl: './first-time-login.component.html',
  styleUrl: './first-time-login.component.scss',
  providers: [MessageService]
})
export class FirstTimeLoginComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  resetPasswordForm!: FormGroup;

  countdown = 0;
  isVerifyDisable: boolean = false
  private timerSub?: Subscription
  emailCooldown: string = 'emailCooldown'

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router, private auth: Auth, private messageService: MessageService) { }

  ngOnInit() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), this.upperLowerValidator(), this.digitValidator(), this.specialCharValidator()]],
      confirm_password: ['', [Validators.required, this.matchPasswordValidator()]],
    });
    this.checkCooldown();
  }

  ngOnDestroy(): void {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }

  onResetPassword() {
    if (!this.resetPasswordForm.valid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.resetPasswordForm.disable();
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
          this.resetPasswordForm.enable();
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

  async onSendVerificationEmail() {
    try {
      const user = await firstValueFrom(this.userService.currentUser$);
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.isVerifyDisable = true
      await this.userService.sendEmailVerification();
      const nextAvailableTime = Date.now() + 60 * 1000;
      localStorage.setItem(this.emailCooldown, nextAvailableTime.toString());
      this.startCountdown();
    } catch (error: any) {
      this.isVerifyDisable = false
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
    }
  }

  private startCountdown(seconds: number = 60) {
    this.countdown = seconds;
    this.isVerifyDisable = true;

    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
    this.timerSub = interval(1000).subscribe(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.isVerifyDisable = false;
        localStorage.removeItem(this.emailCooldown);
        if (this.timerSub) {
          this.timerSub.unsubscribe();
        }
      }
    })
  }

  private checkCooldown() {
    const storedTime = localStorage.getItem(this.emailCooldown);
    if (storedTime) {
      const timeLeft = parseInt(storedTime) - Date.now();
      if (timeLeft > 0) {
        this.startCountdown(Math.ceil(timeLeft / 1000));
      }
    }
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
