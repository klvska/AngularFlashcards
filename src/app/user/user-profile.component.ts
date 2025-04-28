import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlashcardService } from '../flashcard/flashcard.service';
import { FormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NgForOf],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  userSets: any[] = [];
  stats: any = null;

  constructor(private flashcardService: FlashcardService) {}

  ngOnInit() {
    this.loadUserSets();
    this.loadUserStats();
  }

  loadUserSets() {
    this.flashcardService.getUserSets().subscribe((sets) => {
      this.userSets = sets;
    });
  }

  loadUserStats() {
    this.flashcardService.getUserStats().subscribe((stats) => {
      // Mapowanie nazw z backendu na te używane w szablonie
      this.stats = {
        totalSets: stats.setsCount,
        totalFlashcards: stats.flashcardsCount,
        totalQuizzes: stats.quizzesCount,
        averageScore: stats.averageScore,
      };
    });
  }

  refreshStats() {
    this.loadUserStats();
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
