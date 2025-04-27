import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlashcardService } from './flashcard.service';
import { Router } from '@angular/router';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-flashcard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flashcard.component.html',
  styleUrls: ['./flashcard.component.css']
})
export class FlashcardComponent implements OnInit {
  isLoggedIn = false;
  sets: any[] = [];
  selectedSetId: number | null = null;
  newSet = { name: '' };
  newFlashcard = { question: '', answer: '' };

  constructor(private flashcardService: FlashcardService, private cdr: ChangeDetectorRef, private router: Router) {}

  refreshLoginState() {
    this.isLoggedIn = !!localStorage.getItem('token'); // Sprawdzenie tokena
  }

  navigateToSet(setId: number) {
    this.router.navigate([`/set/${setId}`]);
  }

  ngOnInit() {
    this.refreshLoginState();
    this.loadSets();
  }

  loadSets() {
    this.flashcardService.getSets().subscribe(sets => {
      console.log('Sets fetched:', sets);
      this.sets = sets.map(set => ({
        ...set,
        flashcards: set.flashcards || []
      }));
    });
  }

  loadFlashcards(setId: number | null) {
    this.flashcardService.getFlashcards(setId).subscribe((flashcards: Flashcard[]) => {
      console.log('Flashcards fetched for set', setId, ':', flashcards);
      const set = this.sets.find(s => s.id === setId);
      if (set) {
        set.flashcards = flashcards.sort((a: Flashcard, b: Flashcard) => a.id - b.id);
      }
    });
  }

  addSet() {
    this.flashcardService.addSet(this.newSet.name).subscribe(newSet => {
      console.log('New set added:', newSet);
      this.sets.push({ ...newSet, flashcards: [] });
      this.newSet.name = '';
    });
  }

  addFlashcard() {
    if (this.selectedSetId !== null) {
      this.flashcardService.addFlashcard(this.newFlashcard.question, this.newFlashcard.answer, this.selectedSetId).subscribe((newFlashcard: Flashcard) => {
        console.log('New flashcard added:', newFlashcard);
        const updatedSets = this.sets.map(set => {
          if (set.id === this.selectedSetId) {
            return {
              ...set,
              flashcards: [...set.flashcards, newFlashcard]
            };
          }
          return set;
        });
        this.sets = [...updatedSets]; // Przypisanie nowej referencji
        this.newFlashcard = { question: '', answer: '' };
      });
    }
  }

  updateSet(setId: number, currentName: string) {
    const newName = prompt('Enter new set name:', currentName);
    if (newName !== null) {
      this.flashcardService.updateSet(setId, newName).subscribe(() => {
        console.log('Set updated:', newName);
        const set = this.sets.find(s => s.id === setId);
        if (set) {
          set.name = newName;
        }
        alert(`Set updated: ${newName}`);
      });
    }
  }

  updateFlashcard(flashcardId: number, currentQuestion: string, currentAnswer: string) {
    const newQuestion = prompt('Enter new question:', currentQuestion);
    const newAnswer = prompt('Enter new answer:', currentAnswer);
    if (newQuestion !== null && newAnswer !== null) {
      this.flashcardService.updateFlashcard(flashcardId, newQuestion, newAnswer).subscribe(() => {
        console.log('Flashcard updated:', newQuestion, newAnswer);
        const set = this.sets.find(s => s.id === this.selectedSetId);
        if (set) {
          const flashcard = set.flashcards.find((f: { id: number; }) => f.id === flashcardId);
          if (flashcard) {
            flashcard.question = newQuestion;
            flashcard.answer = newAnswer;
          }
        }
        alert(`Flashcard updated: ${newQuestion} - ${newAnswer}`);
        window.location.reload();
      });
    }
  }

  deleteSet(id: number) {
    this.flashcardService.deleteSet(id).subscribe({
      next: () => {
        console.log('Set deleted:', id);
        this.sets = this.sets.filter(set => set.id !== id);
      },
      error: (error) => {
        console.error('Error deleting set:', error);
      }
    });
  }

  deleteFlashcard(id: number) {
    this.flashcardService.deleteFlashcard(id).subscribe(() => {
      console.log('Flashcard deleted:', id);
      const set = this.sets.find(s => s.id === this.selectedSetId);
      if (set) {
        set.flashcards = set.flashcards.filter((f: { id: number; }) => f.id !== id);
      }
    });
  }
}
