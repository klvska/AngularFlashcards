import { Component, OnInit } from '@angular/core';
import { FlashcardService } from '../flashcard/flashcard.service';
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  imports: [
    FormsModule,
    NgForOf
  ],
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userSets: any[] = [];

  constructor(private flashcardService: FlashcardService) {}

  ngOnInit() {
    this.loadUserSets();
  }

  loadUserSets() {
    this.flashcardService.getUserSets().subscribe(sets => {
      this.userSets = sets;
    });
  }

  deleteSet(id: number): void {
    this.flashcardService.deleteSet(id).subscribe({
      next: () => {
        alert('Zestaw został usunięty!');
        this.loadUserSets(); // Odśwież listę zestawów
      },
      error: (err) => {
        console.error('Błąd podczas usuwania zestawu:', err);
      },
    });
  }

  updateSet(setId: number, newName: string) {
    this.flashcardService.updateSet(setId, newName).subscribe(() => {
      alert('Zestaw został zaktualizowany!');
      this.loadUserSets();
    });
  }
}
