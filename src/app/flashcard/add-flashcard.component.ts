import { Component, OnInit } from '@angular/core';
import { FlashcardService } from './flashcard.service';
import { FormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-add-flashcard',
  templateUrl: './add-flashcard.component.html',
  imports: [
    FormsModule,
    NgForOf
  ],
  styleUrls: ['./add-flashcard.component.css']
})
export class AddFlashcardComponent implements OnInit {
  sets: any[] = [];
  selectedSetId: number | null = null;
  flashcards: { question: string; answer: string }[] = [{ question: '', answer: '' }];

  constructor(private flashcardService: FlashcardService) {}

  ngOnInit(): void {
    this.loadSets();
  }

  loadSets(): void {
    this.flashcardService.getSets().subscribe({
      next: (data) => (this.sets = data),
      error: (err) => console.error('Błąd ładowania zestawów:', err),
    });
  }

  addNewFlashcard(): void {
    this.flashcards.push({ question: '', answer: '' });
  }

  removeFlashcard(index: number): void {
    this.flashcards.splice(index, 1);
  }

  addFlashcards(): void {
    if (this.selectedSetId !== null) {
      const flashcardsWithSetId = this.flashcards.map(flashcard => ({
        ...flashcard,
        setId: this.selectedSetId as number
      }));

      this.flashcardService.addMultipleFlashcards(flashcardsWithSetId).subscribe({
        next: () => {
          alert('Fiszki zostały dodane!');
          this.flashcards = [{ question: '', answer: '' }];
        },
        error: (err) => console.error('Błąd dodawania fiszek:', err),
      });
    } else {
      console.error('selectedSetId jest null i nie można dodać fiszek.');
    }
  }
}
