import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlashcardComponent } from './flashcard/flashcard.component';
import { SetDetailComponent } from './set/set-detail.component';
import { AddSetComponent } from './set/add-set.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { UserProfileComponent } from './user/user-profile.component';
import { AddFlashcardComponent } from './flashcard/add-flashcard.component';
import { QuizComponent } from './set/quiz.component';

export const routes: Routes = [
  { path: '', component: FlashcardComponent },
  { path: 'set/:id', component: SetDetailComponent },
  { path: 'set/:id/quiz', component: QuizComponent },
  { path: 'add-set', component: AddSetComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'user-profile', component: UserProfileComponent },
  { path: 'add-flashcard', component: AddFlashcardComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
