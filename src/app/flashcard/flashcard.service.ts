import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FlashcardService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getSets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sets`);
  }

  getSetById(setId: number) {
    return this.http.get<any>(`${this.baseUrl}/sets/${setId}`);
  }

  getFlashcards(setId: number | null): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sets/${setId}/flashcards`);
  }

  addSet(name: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(`${this.baseUrl}/sets`, { name }, { headers });
  }

  addFlashcard(
    question: string,
    answer: string,
    setId: number
  ): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<any>(
      `${this.baseUrl}/flashcards`,
      { question, answer, setId },
      { headers }
    );
  }

  updateSet(id: number, name: string): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );
    return this.http.put<any>(
      `${this.baseUrl}/sets/${id}`,
      { name },
      { headers }
    );
  }

  deleteSet(id: number): Observable<void> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );
    return this.http.delete<void>(`http://localhost:3000/sets/${id}`, {
      headers,
    });
  }

  updateFlashcard(
    id: number,
    question: string,
    answer: string
  ): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );
    return this.http.put<any>(`${this.baseUrl}/flashcards/${id}`, {
      question,
      answer,
    });
  }

  deleteFlashcard(id: number): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );
    return this.http.delete<any>(`${this.baseUrl}/flashcards/${id}`);
  }

  getUserSets(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(`${this.baseUrl}/users/sets`, { headers });
  }

  addMultipleFlashcards(
    flashcards: { question: string; answer: string; setId: number }[]
  ): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<any>(
      `${this.baseUrl}/flashcards/bulk`,
      { flashcards },
      { headers }
    );
  }

  // Pobieranie statystyk użytkownika
  getUserStats(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(`${this.baseUrl}/users/stats`, { headers });
  }

  saveQuizResult(
    quizId: number,
    score: number,
    timeSpent: number
  ): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(
      `${this.baseUrl}/quiz-attempts`,
      { quizId, score, timeSpent },
      { headers }
    );
  }

  createQuiz(setId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<any>(
      `${this.baseUrl}/sets/${setId}/quiz`,
      {},
      { headers }
    );
  }
}
