import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  private apiUrl = 'http://74.208.44.191:3004/api/login';
  private adminUrl = 'http://74.208.44.191:3004/api/admin';
  private usuarioUrl = 'http://74.208.44.191:3004/api/usuario';

  constructor(private http: HttpClient, private router: Router, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|outlook\.es)$/)]],
      password: ['', [Validators.required, Validators.maxLength(20)]]
    });
  }

  // Verifica si el formulario está completamente vacío
  isFormEmpty(): boolean {
    const values = this.loginForm.value;
    return !values.username && !values.password;
  }

  // Encabezados para la API
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

    // Llamada al endpoint de login
    this.http.post(this.apiUrl, loginData, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (response: any) => {
          // Verificar si el usuario es administrador
          this.http.get(this.adminUrl, { headers: this.getAuthHeaders() })
            .subscribe({
              next: (adminResponse: any) => {
                const admins = adminResponse.data;
                const isAdmin = admins.some((admin: any) => admin.correo === loginData.correo);

                if (isAdmin) {
                  // Guardar rol en localStorage
                  localStorage.setItem('role', 'admin');
                  localStorage.setItem('token', 'admin-token'); // Token genérico, ajusta si la API devuelve uno
                  this.showModal = false;
                  this.formSubmitted = false;
                  this.router.navigate(['/admin']);
                } else {
                  // Verificar si es usuario normal
                  this.http.get(this.usuarioUrl, { headers: this.getAuthHeaders() })
                    .subscribe({
                      next: (usuarioResponse: any) => {
                        const usuarios = usuarioResponse.data;
                        const isUsuario = usuarios.some((usuario: any) => usuario.correo === loginData.correo);

                        if (isUsuario) {
                          // Guardar rol en localStorage
                          localStorage.setItem('role', 'usuario');
                          localStorage.setItem('token', 'usuario-token'); // Token genérico
                          this.showModal = true;
                          this.modalMessage = 'No tienes una cuenta de administrador';
                          setTimeout(() => {
                            this.showModal = false;
                            this.formSubmitted = false;
                            this.router.navigate(['/inicio']);
                          }, 2000);
                        } else {
                          // Correo no encontrado en admin ni usuario
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
        error: () => {
          this.showModal = true;
          this.modalMessage = 'Correo o contraseña incorrectos';
          setTimeout(() => {
            this.showModal = false;
            this.formSubmitted = false;
          }, 2000);
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