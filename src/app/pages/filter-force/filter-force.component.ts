import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog'
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-filter-force',
  imports: [ButtonModule, Dialog, ToggleSwitchModule, ReactiveFormsModule, InputTextModule, CommonModule],
  templateUrl: './filter-force.component.html',
  styleUrl: './filter-force.component.scss'
})
export class FilterForceComponent implements OnInit {
  visible: boolean = false;
  createMessageForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createMessageForm = this.fb.group({
      message: ['', [Validators.required]],
      isDanger: [false],
    });
  }

  async onCreateMessage() {
    this.toggleCreateMessageDialogVisibility();
  }

  toggleCreateMessageDialogVisibility() {
    if (this.visible) {
      this.resetCreateMessageForm();
    }
    this.visible = !this.visible;
  }

  resetCreateMessageForm() {
    this.createMessageForm.reset({
      message: '',
      isDanger: false,
    });
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.createMessageForm.get(controlName);
    return !!(control && control.touched && control.invalid);
  }
}
