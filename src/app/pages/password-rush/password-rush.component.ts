import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-password-rush',
  imports: [ButtonModule, InputTextModule, ReactiveFormsModule, CommonModule, Dialog],
  templateUrl: './password-rush.component.html',
  styleUrl: './password-rush.component.scss'
})
export class PasswordRushComponent implements OnInit {
  visible: boolean = false;
  createRuleForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createRuleForm = this.fb.group({
      description: ['', [Validators.required]],
      words: ['', [Validators.required]],
    });
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
