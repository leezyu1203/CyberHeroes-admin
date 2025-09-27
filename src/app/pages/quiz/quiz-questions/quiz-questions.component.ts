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
import { FormsModule } from '@angular/forms';
import { AccordionModule, AccordionTabOpenEvent } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-quiz-questions',
  imports: [ToastModule, SkeletonModule, CommonModule, ButtonModule, InputNumberModule, FormsModule, AccordionModule, TableModule, BadgeModule],
  templateUrl: './quiz-questions.component.html',
  styleUrl: './quiz-questions.component.scss',
  providers: [MessageService]
})
export class QuizQuestionsComponent implements OnInit {
  isLoading: boolean = true;
  isQuesNumEditing: boolean = false;
  isUpdateQuesNumLoading: boolean = false;
  quizLevel?: QuizLevel;
  questions: QuizQuestion[] = [];
  questionNumField: number = 0;

  constructor(private quizService: QuizService, private route: ActivatedRoute, private router: Router, private messageService: MessageService) {}

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
          this.questions = questions;
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

  async onUpdateQuesNum(){
    if (!this.questionNumField || this.questionNumField <= 0 || this.questionNumField == this.quizLevel?.level) {
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

  toggleQuesNumEdit() {
    if (!this.isQuesNumEditing) {
      this.questionNumField = this.quizLevel?.question_num || 0;
    }
    this.isQuesNumEditing = !this.isQuesNumEditing;
  }
}
