import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./auth.css'],
  imports: [
    FormsModule
  ]
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';

  constructor(private authService: AuthService) {}

  register() {
    this.authService.register(this.name, this.email, this.password).subscribe({
      next: (response) => {
        console.log('Rejestracja udana:', response);
        alert('Rejestracja zakończona sukcesem!');
      },
      error: (error) => {
        console.error('Błąd rejestracji:', error);
        alert('Rejestracja nie powiodła się.');
      },
    });
  }
}
