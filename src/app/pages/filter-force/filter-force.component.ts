import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog'
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FilterForceService, Message } from '../../services/filter-force.service';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton'

@Component({
  selector: 'app-filter-force',
  imports: [ButtonModule, Dialog, ToggleSwitchModule, ReactiveFormsModule, InputTextModule, CommonModule, TableModule, BadgeModule, ToastModule, SkeletonModule],
  templateUrl: './filter-force.component.html',
  styleUrl: './filter-force.component.scss',
  providers: [MessageService]
})
export class FilterForceComponent implements OnInit {
  visible: boolean = false;
  isLoading: boolean = true;
  isEditMsg: boolean = false;
  createMessageForm!: FormGroup;
  messages: Message[] = [] ;

  constructor(private fb: FormBuilder, private ffService: FilterForceService, private messageService: MessageService) {}

  ngOnInit() {
    this.createMessageForm = this.fb.group({
      message: ['', [Validators.required]],
      isDanger: [false],
      id: [''],
    });
    this.ffService.getMessages().subscribe({
      next: msgs => {
        this.messages = msgs;
        console.log(this.messages);
        this.isLoading = false;
      },
      error: err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
        this.isLoading = false;
      }
    })
  }

  async onCreateMessage() {
    if (!this.createMessageForm.valid) {
      this.createMessageForm.markAllAsTouched();
      return;
    }
    const payload: Message = {
      message: this.createMessageForm.get('message')?.value,
      is_danger: this.createMessageForm.get('isDanger')?.value,
    }
    try {
      this.ffService.createMessage(payload);
      this.toggleCreateMessageDialogVisibility();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'New message created!', life: 3000 });
    } catch (err) {
      if (err instanceof Error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: String(err), life: 3000 });
      }
    }
  }

  async onUpdateMessage() {
    if (!this.createMessageForm.valid) {
      this.createMessageForm.markAllAsTouched();
      return;
    }
    const payload: Message = {
      message: this.createMessageForm.get('message')?.value,
      is_danger: this.createMessageForm.get('isDanger')?.value,
    }
    const id: string = this.createMessageForm.get('id')?.value;
    try {
      this.ffService.updateMessage(id, payload);
      this.toggleCreateMessageDialogVisibility();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Message is updated!', life: 3000 });
    } catch (err) {
      if (err instanceof Error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: String(err), life: 3000 });
      }
    }
  }

  onEditState(index: number) {
    const editingMessage = this.messages[index];
    this.createMessageForm.setValue({
      message: editingMessage.message,
      isDanger: editingMessage.is_danger,
      id: editingMessage.id,
    })
    this.toggleCreateMessageDialogVisibility();
    this.isEditMsg = true;
    this.createMessageForm.markAsPristine();
  }

  toggleCreateMessageDialogVisibility() {
    if (this.visible) {
      this.resetCreateMessageForm();
    }
    if (this.isEditMsg) {
      this.isEditMsg = false;
    }
    this.visible = !this.visible;
  }

  resetCreateMessageForm() {
    this.createMessageForm.reset({
      message: '',
      isDanger: false,
      id: '',
    });
    if (this.isEditMsg) {
      this.isEditMsg = false;
    }
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.createMessageForm.get(controlName);
    return !!(control && control.touched && control.invalid);
  }
}
