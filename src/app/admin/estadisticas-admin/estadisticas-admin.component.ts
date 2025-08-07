import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Interfaz para los datos crudos de la API
interface AlmacenRaw {
  idalmacen: number;
  capacidad: string;
  tipoalmacen: string;
  create_at?: string;
  update_at?: string | null;
  delete_at?: string | null;
}

// Interfaz para los datos mapeados que usa el componente
interface Almacen {
  IdAlmacen: number;
  Capacidad: number;
  TipoAlmacen: string;
}

@Component({
  selector: 'app-estadisticas-admin',
  standalone: false,
  templateUrl: './estadisticas-admin.component.html',
  styleUrls: ['./estadisticas-admin.component.scss']
})
export class EstadisticasAdminComponent implements OnInit {
  almacenes: Almacen[] = [];
  displayedColumns: string[] = ['id', 'capacidad', 'tipoalmacen', 'acciones'];
  private apiUrl = 'http://74.208.44.191:3004/api/almacen';
  editForm: FormGroup;
  showModal: boolean = false;
  isEditMode: boolean = false;
  showDeleteModal: boolean = false;
  selectedAlmacen: Almacen | null = null;
  deletePassword: string = '';
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  successMessageText: string = '';
  errorMessageText: string = '';
  currentPage: number = 1;
  pageSize: number = 9;
  totalPages: number = 1;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.editForm = this.fb.group({
      IdAlmacen: [{ value: 0, disabled: true }],
      Capacidad: ['', [Validators.required, Validators.min(1)]],
      TipoAlmacen: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchAlmacenes();
  }

  // Helper method to create headers with the Bearer token
  private getAuthHeaders(): HttpHeaders {
    const token = 'Gr33nL1f3#cgm#';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // GET: Fetch all warehouses
  fetchAlmacenes(): void {
    this.http.get<{ message: string, data: AlmacenRaw[] }>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => response.data.map(item => ({
          IdAlmacen: item.idalmacen,
          Capacidad: Number(item.capacidad),
          TipoAlmacen: item.tipoalmacen
        }))),
        catchError(error => {
          console.error('Error al obtener almacenes:', error);
          return throwError(() => new Error('No se pudieron cargar los almacenes'));
        })
      )
      .subscribe({
        next: (data) => {
          this.almacenes = data;
          this.updatePagination();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.showErrorMessage = true;
          this.errorMessageText = 'Error al cargar los almacenes';
          setTimeout(() => this.dismissMessage(), 3000);
        }
      });
  }

  // Actualizar paginación
  updatePagination(): void {
    this.totalPages = Math.ceil(this.almacenes.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    if (this.currentPage < 1) this.currentPage = 1;
    this.cdr.detectChanges();
  }

  // Obtener almacenes paginados
  getPaginatedAlmacenes(): Almacen[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.almacenes.slice(startIndex, endIndex);
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

  // Abrir modal para crear un nuevo almacén
  openCreateModal(): void {
    this.isEditMode = false;
    this.editForm.reset();
    this.editForm.get('IdAlmacen')?.disable();
    this.showModal = true;
  }

  // Abrir modal de edición
  openModal(almacen: Almacen): void {
    this.isEditMode = true;
    this.editForm.patchValue({
      IdAlmacen: almacen.IdAlmacen,
      Capacidad: almacen.Capacidad,
      TipoAlmacen: almacen.TipoAlmacen
    });
    this.editForm.get('IdAlmacen')?.disable();
    this.showModal = true;
  }

  // Cerrar modal de creación/edición
  closeModal(): void {
    this.showModal = false;
    this.editForm.reset();
    this.isEditMode = false;
    this.editForm.get('IdAlmacen')?.disable();
  }

  // Abrir modal de eliminación
  openDeleteModal(almacen: Almacen): void {
    this.selectedAlmacen = almacen;
    this.deletePassword = '';
    this.showDeleteModal = true;
  }

  // Cerrar modal de eliminación
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedAlmacen = null;
    this.deletePassword = '';
  }

  // Guardar almacén (crear o actualizar)
  saveAlmacen(): void {
    if (this.editForm.valid) {
      const formValue = this.editForm.getRawValue();
      if (this.isEditMode) {
        this.updateAlmacen(formValue);
      } else {
        this.createAlmacen(formValue);
      }
    }
  }

  // POST: Crear un nuevo almacén
  createAlmacen(formValue: any): void {
    const body = {
      Capacidad: formValue.Capacidad.toString(),
      TipoAlmacen: formValue.TipoAlmacen
    };
    this.http.post<{ message: string, data: AlmacenRaw }>(this.apiUrl, body, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => ({
          IdAlmacen: response.data.idalmacen,
          Capacidad: Number(response.data.capacidad),
          TipoAlmacen: response.data.tipoalmacen
        })),
        catchError(error => {
          console.error('Error al crear almacén:', error);
          return throwError(() => new Error(error.error?.message || 'No se pudo crear el almacén'));
        })
      )
      .subscribe({
        next: (newAlmacen) => {
          this.almacenes = [...this.almacenes, newAlmacen];
          this.updatePagination();
          this.closeModal();
          this.showSuccessMessage = true;
          this.successMessageText = 'Almacén creado';
          setTimeout(() => this.dismissMessage(), 3000);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.closeModal();
          this.showErrorMessage = true;
          this.errorMessageText = err.message || 'Error al crear el almacén';
          setTimeout(() => this.dismissMessage(), 3000);
          this.cdr.detectChanges();
        }
      });
  }

  // PUT: Actualizar un almacén
  updateAlmacen(formValue: any): void {
    const url = `${this.apiUrl}/${formValue.IdAlmacen}`;
    const body = {
      IdAlmacen: formValue.IdAlmacen,
      Capacidad: formValue.Capacidad.toString(),
      TipoAlmacen: formValue.TipoAlmacen
    };
    this.http.put<{ message: string, data: AlmacenRaw }>(url, body, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => ({
          IdAlmacen: response.data.idalmacen,
          Capacidad: Number(response.data.capacidad),
          TipoAlmacen: response.data.tipoalmacen
        })),
        catchError(error => {
          console.error('Error al actualizar almacén:', error);
          return throwError(() => new Error(error.error?.message || 'No se pudo actualizar el almacén'));
        })
      )
      .subscribe({
        next: (updatedAlmacen) => {
          this.almacenes = this.almacenes.map(a => a.IdAlmacen === updatedAlmacen.IdAlmacen ? updatedAlmacen : a);
          this.updatePagination();
          this.closeModal();
          this.showSuccessMessage = true;
          this.successMessageText = 'Almacén actualizado';
          setTimeout(() => this.dismissMessage(), 3000);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.closeModal();
          this.showErrorMessage = true;
          this.errorMessageText = err.message || 'Error al actualizar el almacén';
          setTimeout(() => this.dismissMessage(), 3000);
          this.cdr.detectChanges();
        }
      });
  }

  // DELETE: Eliminar un almacén
  deleteAlmacen(): void {
    if (this.deletePassword === 'Gr33n2dm1n!' && this.selectedAlmacen) {
      const url = `${this.apiUrl}/${this.selectedAlmacen.IdAlmacen}`;
      this.http.delete<{ message: string, data: AlmacenRaw }>(url, { headers: this.getAuthHeaders() })
        .pipe(
          catchError(error => {
            console.error('Error al eliminar almacén:', error);
            return throwError(() => new Error(error.error?.message || 'No se pudo eliminar el almacén'));
          })
        )
        .subscribe({
          next: () => {
            this.almacenes = this.almacenes.filter(a => a.IdAlmacen !== this.selectedAlmacen!.IdAlmacen);
            this.updatePagination();
            this.closeDeleteModal();
            this.showSuccessMessage = true;
            this.successMessageText = 'Almacén eliminado';
            setTimeout(() => this.dismissMessage(), 3000);
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.closeDeleteModal();
            this.showErrorMessage = true;
            this.errorMessageText = err.message || 'Error al eliminar el almacén';
            setTimeout(() => this.dismissMessage(), 3000);
            this.cdr.detectChanges();
          }
        });
    } else {
      this.showErrorMessage = true;
      this.errorMessageText = 'Contraseña incorrecta';
      setTimeout(() => this.dismissMessage(), 3000);
      this.cdr.detectChanges();
    }
  }

  // Dismiss success or error message
  dismissMessage(): void {
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.cdr.detectChanges();
  }
}