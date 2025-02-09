import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  addSet(name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sets`, { name });
  }

  getSets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sets`);
  }

  getFlashcards(setId: number | null): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/flashcards?setId=${setId}`);
  }

  addFlashcard(question: string, answer: string, setId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/flashcards`, { question, answer, setId });
  }
}
