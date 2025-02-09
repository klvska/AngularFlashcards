import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getSets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sets`);
  }

  getFlashcards(setId: number | null): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sets/${setId}/flashcards`);
  }

  addSet(name: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/sets`, { name });
  }

  addFlashcard(question: string, answer: string, setId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/flashcards`, { question, answer, setId });
  }

  updateSet(id: number, name: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/sets/${id}`, { name });
  }

  deleteSet(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/sets/${id}`);
  }

  updateFlashcard(id: number, question: string, answer: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/flashcards/${id}`, { question, answer });
  }

  deleteFlashcard(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/flashcards/${id}`);
  }
}
