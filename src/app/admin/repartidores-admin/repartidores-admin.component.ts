import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Interfaz para los datos crudos de la API
interface AdminRaw {
  idadministrador: number;
  nombre: string;
  appaterno: string;
  apmaterno: string;
  correo: string;
  contrasena: string;
  create_at?: string;
  update_at?: string | null;
  delete_at?: string | null;
}

// Interfaz para los datos mapeados que usa el componente
interface Admin {
  id: number;
  nombre: string;
  appaterno: string;
  apmaterno: string;
  correo: string;
  estado: string;
}

@Component({
  selector: 'app-repartidores-admin',
  standalone: false,
  templateUrl: './repartidores-admin.component.html',
  styleUrls: ['./repartidores-admin.component.scss']
})
export class RepartidoresAdminComponent implements OnInit {
  repartidores: Admin[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'appaterno', 'apmaterno', 'correo', 'estado', 'acciones'];
  private apiUrl = 'http://74.208.44.191:3004/api/admin';
  editForm: FormGroup;
  deleteForm: FormGroup;
  showModal: boolean = false;
  showDeleteModal: boolean = false;
  selectedAdmin: Admin | null = null;
  isEditMode: boolean = false;
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  successMessageText: string = '';
  errorMessageText: string = '';
  currentPage: number = 1;
  pageSize: number = 9;
  totalPages: number = 1;
  private adminPassword = 'Gr33n2dm1n!';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      id: [0],
      nombre: ['', Validators.required],
      appaterno: ['', Validators.required],
      apmaterno: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: [''],
      estado: ['', Validators.required]
    });
    this.deleteForm = this.fb.group({
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchAdmins();
  }

  // Helper method to create headers with the Bearer token
  private getAuthHeaders(): HttpHeaders {
    const password = 'Gr33nL1f3#cgm#';
    return new HttpHeaders({
      'Authorization': `Bearer ${password}`,
      'Content-Type': 'application/json'
    });
  }

  // GET: Fetch all admins
  fetchAdmins(): void {
    this.http.get<{ message: string, data: AdminRaw[] }>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          console.log('Respuesta de la API:', response);
          return response.data.map(item => ({
            id: item.idadministrador,
            nombre: item.nombre || '',
            appaterno: item.appaterno || '',
            apmaterno: item.apmaterno || '',
            correo: item.correo || '',
            estado: 'Disponible' // Valor por defecto ya que la API no lo devuelve
          }));
        }),
        catchError(error => {
          console.error('Error al obtener administradores:', error);
          console.log('Detalles del error:', error.message, error.status, error.statusText);
          return throwError(() => new Error('No se pudieron cargar los administradores'));
        })
      )
      .subscribe({
        next: (data) => {
          console.log('Administradores mapeados:', data);
          this.repartidores = data;
          this.updatePagination();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error en la suscripción:', err);
          this.showErrorMessage = true;
          this.errorMessageText = 'Error al cargar los administradores';
          setTimeout(() => this.dismissMessage(), 3000);
        }
      });
  }

  // Actualizar paginación
  updatePagination(): void {
    this.totalPages = Math.ceil(this.repartidores.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    if (this.currentPage < 1) this.currentPage = 1;
    this.cdr.detectChanges();
  }

  // Obtener administradores paginados
  getPaginatedAdmins(): Admin[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.repartidores.slice(startIndex, endIndex);
  }

  // Navegar a la página anterior
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.detectChanges();
    }
  }

  // Navegar a la página siguiente
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }

  // Abrir modal para crear un nuevo administrador
  openCreateModal(): void {
    this.isEditMode = false;
    this.editForm.reset();
    this.editForm.get('contrasena')?.setValidators([Validators.required]);
    this.editForm.get('estado')?.setValue('Disponible'); // Valor por defecto
    this.showModal = true;
  }

  // Abrir modal de edición
  openModal(admin: Admin): void {
    this.isEditMode = true;
    this.editForm.get('contrasena')?.clearValidators();
    this.editForm.get('contrasena')?.updateValueAndValidity();
    this.editForm.setValue({
      id: admin.id,
      nombre: admin.nombre,
      appaterno: admin.appaterno,
      apmaterno: admin.apmaterno,
      correo: admin.correo,
      contrasena: '',
      estado: admin.estado
    });
    this.showModal = true;
  }

  // Cerrar modal de edición/creación
  closeModal(): void {
    this.showModal = false;
    this.editForm.reset();
    this.isEditMode = false;
    this.editForm.get('contrasena')?.clearValidators();
    this.editForm.get('contrasena')?.updateValueAndValidity();
  }

  // Guardar administrador (crear o actualizar)
  saveAdmin(): void {
    if (this.editForm.valid) {
      const formValue = this.editForm.value;
      if (this.isEditMode) {
        this.updateAdmin(formValue);
      } else {
        this.createAdmin(formValue);
      }
    }
  }

  // POST: Crear un nuevo administrador
  createAdmin(formValue: any): void {
    const body = {
      Nombre: formValue.nombre,
      ApPaterno: formValue.appaterno,
      ApMaterno: formValue.apmaterno,
      Correo: formValue.correo,
      Contrasena: formValue.contrasena
    };
    this.http.post<{ message: string, data: AdminRaw }>(this.apiUrl, body, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => ({
          id: response.data.idadministrador,
          nombre: response.data.nombre || '',
          appaterno: response.data.appaterno || '',
          apmaterno: response.data.apmaterno || '',
          correo: response.data.correo || '',
          estado: 'Disponible' // Valor por defecto
        })),
        catchError(error => {
          console.error('Error al crear administrador:', error);
          console.log('Detalles del error:', error.message, error.status, error.statusText);
          return throwError(() => new Error('No se pudo crear el administrador'));
        })
      )
      .subscribe({
        next: (newAdmin) => {
          this.repartidores = [...this.repartidores, newAdmin];
          this.updatePagination();
          this.closeModal();
          this.cdr.detectChanges();
          this.showSuccessMessage = true;
          this.successMessageText = 'Administrador creado';
          setTimeout(() => this.dismissMessage(), 3000);
        },
        error: (err) => {
          this.closeModal();
          this.showErrorMessage = true;
          this.errorMessageText = 'Error al crear el administrador';
          setTimeout(() => this.dismissMessage(), 3000);
        }
      });
  }

  // PUT: Actualizar un administrador
  updateAdmin(formValue: any): void {
    const url = `${this.apiUrl}/${formValue.id}`;
    const body = {
      Nombre: formValue.nombre,
      ApPaterno: formValue.appaterno,
      ApMaterno: formValue.apmaterno,
      Correo: formValue.correo,
      estado: formValue.estado
    };
    this.http.put<{ message: string, data: AdminRaw }>(url, body, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => ({
          id: response.data.idadministrador,
          nombre: response.data.nombre || '',
          appaterno: response.data.appaterno || '',
          apmaterno: response.data.apmaterno || '',
          correo: response.data.correo || '',
          estado: formValue.estado // Mantiene el estado del formulario
        })),
        catchError(error => {
          console.error('Error al actualizar administrador:', error);
          console.log('Detalles del error:', error.message, error.status, error.statusText);
          return throwError(() => new Error('No se pudo actualizar el administrador'));
        })
      )
      .subscribe({
        next: (updatedAdmin) => {
          this.repartidores = this.repartidores.map(r => r.id === updatedAdmin.id ? updatedAdmin : r);
          this.updatePagination();
          this.closeModal();
          this.cdr.detectChanges();
          this.showSuccessMessage = true;
          this.successMessageText = 'Administrador actualizado';
          setTimeout(() => this.dismissMessage(), 3000);
        },
        error: (err) => {
          this.closeModal();
          this.showErrorMessage = true;
          this.errorMessageText = 'Error al actualizar el administrador';
          setTimeout(() => this.dismissMessage(), 3000);
        }
      });
  }

  // Abrir modal de eliminación
  openDeleteModal(admin: Admin): void {
    this.selectedAdmin = admin;
    this.deleteForm.reset();
    this.showDeleteModal = true;
  }

  // Cerrar modal de eliminación
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedAdmin = null;
    this.deleteForm.reset();
  }

  // DELETE: Eliminar un administrador
  deleteAdmin(): void {
    if (this.deleteForm.valid && this.selectedAdmin) {
      const enteredPassword = this.deleteForm.get('password')?.value;
      if (enteredPassword !== this.adminPassword) {
        this.showErrorMessage = true;
        this.errorMessageText = 'Contraseña de administrador incorrecta';
        setTimeout(() => this.dismissMessage(), 3000);
        this.cdr.detectChanges();
        return;
      }

      const url = `${this.apiUrl}/${this.selectedAdmin.id}`;
      this.http.delete<{ message: string }>(url, { headers: this.getAuthHeaders() })
        .pipe(
          catchError(error => {
            console.error('Error al eliminar administrador:', error);
            console.log('Detalles del error:', error.message, error.status, error.statusText);
            return throwError(() => new Error('No se pudo eliminar el administrador'));
          })
        )
        .subscribe({
          next: () => {
            this.repartidores = this.repartidores.filter(r => r.id !== this.selectedAdmin!.id);
            this.updatePagination();
            this.closeDeleteModal();
            this.cdr.detectChanges();
            this.showSuccessMessage = true;
            this.successMessageText = 'Administrador eliminado';
            setTimeout(() => this.dismissMessage(), 3000);
          },
          error: (err) => {
            this.closeDeleteModal();
            this.showErrorMessage = true;
            this.errorMessageText = 'Error al eliminar el administrador';
            setTimeout(() => this.dismissMessage(), 3000);
          }
        });
    }
  }

  // Dismiss success or error message
  dismissMessage(): void {
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.cdr.detectChanges();
  }
}