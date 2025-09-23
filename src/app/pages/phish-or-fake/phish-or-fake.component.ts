import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-phish-or-fake',
  imports: [ButtonModule, Dialog, CommonModule, ReactiveFormsModule, ToggleSwitchModule, TextareaModule, InputTextModule],
  templateUrl: './phish-or-fake.component.html',
  styleUrl: './phish-or-fake.component.scss'
})
export class PhishOrFakeComponent implements OnInit {
  visible: boolean = false;
  createEmailForm!: FormGroup;

  constructor(private fb: FormBuilder) {}
  
  ngOnInit() {
    this.createEmailForm = this.fb.group({
      subject: ['', [Validators.required]],
      senderEmail: ['', [Validators.required]],
      content: ['', [Validators.required]],
      isPhishing: [false],
    });
  }

  async onCreateEmail() {
    this.toggleCreateEmailDialogVisibility();
  }

  toggleCreateEmailDialogVisibility() {
    if (this.visible) {
      this.resetCreateEmailForm()
    }
    this.visible = !this.visible;
  }

  resetCreateEmailForm() {
    this.createEmailForm.reset({
      subject: '',
      senderEmail: '',
      content: '',
      isPhishing: false,
    });
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.createEmailForm.get(controlName);
    return !!(control && control.touched && control.invalid);
  }
}
