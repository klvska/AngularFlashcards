import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterModule, NgIf],
})
export class AppComponent implements OnInit {
  isLoggedIn = false;

  ngOnInit() {
    this.checkLoginState();
  }

  checkLoginState() {
    this.isLoggedIn = !!localStorage.getItem('token'); // Sprawdzenie tokena w localStorage
  }

  logout() {
    localStorage.removeItem('token'); // Usunięcie tokena
    this.isLoggedIn = false;
    window.location.reload(); // Odświeżenie aplikacji
  }
}
