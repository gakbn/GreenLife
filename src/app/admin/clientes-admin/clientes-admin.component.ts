import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Interfaz para los datos crudos de la API
interface UsuarioRaw {
  idusuario: number;
  nombre: string;
  appaterno: string;
  apmaterno: string;
  correo: string;
  contrasena: string;
  direccion: string;
  fechanacimiento: string;
  create_at: string | null;
  update_at: string | null;
  delete_at: string | null;
  fotourl: string | null;
}

// Interfaz para los datos mapeados que usa el componente
interface Usuario {
  id: number;
  nombre: string; // Concatenación de nombre, appaterno y apmaterno
  email: string;
  direccion: string;
  fechaNacimiento: string;
}

@Component({
  selector: 'app-clientes-admin',
  standalone: false,
  templateUrl: './clientes-admin.component.html',
  styleUrls: ['./clientes-admin.component.scss']
})
export class ClientesAdminComponent implements OnInit {
  clientes: Usuario[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'email', 'direccion', 'fechaNacimiento', 'acciones'];
  private apiUrl = 'http://74.208.44.191:3004/api/usuario';
  editForm: FormGroup;
  createForm: FormGroup;
  deleteForm: FormGroup;
  showModal: boolean = false;
  showCreateModal: boolean = false;
  showDeleteModal: boolean = false;
  selectedUsuario: Usuario | null = null;
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  successMessageText: string = '';
  errorMessageText: string = '';
  private adminPassword = 'Gr33n2dm1n!';
  currentPage: number = 1;
  pageSize: number = 9;
  totalPages: number = 1;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      id: [0, Validators.required],
      nombre: ['', Validators.required],
      apPaterno: ['', Validators.required],
      apMaterno: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: [''],
      direccion: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      fotoUrl: ['']
    });
    this.createForm = this.fb.group({
      nombre: ['', Validators.required],
      apPaterno: ['', Validators.required],
      apMaterno: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
      direccion: ['', Validators.required],
      fechaNacimiento: ['', Validators.required]
    });
    this.deleteForm = this.fb.group({
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchUsuarios();
  }

  // Helper method to create headers with the Bearer token
  private getAuthHeaders(): HttpHeaders {
    const token = 'Gr33nL1f3#cgm#';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // GET: Fetch all users
  fetchUsuarios(): void {
    this.http.get<{ message: string, data: UsuarioRaw[] }>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          console.log('Respuesta de la API:', response);
          return response.data.map(item => ({
            id: item.idusuario,
            nombre: [item.nombre, item.appaterno, item.apmaterno].filter(part => part).join(' '),
            email: item.correo || '',
            direccion: item.direccion || '',
            fechaNacimiento: item.fechanacimiento ? item.fechanacimiento.split('T')[0] : ''
          }));
        }),
        catchError(error => {
          console.error('Error al obtener usuarios:', error);
          console.log('Detalles del error:', error.message, error.status, error.statusText);
          return throwError(() => new Error('No se pudieron cargar los usuarios'));
        })
      )
      .subscribe({
        next: (data) => {
          console.log('Usuarios mapeados:', data);
          this.clientes = data;
          this.updatePagination();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error en la suscripción:', err);
          this.showErrorMessage = true;
          this.errorMessageText = 'Error al cargar los usuarios';
          setTimeout(() => this.dismissMessage(), 3000);
        }
      });
  }

  // Actualizar paginación
  updatePagination(): void {
    this.totalPages = Math.ceil(this.clientes.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    if (this.currentPage < 1) this.currentPage = 1;
    this.cdr.detectChanges();
  }

  // Obtener clientes paginados
  getPaginatedClientes(): Usuario[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.clientes.slice(startIndex, endIndex);
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

  // Abrir modal de edición
  openModal(cliente: Usuario): void {
    this.editForm.setValue({
      id: cliente.id,
      nombre: cliente.nombre.split(' ')[0] || '',
      apPaterno: cliente.nombre.split(' ')[1] || '',
      apMaterno: cliente.nombre.split(' ')[2] || '',
      correo: cliente.email,
      contrasena: '',
      direccion: cliente.direccion,
      fechaNacimiento: cliente.fechaNacimiento.split('T')[0],
      fotoUrl: ''
    });
    this.showModal = true;
  }

  // Cerrar modal de edición
  closeModal(): void {
    this.showModal = false;
    this.editForm.reset();
  }

  // Abrir modal de creación
  openCreateModal(): void {
    this.createForm.reset();
    this.showCreateModal = true;
  }

  // Cerrar modal de creación
  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createForm.reset();
  }

  // POST: Crear un usuario
  createUsuario(): void {
    if (this.createForm.valid) {
      const formValue = this.createForm.value;
      const formData = new FormData();
      formData.append('Nombre', formValue.nombre);
      formData.append('ApPaterno', formValue.apPaterno);
      formData.append('ApMaterno', formValue.apMaterno);
      formData.append('Correo', formValue.correo);
      formData.append('Contrasena', formValue.contrasena);
      formData.append('Direccion', formValue.direccion);
      formData.append('FechaNacimiento', formValue.fechaNacimiento);

      this.http.post<{ message: string, data: UsuarioRaw }>(this.apiUrl, formData, { headers: new HttpHeaders({ 'Authorization': `Bearer Gr33nL1f3#cgm#` }) })
        .pipe(
          map(response => ({
            id: response.data.idusuario,
            nombre: [response.data.nombre, response.data.appaterno, response.data.apmaterno].filter(part => part).join(' '),
            email: response.data.correo || '',
            direccion: response.data.direccion || '',
            fechaNacimiento: response.data.fechanacimiento ? response.data.fechanacimiento.split('T')[0] : ''
          })),
          catchError(error => {
            console.error('Error al crear usuario:', error);
            return throwError(() => new Error(error.error?.message || 'No se pudo crear el usuario'));
          })
        )
        .subscribe({
          next: (newUsuario) => {
            this.clientes.push(newUsuario);
            this.updatePagination();
            this.closeCreateModal();
            this.showSuccessMessage = true;
            this.successMessageText = 'Usuario creado con éxito';
            setTimeout(() => this.dismissMessage(), 3000);
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.closeCreateModal();
            this.showErrorMessage = true;
            this.errorMessageText = err.message || 'Error al crear el usuario';
            setTimeout(() => this.dismissMessage(), 3000);
            this.cdr.detectChanges();
          }
        });
    }
  }

  // PUT: Update a user
  updateUsuario(): void {
    if (this.editForm.valid) {
      const formValue = this.editForm.value;
      const url = `${this.apiUrl}/${formValue.id}`;
      const body: any = {
        Nombre: formValue.nombre,
        ApPaterno: formValue.apPaterno,
        ApMaterno: formValue.apMaterno,
        Correo: formValue.correo,
        Direccion: formValue.direccion,
        FechaNacimiento: formValue.fechaNacimiento
      };
      if (formValue.contrasena) {
        body.Contrasena = formValue.contrasena;
      }
      if (formValue.fotoUrl) {
        body.image = formValue.fotoUrl;
      }
      this.http.put<{ message: string, data: UsuarioRaw }>(url, body, { headers: this.getAuthHeaders() })
        .pipe(
          map(response => ({
            id: response.data.idusuario,
            nombre: [response.data.nombre, response.data.appaterno, response.data.apmaterno].filter(part => part).join(' '),
            email: response.data.correo || '',
            direccion: response.data.direccion || '',
            fechaNacimiento: response.data.fechanacimiento ? response.data.fechanacimiento.split('T')[0] : ''
          })),
          catchError(error => {
            console.error('Error al actualizar usuario:', error);
            return throwError(() => new Error(error.error?.message || 'No se pudo actualizar el usuario'));
          })
        )
        .subscribe({
          next: (updatedUsuario) => {
            this.clientes = this.clientes.map(c => c.id === updatedUsuario.id ? updatedUsuario : c);
            this.updatePagination();
            this.closeModal();
            this.showSuccessMessage = true;
            this.successMessageText = 'Usuario actualizado';
            setTimeout(() => this.dismissMessage(), 3000);
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.closeModal();
            this.showErrorMessage = true;
            this.errorMessageText = err.message || 'Error al actualizar el usuario';
            setTimeout(() => this.dismissMessage(), 3000);
            this.cdr.detectChanges();
          }
        });
    }
  }

  // Abrir modal de eliminación
  openDeleteModal(cliente: Usuario): void {
    this.selectedUsuario = cliente;
    this.deleteForm.reset();
    this.showDeleteModal = true;
  }

  // Cerrar modal de eliminación
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedUsuario = null;
    this.deleteForm.reset();
  }

  // DELETE: Eliminar un usuario
  deleteUsuario(): void {
    if (this.deleteForm.valid && this.selectedUsuario) {
      const enteredPassword = this.deleteForm.get('password')?.value;
      if (enteredPassword !== this.adminPassword) {
        this.showErrorMessage = true;
        this.errorMessageText = 'Contraseña de administrador incorrecta';
        setTimeout(() => this.dismissMessage(), 3000);
        this.cdr.detectChanges();
        return;
      }

      const url = `${this.apiUrl}/${this.selectedUsuario.id}`;
      this.http.delete<{ message: string }>(url, { headers: this.getAuthHeaders() })
        .pipe(
          catchError(error => {
            console.error('Error al eliminar usuario:', error);
            return throwError(() => new Error(error.error?.message || 'No se pudo eliminar el usuario'));
          })
        )
        .subscribe({
          next: () => {
            this.clientes = this.clientes.filter(c => c.id !== this.selectedUsuario!.id);
            this.updatePagination();
            this.closeDeleteModal();
            this.showSuccessMessage = true;
            this.successMessageText = 'Usuario eliminado';
            setTimeout(() => this.dismissMessage(), 3000);
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.closeDeleteModal();
            this.showErrorMessage = true;
            this.errorMessageText = err.message || 'Error al eliminar el usuario';
            setTimeout(() => this.dismissMessage(), 3000);
            this.cdr.detectChanges();
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