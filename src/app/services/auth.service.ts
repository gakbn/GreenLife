import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userRole: string = 'user'; // Rol por defecto: no autenticado

  login(username: string, password: string): boolean {
    if (username === 'admin@gmail.com' && password === 'admin123') {
      this.userRole = 'admin';
      localStorage.setItem('token', 'admin-token'); // Guardar token para persistencia
      localStorage.setItem('role', 'admin');
      return true;
    } else if (username === 'invitado@gmail.com' && password === 'invitado123') {
      this.userRole = 'invitado';
      localStorage.setItem('token', 'invitado-token');
      localStorage.setItem('role', 'invitado');
      return true;
    } else {
      this.userRole = 'user';
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      return false;
    }
  }

  logout(): void {
    this.userRole = 'user';
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token'); // Verifica si hay un token
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'admin';
  }

  isGuest(): boolean {
    return localStorage.getItem('role') === 'invitado';
  }

  getRole(): string {
    return localStorage.getItem('role') || 'user';
  }
}