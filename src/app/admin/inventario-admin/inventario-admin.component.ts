import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Interfaz para los datos crudos de la API
interface ProductoRaw {
  idproducto: number;
  nombreproducto: string;
  stock: string;
  precio: number;
  descripcion: string;
  fechaingreso: string;
  idalmacen: number;
  idadministrador: number;
  fotourl?: string;
}

// Interfaz para los datos mapeados que usa el componente
interface Producto {
  IdProducto: number;
  NombreProducto: string;
  Stock: number;
  Precio: number;
  Descripcion: string;
  FechaIngreso: string;
  IdAlmacen: number;
  IdAdministrador: number;
  FotoUrl?: string;
}

@Component({
  selector: 'app-inventario-admin',
  standalone: false,
  templateUrl: './inventario-admin.component.html',
  styleUrls: ['./inventario-admin.component.scss']
})
export class InventarioAdminComponent implements OnInit {
  productos: Producto[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'stock', 'precio', 'descripcion', 'acciones'];
  apiUrl = 'http://74.208.44.191:3004/api/producto';
  apiAdminUrl = 'http://74.208.44.191:3004/api/admin/producto';
  editForm: FormGroup;
  deleteForm: FormGroup;
  imageUploadForm: FormGroup;
  showModal: boolean = false;
  showDeleteModal: boolean = false;
  showImageUploadModal: boolean = false;
  selectedProducto: Producto | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
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
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.editForm = this.fb.group({
      IdProducto: [0],
      NombreProducto: ['', Validators.required],
      Stock: [0, Validators.required],
      Precio: [0, Validators.required],
      Descripcion: ['', Validators.required],
      FechaIngreso: ['', Validators.required],
      IdAlmacen: [0, Validators.required],
      IdAdministrador: [0, Validators.required]
    });
    this.deleteForm = this.fb.group({
      password: ['', Validators.required]
    });
    this.imageUploadForm = this.fb.group({
      IdProducto: [{ value: 0, disabled: true }],
      image: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchProductos();
  }

  // Helper method to create headers with the Bearer token
  private getAuthHeaders(isMultipart: boolean = false): HttpHeaders {
    const headers = new HttpHeaders({
      'Authorization': `Bearer Gr33nL1f3#cgm#`,
      'Accept': 'application/json'
    });
    return isMultipart ? headers : headers.set('Content-Type', 'application/json');
  }

  // GET: Fetch all products
  fetchProductos(): void {
    this.http.get<{ message: string, data: ProductoRaw[] }>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => response.data.map(item => ({
          IdProducto: item.idproducto,
          NombreProducto: item.nombreproducto,
          Stock: Number(item.stock),
          Precio: item.precio,
          Descripcion: item.descripcion,
          FechaIngreso: item.fechaingreso,
          IdAlmacen: item.idalmacen,
          IdAdministrador: item.idadministrador,
          FotoUrl: item.fotourl
        }))),
        catchError(error => {
          console.error('Error al obtener productos:', error);
          console.log('Detalles del error:', error.message, error.status, error.statusText);
          return throwError(() => new Error('No se pudieron cargar los productos'));
        })
      )
      .subscribe({
        next: (data) => {
          this.productos = data;
          this.updatePagination();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.showErrorMessage = true;
          this.errorMessageText = 'Error al cargar los productos';
          setTimeout(() => this.dismissMessage(), 3000);
        }
      });
  }

  // Actualizar paginación
  updatePagination(): void {
    this.totalPages = Math.ceil(this.productos.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    if (this.currentPage < 1) this.currentPage = 1;
    this.cdr.detectChanges();
  }

  // Obtener productos paginados
  getPaginatedProductos(): Producto[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.productos.slice(startIndex, endIndex);
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

  // Abrir modal para crear un nuevo producto
  openCreateModal(): void {
    this.isEditMode = false;
    this.editForm.reset();
    this.editForm.get('IdProducto')?.clearValidators();
    this.editForm.get('IdProducto')?.updateValueAndValidity();
    this.showModal = true;
  }

  // Abrir modal de edición
  openModal(producto: Producto): void {
    this.isEditMode = true;
    this.editForm.setValue({
      IdProducto: producto.IdProducto,
      NombreProducto: producto.NombreProducto,
      Stock: producto.Stock,
      Precio: producto.Precio,
      Descripcion: producto.Descripcion,
      FechaIngreso: producto.FechaIngreso.split('T')[0],
      IdAlmacen: producto.IdAlmacen,
      IdAdministrador: producto.IdAdministrador
    });
    this.showModal = true;
  }

  // Cerrar modal de creación/edición
  closeModal(): void {
    this.showModal = false;
    this.editForm.reset();
    this.isEditMode = false;
    this.editForm.get('IdProducto')?.clearValidators();
    this.editForm.get('IdProducto')?.updateValueAndValidity();
  }

  // Guardar producto (crear o actualizar)
  saveProducto(): void {
    if (this.editForm.valid) {
      const formValue = this.editForm.value;
      if (this.isEditMode) {
        this.updateProducto(formValue);
      } else {
        this.createProducto(formValue);
      }
    }
  }

  // POST: Crear un nuevo producto
  createProducto(formValue: any): void {
    const body = {
      NombreProducto: formValue.NombreProducto,
      Stock: formValue.Stock,
      FechaIngreso: formValue.FechaIngreso,
      Precio: formValue.Precio,
      Descripcion: formValue.Descripcion,
      IdAlmacen: formValue.IdAlmacen,
      IdAdministrador: formValue.IdAdministrador
    };
    this.http.post<{ message: string, data: ProductoRaw }>(this.apiAdminUrl, body, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => ({
          IdProducto: response.data.idproducto,
          NombreProducto: response.data.nombreproducto,
          Stock: Number(response.data.stock),
          Precio: response.data.precio,
          Descripcion: response.data.descripcion,
          FechaIngreso: response.data.fechaingreso,
          IdAlmacen: response.data.idalmacen,
          IdAdministrador: response.data.idadministrador,
          FotoUrl: response.data.fotourl
        })),
        catchError(error => {
          console.error('Error al crear producto:', error);
          console.log('Detalles del error:', error.message, error.status, error.statusText);
          return throwError(() => new Error('No se pudo crear el producto'));
        })
      )
      .subscribe({
        next: (newProducto) => {
          this.productos = [...this.productos, newProducto];
          this.updatePagination();
          this.closeModal();
          this.cdr.detectChanges();
          this.showSuccessMessage = true;
          this.successMessageText = 'Producto creado';
          setTimeout(() => this.dismissMessage(), 3000);
        },
        error: (err) => {
          this.closeModal();
          this.showErrorMessage = true;
          this.errorMessageText = 'Error al crear el producto';
          setTimeout(() => this.dismissMessage(), 3000);
        }
      });
  }

  // PUT: Actualizar un producto
  updateProducto(formValue: any): void {
    const url = `${this.apiAdminUrl}/${formValue.IdProducto}`;
    const body = {
      NombreProducto: formValue.NombreProducto,
      Stock: formValue.Stock,
      FechaIngreso: formValue.FechaIngreso,
      Precio: formValue.Precio,
      Descripcion: formValue.Descripcion,
      IdAlmacen: formValue.IdAlmacen,
      IdAdministrador: formValue.IdAdministrador
    };
    this.http.put<{ message: string, data: ProductoRaw }>(url, body, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => ({
          IdProducto: response.data.idproducto,
          NombreProducto: response.data.nombreproducto,
          Stock: Number(response.data.stock),
          Precio: response.data.precio,
          Descripcion: response.data.descripcion,
          FechaIngreso: response.data.fechaingreso,
          IdAlmacen: response.data.idalmacen,
          IdAdministrador: response.data.idadministrador,
          FotoUrl: response.data.fotourl
        })),
        catchError(error => {
          console.error('Error al actualizar producto:', error);
          console.log('Detalles del error:', error.message, error.status, error.statusText);
          return throwError(() => new Error('No se pudo actualizar el producto'));
        })
      )
      .subscribe({
        next: (updatedProducto) => {
          this.productos = this.productos.map(p => p.IdProducto === updatedProducto.IdProducto ? updatedProducto : p);
          this.updatePagination();
          this.closeModal();
          this.cdr.detectChanges();
          this.showSuccessMessage = true;
          this.successMessageText = 'Producto actualizado';
          setTimeout(() => this.dismissMessage(), 3000);
        },
        error: (err) => {
          this.closeModal();
          this.showErrorMessage = true;
          this.errorMessageText = 'Error al actualizar el producto';
          setTimeout(() => this.dismissMessage(), 3000);
        }
      });
  }

  // Abrir modal de eliminación
  openDeleteModal(producto: Producto): void {
    this.selectedProducto = producto;
    this.deleteForm.reset();
    this.showDeleteModal = true;
  }

  // Cerrar modal de eliminación
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedProducto = null;
    this.deleteForm.reset();
  }

  // DELETE: Eliminar un producto
  deleteProducto(): void {
    if (this.deleteForm.valid && this.selectedProducto) {
      const enteredPassword = this.deleteForm.get('password')?.value;
      if (enteredPassword !== this.adminPassword) {
        this.showErrorMessage = true;
        this.errorMessageText = 'Contraseña de administrador incorrecta';
        setTimeout(() => this.dismissMessage(), 3000);
        this.cdr.detectChanges();
        return;
      }

      const url = `${this.apiAdminUrl}/${this.selectedProducto.IdProducto}`;
      this.http.delete<{ message: string }>(url, { headers: this.getAuthHeaders() })
        .pipe(
          catchError(error => {
            console.error('Error al eliminar producto:', error);
            console.log('Detalles del error:', error.message, error.status, error.statusText);
            return throwError(() => new Error('No se pudo eliminar el producto'));
          })
        )
        .subscribe({
          next: () => {
            this.productos = this.productos.filter(p => p.IdProducto !== this.selectedProducto!.IdProducto);
            this.updatePagination();
            this.closeDeleteModal();
            this.cdr.detectChanges();
            this.showSuccessMessage = true;
            this.successMessageText = 'Producto eliminado';
            setTimeout(() => this.dismissMessage(), 3000);
          },
          error: (err) => {
            this.closeDeleteModal();
            this.showErrorMessage = true;
            this.errorMessageText = 'Error al eliminar el producto';
            setTimeout(() => this.dismissMessage(), 3000);
          }
        });
    }
  }

  // Abrir modal para subir imagen
  openImageUploadModal(producto: Producto): void {
    if (!producto || !producto.IdProducto) {
      console.error('Producto no válido:', producto);
      this.showErrorMessage = true;
      this.errorMessageText = 'Producto no válido';
      setTimeout(() => this.dismissMessage(), 3000);
      return;
    }
    this.selectedProducto = producto;
    this.imageUploadForm.patchValue({ IdProducto: producto.IdProducto });
    this.showImageUploadModal = true;
    this.selectedFile = null;
    this.imagePreview = null;
    this.imageUploadForm.get('image')?.reset();
    this.cdr.detectChanges();
  }

  // Cerrar modal de subida de imagen
  closeImageUploadModal(): void {
    this.showImageUploadModal = false;
    this.selectedProducto = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.imageUploadForm.reset();
    this.cdr.detectChanges();
  }

  // Manejar selección de archivo
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.imageUploadForm.get('image')?.setValue(this.selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.imageUploadForm.get('image')?.setValue(null);
      this.imagePreview = null;
    }
  }

  // Subir imagen al servidor
  uploadImage(): void {
    if (this.imageUploadForm.valid && this.selectedFile && this.selectedProducto) {
      console.log('Subiendo imagen para producto ID:', this.selectedProducto.IdProducto);
      console.log('Archivo seleccionado:', this.selectedFile);
      const formData = new FormData();
      formData.append('image', this.selectedFile);

      const url = `${this.apiAdminUrl}/${this.selectedProducto.IdProducto}/foto`;
      console.log('URL de la solicitud:', url);

      this.http.post<{ message: string, data: ProductoRaw }>(url, formData, { headers: this.getAuthHeaders(true) })
        .pipe(
          catchError(error => {
            console.error('Error al subir imagen:', error);
            return throwError(() => new Error('No se pudo subir la imagen'));
          })
        )
        .subscribe({
          next: (response) => {
            console.log('Respuesta de subida:', response);
            this.productos = this.productos.map(p =>
              p.IdProducto === this.selectedProducto!.IdProducto
                ? { ...p, FotoUrl: response.data.fotourl }
                : p
            );
            this.closeImageUploadModal();
            this.showSuccessMessage = true;
            this.successMessageText = 'Imagen subida con éxito';
            setTimeout(() => this.dismissMessage(), 3000);
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Detalles del error:', err);
            this.closeImageUploadModal();
            this.showErrorMessage = true;
            this.errorMessageText = `Error al subir la imagen: ${err.message || 'Desconocido'}`;
            setTimeout(() => this.dismissMessage(), 3000);
            this.cdr.detectChanges();
          }
        });
    } else {
      console.log('Formulario no válido o falta archivo/producto:', {
        formValid: this.imageUploadForm.valid,
        selectedFile: this.selectedFile,
        selectedProducto: this.selectedProducto
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