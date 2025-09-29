import { Component, OnInit } from '@angular/core';
import { QuizLevel, QuizQuestion, QuizService } from '../../../services/quiz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { concatMap, filter, tap, throwError } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccordionModule, AccordionTabOpenEvent } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchChangeEvent, ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-quiz-questions',
  imports: [ToastModule, SkeletonModule, CommonModule, ButtonModule, InputNumberModule, FormsModule, AccordionModule, TableModule, BadgeModule, DialogModule, ReactiveFormsModule, InputTextModule, ToggleSwitchModule],
  templateUrl: './quiz-questions.component.html',
  styleUrl: './quiz-questions.component.scss',
  providers: [MessageService]
})
export class QuizQuestionsComponent implements OnInit {
  visible: boolean = false;
  isLoading: boolean = true;
  isQuesNumEditing: boolean = false;
  isQuesEditing: boolean = false;
  isUpdateQuesNumLoading: boolean = false;
  isFormLoading: boolean = false;
  quizLevel?: QuizLevel;
  questions: (QuizQuestion & { isEditing: boolean })[] = [];
  questionNumField: number = 0;

  createQuestionForm!: FormGroup;

  constructor(private quizService: QuizService, private route: ActivatedRoute, private router: Router, private messageService: MessageService, private fb: FormBuilder) {}

  ngOnInit() {
    const levelId = this.route.snapshot.paramMap.get('id');
    if (levelId) {
      this.quizService.getQuizLevelById(levelId).pipe(
        concatMap(level => {
          if (!level) {
            return throwError(() => new Error('Quiz level not found'));
          }
          this.quizLevel = level;
          return this.quizService.getQuestions(levelId);
        })
      ).subscribe({
        next: questions => {
          // this.questions = questions;
          this.questions = questions.map((ques: QuizQuestion) => ({
            ...ques,
            isEditing: false,
          }))
          console.log("level: ", this.quizLevel);
          console.log("question: ", this.questions);
          this.questionNumField = this.quizLevel?.question_num || 0;
          this.isLoading = false;
        },
        error: err => {
          this.onError(err.message);
          this.isLoading = false;
        },
        complete: () => {
          if (!this.quizLevel) this.onError('Quiz level not found');
        }
      });
    } else {
      this.onError('Missing quiz level ID');
      this.isLoading = false;
    }

    this.createQuestionForm = this.fb.group({
      question: ['', [Validators.required]],
      explanation: ['', [Validators.required]],
      answers: this.fb.array([
        this.answerForm('', true),
        this.answerForm(),
      ])
    });
  }

  onError(errMsg: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: errMsg, life: 3000});
    this.router.navigate(['/quiz']);
  }

  onAccordionOpen(event: AccordionTabOpenEvent) {
    console.log(event.index);
    const question: QuizQuestion = this.questions[event.index];
    const levelId = this.quizLevel?.id;
    if (!levelId || !question.id) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Something went wrong', life: 3000});
      return;
    }
    if (!question.answers) {
      this.quizService.getQuesAnswers(levelId, question.id).subscribe({
        next: res => {
          question.answers = res;
        }, error: err => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
        }
      })
    }
  }

  onCreateQuestion() {
    if (!this.createQuestionForm.valid) {
      // console.error('Form is invalid');
      this.createQuestionForm.markAllAsTouched();
      return;
    }
    if (this.checkAnswerValidity.noIsTrue || !this.checkAnswerValidity.onlyOne) {
      return;
    }
    this.toggleCreateQuestionDialogVisibility();
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'New question created!', life: 3000 });
  }

  onUpdateQuestion() {
    if (!this.createQuestionForm.valid) {
      // console.error('Form is invalid');
      this.createQuestionForm.markAllAsTouched();
      return;
    }
    if (this.checkAnswerValidity.noIsTrue || !this.checkAnswerValidity.onlyOne) {
      return;
    }
    this.toggleCreateQuestionDialogVisibility();
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Question is updated!', life: 3000 });
  }

  async onUpdateQuesNum(){
    if (!this.questionNumField || this.questionNumField <= 0 || this.questionNumField == this.quizLevel?.question_num) {
      return;
    }
    if (this.questionNumField > this.questions.length) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Cannot update value that exceed the total number of questions in the question bank'});
      return;
    }
    this.isUpdateQuesNumLoading = true;
    const payload: Partial<QuizLevel> = {
      question_num: this.questionNumField,
    }
    if (this.quizLevel?.id) {
      try {
        this.quizService.updateQuizLevel(this.quizLevel?.id, payload);
        this.toggleQuesNumEdit();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Quiz question number is updated!', life: 3000 });
        this.quizLevel.question_num = this.questionNumField;
      } catch (err) {
        if (err instanceof Error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: String(err), life: 3000 });
        }
      } finally {
        this.isUpdateQuesNumLoading = false;
      }
    }
  }

  onEditState(index: number) {
    const editingQues = this.questions[index];
    this.createQuestionForm.patchValue({
      question: editingQues.question,
      explanation: editingQues.explanation,
    });
    this.answers.clear();
    if (editingQues.answers) {
      editingQues.answers.forEach(ans => {
        this.answers.push(this.answerForm(ans.answer, ans.is_true));
      });
    }
    this.isQuesEditing = true;
    this.toggleCreateQuestionDialogVisibility();
  }

  get answers(): FormArray {
    return this.createQuestionForm.get('answers') as FormArray;
  }

  answerForm(answer: string = '', isTrue: boolean = false): FormGroup {
    return this.fb.group({
      answer: [answer , [Validators.required]],
      is_true: [isTrue],
    })
  }

  onRemoveAnswerForm(index: number) {
    if (this.answers.length > 2) {
      this.answers.removeAt(index);
    }
  }

  toggleCreateQuestionDialogVisibility() {
    if (this.visible) {
      this.resetCreateQuestionForm();
    }
    this.visible = !this.visible;
  }

  toggleQuesNumEdit() {
    if (!this.isQuesNumEditing) {
      this.questionNumField = this.quizLevel?.question_num || 0;
    }
    this.isQuesNumEditing = !this.isQuesNumEditing;
  }

  resetCreateQuestionForm() {
    this.createQuestionForm.reset({
      question: '',
      explanation: '',
    });
    this.answers.clear();
    this.answers.push(this.answerForm('', true));
    this.answers.push(this.answerForm());
    
    this.createQuestionForm.markAsPristine();
    this.createQuestionForm.markAsUntouched();
    this.isQuesEditing = false;
  }

  onSwitchChange(event: ToggleSwitchChangeEvent, index: number) {
    console.log(`Changed to: ${event.checked}; index: ${index}`);
    if (event.checked) {
      this.answers.controls.forEach((ans, i) => {
        if (i !== index) {
          if (ans.get('is_true')?.value) {
            ans.get('is_true')?.setValue(false);
          }
        }
      })
    }
  }

  get checkAnswerValidity(): { onlyOne?: boolean; noIsTrue?: boolean } {
    let hasTrue: boolean = false;
    let moreThanOneTrue: boolean = false;

    for (let ans of this.answers.controls) {
      if (ans.get('is_true')?.value) {
        if (!hasTrue) {
          hasTrue = true;
        } else {
          moreThanOneTrue = true;
          break;
        }
      }
    }

    if (moreThanOneTrue) return { onlyOne: false };
    if (!hasTrue) return { noIsTrue: true };
    return { onlyOne: true };
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.createQuestionForm.get(controlName);
    return !!(control && control.touched && control.invalid);
  }
}
