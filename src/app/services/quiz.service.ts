import { inject, Injectable } from '@angular/core';
import { collection, collectionData, CollectionReference, DocumentData, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface QuizLevel {
  id?: string;
  level: number;
  level_name: string;
  next_quiz_id?: string;
  question_num: number;
}

export interface QuizQuestion {
  id?: string;
  explanation: string;
  question: string;
}

export interface QuizAnswer {
  id?: string;
  answer: string;
  is_true: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private firestore = inject(Firestore);
  private levelsRef: CollectionReference<DocumentData>;

  levelsCollection = 'quiz_levels';

  constructor() { 
    this.levelsRef = collection(this.firestore, this.levelsCollection);
  }

  getQuizLevels(): Observable<QuizLevel[]> {
    return collectionData(this.levelsRef, { idField: 'id' }) as Observable<QuizLevel[]>;
  }
}
