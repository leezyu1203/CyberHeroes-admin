import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { CommonModule } from "@angular/common";
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CardModule, InputTextModule, FloatLabelModule, ReactiveFormsModule, ButtonModule, CommonModule, ToastModule, DialogModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService]
})
export class LoginComponent {
  loginForm!: FormGroup
  isLoading = false;
  dialogVisible: boolean = true;
  verificationDisable: boolean = false;

  constructor(private fb: FormBuilder, private auth: Auth, private router: Router, private userService: UserService, private messageService: MessageService) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  async onLogin() {
    // console.log("Sign In button clicked")
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.loginForm.disable();
    const { email, password } = this.loginForm.value;
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      const user = await this.auth.currentUser;
      if (user) {
        await this.userService.setCustomClaims();
        await user.getIdToken(true);
        this.router.navigate(['/verify-email']);
        // console.log((await user.getIdTokenResult()).claims['is_first_login']);
      }
      // alert('Login successfull!');
    } catch (err: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
    } finally {
      this.loginForm.enable()
      this.isLoading = false
    }
  }

  onForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.touched && control.invalid)
  }
}
