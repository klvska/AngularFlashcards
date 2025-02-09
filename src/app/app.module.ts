import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { FlashcardComponent } from './flashcard/flashcard.component';

@NgModule({
  imports: [BrowserModule, HttpClientModule, FlashcardComponent],
  providers: [],
})
export class AppModule {}

bootstrapApplication(AppComponent);
