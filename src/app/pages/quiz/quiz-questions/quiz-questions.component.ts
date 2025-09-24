import { Component, OnInit } from '@angular/core';
import { QuizLevel, QuizQuestion, QuizService } from '../../../services/quiz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { concatMap, filter, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-quiz-questions',
  imports: [ToastModule],
  templateUrl: './quiz-questions.component.html',
  styleUrl: './quiz-questions.component.scss',
  providers: [MessageService]
})
export class QuizQuestionsComponent implements OnInit {
  quizLevel?: QuizLevel;
  questions: QuizQuestion[] = [];

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
        },
        error: err => this.onError(err.message),
        complete: () => {
          if (!this.quizLevel) this.onError('Quiz level not found');
        }
      });
    } else {
      this.onError('Missing quiz level ID');
    }
  }

  onError(errMsg: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: errMsg, life: 3000});
    this.router.navigate(['/quiz']);
  }
}
