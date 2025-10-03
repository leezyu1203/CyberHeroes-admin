import { inject, Injectable } from '@angular/core';
import { collection, collectionData, CollectionReference, doc, docData, DocumentData, Firestore, getDoc, serverTimestamp, updateDoc } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { from, Observable } from 'rxjs';

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
  answers?: QuizAnswer[];
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
  private functions = inject(Functions);
  private levelsRef: CollectionReference<DocumentData>;

  private levelsCollection = 'quiz_levels';
  private questionsCollection = 'questions';
  private answersCollection = 'answers';

  constructor() { 
    this.levelsRef = collection(this.firestore, this.levelsCollection);
  }

  getQuizLevels(): Observable<QuizLevel[]> {
    return collectionData(this.levelsRef, { idField: 'id' }) as Observable<QuizLevel[]>;
  }

  getQuizLevelById(levelId: string): Observable<QuizLevel> {
    const docRef = doc(this.firestore, `${this.levelsCollection}/${levelId}`);
    return docData(docRef, { idField: 'id' }) as Observable<QuizLevel>;
  }

  getQuestions(levelId: string): Observable<QuizQuestion[]> {
    const questionsRef = collection(this.firestore, `${this.levelsCollection}/${levelId}/${this.questionsCollection}`);
    return collectionData(questionsRef, { idField: 'id' }) as Observable<QuizQuestion[]>;
  }

  getQuesAnswers(levelId: string, questionId: string): Observable<QuizAnswer[]> {
    const answersRef = collection(this.firestore, `${this.levelsCollection}/${levelId}/${this.questionsCollection}/${questionId}/${this.answersCollection}`);
    return collectionData(answersRef, { idField: 'id' }) as Observable<QuizAnswer[]>;
  }

  async updateQuizLevel(id: string, payload: Partial<QuizLevel>) {
    console.log(id);
    const updateFn = httpsCallable(this.functions, 'updateQuizLevel');
    return updateFn({docId: id, payload: payload});
  }

  createQuizQuestion(id: string, payload: Partial<(QuizQuestion & { isEditing: boolean })>) {
    const createFn = httpsCallable(this.functions, 'createQuizQuestion');
    const req = {
      docId: id,
      payload: payload,
    }
    return from(createFn(req));
  }

  updateQuizQuestion(levelId: string, questionId: string, payload: Partial<(QuizQuestion & { isEditing: boolean })>) {
    const updateFn = httpsCallable(this.functions, 'updateQuizQuestion');
    const req = {
      levelId: levelId,
      questionId: questionId,
      payload: payload,
    }
    return from(updateFn(req));
  }
  
  async deleteQuizQuestion(levelId: string, questionId: string) {
    const deleteFn = httpsCallable(this.functions, 'deleteQuizQuestion');
    const req = {
      levelId: levelId,
      questionId: questionId,
    }
    await deleteFn(req);
  }
}
