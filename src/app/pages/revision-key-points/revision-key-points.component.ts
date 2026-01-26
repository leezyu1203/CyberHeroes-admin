import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { KeyPoint, RevisionKeyPointsService } from '../../services/revision-key-points.service';
import { NgIf, NgForOf } from "@angular/common";
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from "primeng/toast";
import { MessageService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from "primeng/inputtext";
import { DialogService } from '../../service/dialog.service';

@Component({
  selector: 'app-revision-key-points',
  imports: [ButtonModule, NgIf, SkeletonModule, ToastModule, AccordionModule, DialogModule, ReactiveFormsModule, InputTextModule, NgForOf],
  templateUrl: './revision-key-points.component.html',
  styleUrl: './revision-key-points.component.scss',
  providers: [MessageService]
})
export class RevisionKeyPointsComponent implements OnInit {
  isLoading: boolean = true;
  isKeyPointEditing: boolean = false;
  isFormLoading: boolean = false;
  visible: boolean = false;
  keyPoints: KeyPoint[] = [];
  createKeyPointForm!: FormGroup;
  hasAction: boolean = false;

  constructor(private rkpService: RevisionKeyPointsService, private messageService: MessageService, private cdr: ChangeDetectorRef, private fb: FormBuilder, public dialogService: DialogService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.rkpService.getKeyPoints().subscribe({
      next: kps => {
        this.keyPoints = kps;
        console.log(this.keyPoints);
        this.isLoading = false;
        this.cdr.detectChanges();
      }, error: err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
        this.isLoading = false;
        this.cdr.detectChanges();
      }, complete: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    this.createKeyPointForm = this.fb.group({
      topic: ['', [Validators.required]],
      tips: this.fb.array([
        this.tipForm(),
      ]),
      id: [''],
    })
  }

  async onCreateKeyPoints() {
    if (!this.createKeyPointForm.valid) {
      this.createKeyPointForm.markAllAsTouched();
      return;
    }
    if (this.tips.length <= 0) {
      return;
    }
    this.isFormLoading = true;
    this.createKeyPointForm.disable();
    const payload: KeyPoint = {
      topic: this.createKeyPointForm.get('topic')?.value,
      tips: this.tips.controls.map(control => control.get('tip')?.value),
    }
    
    try {
      await this.rkpService.createKeyPoint(payload);
      this.toggleCreateKeyPointsDialogVisibility();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'New key point created!', life: 3000 });
    } catch (err) {
      if (err instanceof Error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: String(err), life: 3000 });
      }
      this.isFormLoading = false;
      this.createKeyPointForm.enable();
    }
  }

  async onUpdateKeyPoint() {
    if (!this.createKeyPointForm.valid) {
      this.createKeyPointForm.markAllAsTouched();
      return;
    }
    if (this.tips.length <= 0) {
      return;
    }
    this.isFormLoading = true;
    this.createKeyPointForm.disable();
    const payload: KeyPoint = {
      topic: this.createKeyPointForm.get('topic')?.value,
      tips: this.tips.controls.map(control => control.get('tip')?.value),
    }
    const id: string = this.createKeyPointForm.get('id')?.value;
    try {
      this.rkpService.updateKeyPoint(id, payload);
      this.toggleCreateKeyPointsDialogVisibility();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Key point is updated!', life: 3000 });
    } catch (err) {
      if (err instanceof Error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: String(err), life: 3000 });
      }
      this.isFormLoading = false;
      this.createKeyPointForm.enable();
    }
  }

  onEditState(index: number) {
    const editingKeyPoint = this.keyPoints[index];
    this.createKeyPointForm.patchValue({
      topic: editingKeyPoint.topic,
      id: editingKeyPoint.id,
    });
    this.tips.clear();
    if (editingKeyPoint.tips) {
      editingKeyPoint.tips.forEach(tip => {
        this.tips.push(this.tipForm(tip));
      })
    }
    this.isKeyPointEditing = true;
    this.toggleCreateKeyPointsDialogVisibility();
  }

  async onDeleteKeyPoints(index: number) {
    this.hasAction = true;
    const deletingKeyPoint: KeyPoint = this.keyPoints[index];
    console.log("Delete Key Point: ", deletingKeyPoint);
    const id = deletingKeyPoint.id
    if (!id) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'The key point has no id', life: 3000 });
      return;
    }
    try {
      await this.rkpService.deleteKeyPoint(id);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Revision Key Point is deleted!', life: 3000 });
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

  get tips(): FormArray {
    return this.createKeyPointForm.get('tips') as FormArray;
  }

  tipForm(tip: string = ''): FormGroup {
    return this.fb.group({
      tip: [tip, [Validators.required]],
    })
  }
  
  onRemoveTipForm(index: number) {
    if (this.tips.length > 1) {
      this.tips.removeAt(index);
    }
  }

  toggleCreateKeyPointsDialogVisibility() {
    if (this.visible) {
      this.resetCreateKeyPointsForm();
    }
    this.visible = !this.visible;
    this.isFormLoading = false;
    this.createKeyPointForm.enable();
  }

  resetCreateKeyPointsForm() {
    this.createKeyPointForm.reset({
      topic: '',
    });
    this.tips.clear();
    this.tips.push(this.tipForm(''));

    this.createKeyPointForm.markAsPristine();
    this.createKeyPointForm.markAsUntouched();
    this.isKeyPointEditing = false;
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.createKeyPointForm.get(controlName);
    return !!(control && control.touched && control.invalid);
  }
}
