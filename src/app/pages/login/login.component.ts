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

@Component({
  selector: 'app-login',
  imports: [CardModule, InputTextModule, FloatLabelModule, ReactiveFormsModule, ButtonModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm!: FormGroup

  constructor(private fb: FormBuilder, private auth: Auth, private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  async onLogin() {
    console.log("Sign In button clicked")
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.value;
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      const user = await this.auth.currentUser;
      if (user) {
        await this.userService.setSuperAdminClaim();
        await user.getIdToken(true);
        // console.log((await user.getIdTokenResult()).claims['is_superadmin']);
      }
      // alert('Login successfull!');
      this.router.navigate(['/']);
    } catch (err: any) {
      alert("Something sent wrong.\n" + err.message);
    }
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.touched && control.invalid)
  }
}
