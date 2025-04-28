import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FlashcardService } from '../flashcard/flashcard.service';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-set-detail',
  templateUrl: './set-detail.component.html',
  imports: [NgForOf, NgIf],
  styleUrls: ['./set-detail.component.css'],
})
export class SetDetailComponent implements OnInit {
  set: any;
  flashcards: any[] = [];

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
    });
  }

  currentIndex = 0;

  toggleFlashcard() {
    this.flashcards[this.currentIndex].flipped =
      !this.flashcards[this.currentIndex].flipped;
  }

  prevFlashcard() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextFlashcard() {
    if (this.currentIndex < this.flashcards.length - 1) {
      this.currentIndex++;
    }
  }

  selectFlashcard(index: number) {
    this.currentIndex = index;
  }

  createQuiz() {
    this.flashcardService.createQuiz(this.set.id).subscribe({
      next: (quiz) => {
        this.router.navigate(['/set', this.set.id, 'quiz']);
      },
      error: (err) => {
        console.error('Błąd podczas tworzenia quizu:', err);
      },
    });
  }
}
