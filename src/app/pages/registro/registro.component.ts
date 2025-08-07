import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  registerForm: FormGroup;
  showModal: boolean = false;
  modalMessage: string = '';
  modalType: 'success' | 'error' = 'success';
  showLicenseModalFlag: boolean = false;
  formSubmitted: boolean = false; // Nueva variable para rastrear envío
  private apiUrl = 'http://74.208.44.191:3004/api/usuario';

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apPaterno: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apMaterno: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|outlook\.es)$/)]],
      password: ['', [Validators.required, Validators.maxLength(20)]],
      fechaNacimiento: ['', Validators.required]
    });
  }

  // Función para verificar si el formulario está completamente vacío
  isFormEmpty(): boolean {
    const values = this.registerForm.value;
    return !values.name && !values.apPaterno && !values.apMaterno && !values.email && !values.password && !values.fechaNacimiento;
  }

  private getAuthHeaders(): HttpHeaders {
    const password = 'Gr33nL1f3#cgm#';
    return new HttpHeaders({
      'Authorization': `Bearer ${password}`,
      'Accept': 'application/json'
    });
  }

  onSubmit(): void {
    this.formSubmitted = true; // Marcar que se intentó enviar el formulario

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.showModal = true;
      this.modalMessage = 'Por favor, completa los campos obligatorios';
      this.modalType = 'error';
      setTimeout(() => {
        this.showModal = false;
      }, 5000);
      return;
    }

    const formData = new FormData();
    formData.append('Nombre', this.registerForm.get('name')?.value);
    formData.append('ApPaterno', this.registerForm.get('apPaterno')?.value);
    formData.append('ApMaterno', this.registerForm.get('apMaterno')?.value);
    formData.append('Correo', this.registerForm.get('email')?.value);
    formData.append('Contrasena', this.registerForm.get('password')?.value);
    formData.append('FechaNacimiento', this.registerForm.get('fechaNacimiento')?.value);

    console.log('Enviando datos a la API:', {
      Nombre: this.registerForm.get('name')?.value,
      ApPaterno: this.registerForm.get('apPaterno')?.value,
      ApMaterno: this.registerForm.get('apMaterno')?.value,
      Correo: this.registerForm.get('email')?.value,
      Contrasena: this.registerForm.get('password')?.value,
      FechaNacimiento: this.registerForm.get('fechaNacimiento')?.value
    });

    this.http.post(this.apiUrl, formData, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.showModal = true;
          this.modalMessage = 'Registro exitoso';
          this.modalType = 'success';
          setTimeout(() => {
            this.showModal = false;
            this.registerForm.reset();
            this.formSubmitted = false; // Resetear formSubmitted
          }, 3000);
        },
        error: (error) => {
          console.error('Error al registrar:', error);
          this.showModal = true;
          this.modalMessage = 'Ocurrió un error al registrarse';
          this.modalType = 'error';
          setTimeout(() => {
            this.showModal = false;
            this.formSubmitted = false; // Resetear formSubmitted
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