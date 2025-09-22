import { Component, OnInit } from '@angular/core';
import { CardModule } from "primeng/card";
import { UserService } from '../../services/user.service';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import { InputText } from "primeng/inputtext";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch'

@Component({
  selector: 'app-admin-management',
  imports: [CardModule, NgIf, AsyncPipe, ButtonModule, Dialog, InputText, ReactiveFormsModule, CommonModule, ToggleSwitchModule],
  templateUrl: './admin-management.component.html',
  styleUrl: './admin-management.component.scss'
})
export class AdminManagementComponent implements OnInit {
  visible: boolean = false;
  createAdminForm!: FormGroup;

  constructor(public userService: UserService, private router: Router, private fb: FormBuilder) {}

  ngOnInit() {
    this.createAdminForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      isSuperadmin: [false],
    })
  }

  async onLogout() {
    await this.userService.logout();
    this.router.navigate(['/login']);
  }
  
  async onCreateAdmin() {
    this.onCloseCreateAdminDialog();
  }

  showCreateAdminDialog() {
    this.visible = true;
  }

  onCloseCreateAdminDialog() {
    this.visible = false;
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
