import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from "primeng/inputtext";
import { UserService } from '../../services/user.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [CardModule, InputTextModule, ButtonModule, ReactiveFormsModule, CommonModule, ToastModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  providers: [MessageService]
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private userService: UserService, private messageService: MessageService, private router: Router) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    })
  }

  async onSendResetPasswordEmail() {
    if (!this.forgotPasswordForm.valid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.forgotPasswordForm.disable();
    const email: string = this.forgotPasswordForm.get('email')?.value;
    try {
      await this.userService.sendResetPasswordEmail(email)
      this.router.navigate(['/login'])
    } catch (error: any) {
      if (error instanceof Error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: String(error), life: 3000 });
      }
      this.isLoading = false;
      this.forgotPasswordForm.enable();
    }
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.forgotPasswordForm.get(controlName);
    return !!(control && control.touched && control.invalid)
  }
}
