import { Component } from '@angular/core';
import {FlashcardComponent} from './flashcard/flashcard.component';

@Component({
  selector: 'app-root',
  template: '<app-flashcard></app-flashcard>',
  imports: [
    FlashcardComponent
  ],
  standalone: true
})
export class AppComponent {}
