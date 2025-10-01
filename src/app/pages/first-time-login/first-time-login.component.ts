import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-first-time-login',
  imports: [CardModule, InputTextModule, FloatLabelModule, ReactiveFormsModule, ButtonModule, CommonModule],
  templateUrl: './first-time-login.component.html',
  styleUrl: './first-time-login.component.scss'
})
export class FirstTimeLoginComponent implements OnInit {
  resetPasswordForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required]],
      confirm_password: ['', [Validators.required]],
    });
  }

  onResetPassword() {
    
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.resetPasswordForm.get(controlName);
    return !!(control && control.touched && control.invalid)
  }
}
