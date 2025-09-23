import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { Email, PhishOrFakeService } from '../../services/phish-or-fake.service';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-phish-or-fake',
  imports: [ButtonModule, Dialog, CommonModule, ReactiveFormsModule, ToggleSwitchModule, TextareaModule, InputTextModule, SkeletonModule, TableModule, BadgeModule, ToastModule],
  templateUrl: './phish-or-fake.component.html',
  styleUrl: './phish-or-fake.component.scss',
  providers: [MessageService]
})
export class PhishOrFakeComponent implements OnInit {
  visible: boolean = false;
  isLoading: boolean = true;
  createEmailForm!: FormGroup;
  emails: Email[] = [];

  constructor(private fb: FormBuilder, private pofService: PhishOrFakeService, private messageService: MessageService) {}
  
  ngOnInit() {
    this.createEmailForm = this.fb.group({
      subject: ['', [Validators.required]],
      senderEmail: ['', [Validators.required]],
      content: ['', [Validators.required]],
      isPhishing: [false],
    });
    this.pofService.getEmails().subscribe({
      next: res => {
        this.emails = res;
        console.log(this.emails);
        this.isLoading = false;
      }, error: err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
        this.isLoading = false;
      }
    })
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
