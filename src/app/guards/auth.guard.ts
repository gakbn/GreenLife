import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      return true; // Permite el acceso si el usuario está autenticado y es admin
    } else {
      this.router.navigate(['/login']); // Redirige al login si no está autenticado o no es admin
      return false;
    }
  }
}