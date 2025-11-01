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
  isEditEmail: boolean = false;
  isFormLoading: boolean = false;
  isViewing: boolean = false;
  createEmailForm!: FormGroup;
  emails: Email[] = [];
  viewingEmail?: Email;
  hasAction: boolean = false;

  constructor(private fb: FormBuilder, private pofService: PhishOrFakeService, private messageService: MessageService) {}
  
  ngOnInit() {
    this.createEmailForm = this.fb.group({
      subject: ['', [Validators.required]],
      senderEmail: ['', [Validators.required]],
      content: ['', [Validators.required]],
      isPhishing: [false],
      id: [''],
    });
    this.pofService.getEmails().subscribe({
      next: res => {
        this.emails = res;
        console.log(this.emails);
        this.isLoading = false;
      }, error: err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
        this.isLoading = false;
      }, complete: () => {
        this.isLoading = false;
      }
    })
  }

  async onCreateEmail() {
    if (!this.createEmailForm.valid) {
      this.createEmailForm.markAllAsTouched();
      return
    }
    this.isFormLoading = true;
    const payload: Email = {
      subject: this.createEmailForm.get('subject')?.value,
      sender: this.createEmailForm.get('senderEmail')?.value,
      content: this.createEmailForm.get('content')?.value,
      is_phishing: this.createEmailForm.get('isPhishing')?.value,
    }
    try {
      await this.pofService.createEmail(payload);
      this.toggleCreateEmailDialogVisibility();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'New email created!', life: 3000 });
    } catch (err) {
      if (err instanceof Error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: String(err), life: 3000 });
      }
      this.isFormLoading = false;
    }
  }

  async onUpdateEmail() {
    if (!this.createEmailForm.valid) {
      this.createEmailForm.markAllAsTouched();
      return;
    }
    this.isFormLoading = true;
    const payload: Email = {
      subject: this.createEmailForm.get('subject')?.value,
      sender: this.createEmailForm.get('senderEmail')?.value,
      content: this.createEmailForm.get('content')?.value,
      is_phishing: this.createEmailForm.get('isPhishing')?.value,
    }
    const id: string = this.createEmailForm.get('id')?.value;
    try {
      this.pofService.updateEmail(id, payload);
      this.toggleCreateEmailDialogVisibility();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Email is updated!', life: 3000 });
    } catch (err) {
      if (err instanceof Error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: String(err), life: 3000 });
      }
      this.isFormLoading = false;
    }
  }

  async onDeleteEmail(id: string) {
    this.hasAction = true;
    try {
      await this.pofService.deleteEmail(id);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Email is deleted!', life: 3000 });
      this.hasAction = false;
    } catch (err) {
      if (err instanceof Error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: String(err), life: 3000 });
      }
      this.hasAction = false;
    }
  }

  onViewEmail(viewingEmail: Email) {
    this.isViewing = true;
    this.viewingEmail = viewingEmail;
  }

  onEditState(index: number) {
    const editingEmail = this.emails[index];
    this.createEmailForm.setValue({
      subject: editingEmail.subject,
      senderEmail: editingEmail.sender,
      content: editingEmail.content,
      isPhishing: editingEmail.is_phishing,
      id: editingEmail.id,
    });
    this.toggleCreateEmailDialogVisibility();
    this.isEditEmail = true;
    this.createEmailForm.markAsPristine();
  }

  toggleCreateEmailDialogVisibility() {
    if (this.visible) {
      this.resetCreateEmailForm()
    }
    this.visible = !this.visible;
    this.isFormLoading = false;
  }

  resetCreateEmailForm() {
    this.createEmailForm.reset({
      subject: '',
      senderEmail: '',
      content: '',
      isPhishing: false,
      id: '',
    });
    this.isEditEmail = false;
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.createEmailForm.get(controlName);
    return !!(control && control.touched && control.invalid);
  }
}
