import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlashcardService } from './flashcard.service';

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
  sets: any[] = [];
  selectedSetId: number | null = null;
  newSet = { name: '' };
  newFlashcard = { question: '', answer: '' };

  constructor(private flashcardService: FlashcardService) {}

  ngOnInit() {
    this.loadSets();
  }

  loadSets() {
    this.flashcardService.getSets().subscribe(sets => {
      this.sets = sets.map(set => ({
        ...set,
        flashcards: set.flashcards || []
      }));
    });
  }

  loadFlashcards(setId: number | null) {
    this.flashcardService.getFlashcards(setId).subscribe((flashcards: Flashcard[]) => {
      const set = this.sets.find(s => s.id === setId);
      if (set) {
        set.flashcards = flashcards.sort((a: Flashcard, b: Flashcard) => a.id - b.id);
      }
    });
  }

  addSet() {
    this.flashcardService.addSet(this.newSet.name).subscribe(newSet => {
      this.loadSets();
      this.newSet.name = '';
    });
  }

  addFlashcard() {
    if (this.selectedSetId !== null) {
      this.flashcardService.addFlashcard(this.newFlashcard.question, this.newFlashcard.answer, this.selectedSetId).subscribe((newFlashcard: Flashcard) => {
        this.loadFlashcards(this.selectedSetId);
        this.newFlashcard = { question: '', answer: '' };
        window.location.reload();
      });
    }
  }
}
