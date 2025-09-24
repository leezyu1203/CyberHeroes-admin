import { Component, OnInit } from '@angular/core';
import { QuizLevel, QuizService } from '../../services/quiz.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-quiz',
  imports: [ButtonModule, RouterLink, CommonModule, SkeletonModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss',
  providers: [MessageService]
})
export class QuizComponent implements OnInit {
  isLoading: boolean = true;
  quizLevels: QuizLevel[] = [];

  constructor(private quizService: QuizService, private messageService: MessageService) {}

  ngOnInit() {
    this.quizService.getQuizLevels().subscribe({
      next: res => {
        this.quizLevels = res;
        console.log(this.quizLevels);
        this.isLoading = false;
      }, 
      error: err => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
        this.isLoading = false;
      }
    })
  }
}
