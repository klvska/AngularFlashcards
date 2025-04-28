import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FlashcardService } from '../flashcard/flashcard.service';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  imports: [NgIf, FormsModule],
  styleUrls: ['./quiz.component.css'],
})
export class QuizComponent implements OnInit {
  set: any;
  flashcards: any[] = [];
  quizQuestions: any[] = [];
  currentQuestionIndex = 0;
  userAnswers: string[] = [];
  score = 0;
  quizCompleted = false;
  timeSpent = 0;
  timer: any;
  quizId = 0;
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flashcardService: FlashcardService
  ) {}

  ngOnInit() {
    const setId = Number(this.route.snapshot.paramMap.get('id'));
    this.flashcardService.getSetById(setId).subscribe((set) => {
      this.set = set;
      this.flashcards = set.flashcards || [];
      this.prepareQuiz();
      this.startTimer();
      this.quizId = set.id;
    });
  }

  prepareQuiz() {
    // Mieszamy fiszki
    this.quizQuestions = [...this.flashcards].sort(() => Math.random() - 0.5);
    // Inicjalizujemy tablicę odpowiedzi
    this.userAnswers = new Array(this.quizQuestions.length).fill('');
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.timeSpent++;
    }, 1000);
  }

  submitAnswer(answer: string) {
    this.userAnswers[this.currentQuestionIndex] = answer;

    if (this.currentQuestionIndex < this.quizQuestions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.completeQuiz();
    }
  }

  completeQuiz() {
    this.quizCompleted = true;
    clearInterval(this.timer);

    // Oblicz wynik jako procent poprawnych odpowiedzi
    const correctAnswers = this.quizQuestions.reduce((acc, question, index) => {
      return (
        acc +
        (this.userAnswers[index].toLowerCase() === question.answer.toLowerCase()
          ? 1
          : 0)
      );
    }, 0);

    // Przelicz na procenty (0-100)
    this.score = Math.round((correctAnswers / this.quizQuestions.length) * 100);

    // Zapisz wynik quizu do bazy danych
    this.flashcardService
      .saveQuizResult(this.quizId, this.score, this.timeSpent)
      .subscribe({
        next: () => {
          console.log('Wynik quizu został zapisany.');
        },
        error: (err) => {
          console.error('Błąd podczas zapisywania wyniku quizu:', err);
        },
      });
  }

  restartQuiz() {
    this.currentQuestionIndex = 0;
    this.userAnswers = new Array(this.quizQuestions.length).fill('');
    this.score = 0;
    this.quizCompleted = false;
    this.timeSpent = 0;
    this.prepareQuiz();
    this.startTimer();
  }

  goBackToSet() {
    this.router.navigate(['/set', this.set.id]);
  }
}
