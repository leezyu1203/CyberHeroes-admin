import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { PasswordRushService, Rule } from '../../services/password-rush.service';

@Component({
  selector: 'app-password-rush',
  imports: [ButtonModule, InputTextModule, ReactiveFormsModule, CommonModule, Dialog, SkeletonModule, ToastModule, TableModule],
  templateUrl: './password-rush.component.html',
  styleUrl: './password-rush.component.scss',
  providers: [MessageService]
})
export class PasswordRushComponent implements OnInit {
  visible: boolean = false;
  isLoading: boolean = true;
  createRuleForm!: FormGroup;
  rules: Rule[] = [];

  constructor(private fb: FormBuilder, private prService: PasswordRushService, private messageService: MessageService) {}

  ngOnInit() {
    this.createRuleForm = this.fb.group({
      description: ['', [Validators.required]],
      words: ['', [Validators.required]],
    });
    this.prService.getRules().subscribe({
      next: res => {
        this.rules = res;
        console.log(this.rules);
        this.isLoading = false;
      }, error: err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
        this.isLoading = false;
      }
    })
  }

  async onCreateRule() {
    this.toggleCreateRuleDialogVisibility();
  }

  toggleCreateRuleDialogVisibility() {
    if (this.visible) {
      this.resetCreateRuleForm();
    }
    this.visible = !this.visible;
  }

  resetCreateRuleForm() {
    this.createRuleForm.reset({
      description: '',
      words: '',
    });
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.createRuleForm.get(controlName);
    return !!(control && control.touched && control.invalid);
  }
}
