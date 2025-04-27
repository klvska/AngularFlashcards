import { Component } from '@angular/core';
import { FlashcardService } from '../flashcard/flashcard.service';
import { FormsModule } from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-add-set',
  templateUrl: './add-set.component.html',
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./add-set.component.css']
})
export class AddSetComponent {
  newSet = { name: '' };
  newFlashcard = { question: '', answer: '', setId: '' };
  newFlashcards: { question: string; answer: string }[] = []; // Dodano deklarację
  userSets: any[] = [];
  isSetAdded = false;

  constructor(private flashcardService: FlashcardService) {}

  addSet() {
    this.flashcardService.addSet(this.newSet.name).subscribe(newSet => {
      alert('Zestaw został dodany!');
      this.isSetAdded = true;
      this.loadUserSets();
    });
  }

  loadUserSets() {
    this.flashcardService.getUserSets().subscribe(sets => {
      this.userSets = sets;
    });
  }

  addFlashcard() {
    const flashcards = this.newFlashcards.map(flashcard => ({
      question: flashcard.question,
      answer: flashcard.answer,
      setId: Number(this.newFlashcard.setId),
    }));

    console.log('Wysyłane fiszki:', flashcards); // Log danych

    this.flashcardService.addMultipleFlashcards(flashcards).subscribe({
      next: () => {
        alert('Fiszki zostały dodane!');
        this.newFlashcards = [{ question: '', answer: '' }];
      },
      error: (err) => {
        console.error('Błąd podczas dodawania fiszek:', err);
      },
    });
  }

  addNewFlashcardField() {
    this.newFlashcards.push({ question: '', answer: '' });
  }

  removeFlashcardField(index: number) {
    this.newFlashcards.splice(index, 1);
  }
}
