import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  formSubmitted: boolean = false;
  showModal: boolean = false;
  modalMessage: string = '';
  showLicenseModalFlag: boolean = false;
  private apiUrl = `${environment.apiUrl}/login`;
  private adminUrl = `${environment.apiUrl}/admin`;
  private usuarioUrl = `${environment.apiUrl}/usuario`;

  constructor(private http: HttpClient, private router: Router, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|outlook\.es)$/)]],
      password: ['', [Validators.required, Validators.maxLength(20)]]
    });
  }

  isFormEmpty(): boolean {
    const values = this.loginForm.value;
    return !values.username && !values.password;
  }

  private getAuthHeaders(): HttpHeaders {
    const password = 'Gr33nL1f3#cgm#';
    return new HttpHeaders({
      'Authorization': `Bearer ${password}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  onSubmit(): void {
    this.formSubmitted = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.showModal = true;
      this.modalMessage = 'Por favor, completa los campos obligatorios';
      setTimeout(() => {
        this.showModal = false;
      }, 5000);
      return;
    }

    const loginData = {
      correo: this.loginForm.get('username')?.value,
      contrasena: this.loginForm.get('password')?.value
    };

    this.http.post(this.apiUrl, loginData, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (response: any) => {
          this.http.get(this.adminUrl, { headers: this.getAuthHeaders() })
            .subscribe({
              next: (adminResponse: any) => {
                const admins = adminResponse.data;
                const isAdmin = admins.some((admin: any) => admin.correo === loginData.correo);

                if (isAdmin) {
                  localStorage.setItem('role', 'admin');
                  localStorage.setItem('token', 'admin-token');
                  this.showModal = false;
                  this.formSubmitted = false;
                  this.router.navigate(['/admin']);
                } else {
                  this.http.get(this.usuarioUrl, { headers: this.getAuthHeaders() })
                    .subscribe({
                      next: (usuarioResponse: any) => {
                        const usuarios = usuarioResponse.data;
                        const isUsuario = usuarios.some((usuario: any) => usuario.correo === loginData.correo);

                        if (isUsuario) {
                          localStorage.setItem('role', 'usuario');
                          localStorage.setItem('token', 'usuario-token');
                          this.showModal = true;
                          this.modalMessage = 'No tienes una cuenta de administrador';
                          setTimeout(() => {
                            this.showModal = false;
                            this.formSubmitted = false;
                            this.router.navigate(['/inicio']);
                          }, 2000);
                        } else {
                          this.showModal = true;
                          this.modalMessage = 'Correo o contraseña incorrectos';
                          setTimeout(() => {
                            this.showModal = false;
                            this.formSubmitted = false;
                          }, 2000);
                        }
                      },
                      error: () => {
                        this.showModal = true;
                        this.modalMessage = 'Error al verificar usuario';
                        setTimeout(() => {
                          this.showModal = false;
                          this.formSubmitted = false;
                        }, 2000);
                      }
                    });
                }
              },
              error: () => {
                this.showModal = true;
                this.modalMessage = 'Error al verificar administrador';
                setTimeout(() => {
                  this.showModal = false;
                  this.formSubmitted = false;
                }, 2000);
              }
            });
        },
        error: (error) => {
          let message = 'Correo o contraseña incorrectos';
          if (error.message.includes('Mixed Content')) {
            message = 'Error: La API no es accesible debido a restricciones de seguridad del navegador';
          } else if (error.message.includes('CORS')) {
            message = 'Error: La API no permite acceso desde este dominio';
          }
          this.showModal = true;
          this.modalMessage = message;
          setTimeout(() => {
            this.showModal = false;
            this.formSubmitted = false;
          }, 5000);
        }
      });
  }

  showLicenseModal(): void {
    this.showLicenseModalFlag = true;
  }

  closeLicenseModal(): void {
    this.showLicenseModalFlag = false;
  }
}