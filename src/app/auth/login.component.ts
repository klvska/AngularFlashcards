import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./auth.css'],
  imports: [
    FormsModule
  ]
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService) {}

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Logowanie udane:', response);
        alert('Logowanie zakończone sukcesem!');
        window.location.reload(); // Odświeżenie aplikacji
      },
      error: (error) => {
        console.error('Błąd logowania:', error);
        alert('Logowanie nie powiodło się.');
      },
    });
  }
}
