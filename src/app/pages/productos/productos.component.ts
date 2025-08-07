import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Interfaz para los datos crudos de la API
interface ProductoRaw {
  idproducto: number;
  nombreproducto: string;
  stock: string;
  precio: number;
  descripcion: string;
  fotourl?: string;
  fechaingreso: string;
  idalmacen: number;
  idadministrador: number;
}

// Interfaz para los datos mapeados que usa el componente
interface Product {
  id: number;
  nombre: string;
  stock: number;
  precio: number;
  descripcion: string;
  categoria: string;
  imagen?: string;
  oferta: boolean;
  precioOriginal?: number; // Precio mayor artificial para simular oferta
}

@Component({
  selector: 'app-productos',
  standalone: false,
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss'],
})
export class ProductosComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: string = 'todos';
  selectedProduct: Product | null = null; // Producto seleccionado para el modal
  isModalOpen: boolean = false; // Controla la visibilidad del modal
  private apiUrl = 'http://74.208.44.191:3004/api/producto';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchProducts();
          window.scrollTo(0, 0); 
  }

  // Helper method to create headers with the Bearer token
  private getAuthHeaders(): HttpHeaders {
    const password = 'Gr33nL1f3#cgm#';
    return new HttpHeaders({
      'Authorization': `Bearer ${password}`,
      'Content-Type': 'application/json'
    });
  }

  // Determinar categoría basada en idalmacen y nombreproducto
  private getCategory(nombre: string, idalmacen: number): string {
    const nombreLower = nombre.toLowerCase();
    if (idalmacen === 2) {
      return 'vegetales';
    } else if (nombreLower.includes('lechuga')) {
      return 'lechugas';
    } else if (nombreLower.includes('otros') || nombreLower.includes('mix')) {
      return 'otros';
    } else if (nombreLower.includes('jiotilla')) {
      return 'otros';
    }
    return 'otros';
  }

  // GET: Fetch all products
  fetchProducts(): void {
    this.http.get<{ message: string, data: ProductoRaw[] }>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          console.log('Respuesta completa de la API:', JSON.stringify(response, null, 2));
          if (!response.data || !Array.isArray(response.data)) {
            console.error('Datos de la API no válidos:', response);
            return [];
          }
          const mappedProducts = response.data.map(item => {
            const stock = Number(item.stock) || 0;
            const precio = item.precio !== undefined && item.precio !== null ? item.precio : 0;
            const product: Product = {
              id: item.idproducto,
              nombre: item.nombreproducto || 'Producto sin nombre',
              stock: stock,
              precio: precio,
              descripcion: item.descripcion || 'Sin descripción',
              categoria: this.getCategory(item.nombreproducto || '', item.idalmacen),
              imagen: item.fotourl || undefined,
              oferta: stock > 30,
              precioOriginal: stock > 30 ? (precio * 1.25) : undefined // Precio mayor artificial
            };
            console.log('Producto mapeado:', product);
            return product;
          });
          console.log('Productos con oferta:', mappedProducts.filter(p => p.oferta));
          console.log('Productos en Vegetales (idalmacen: 2):', mappedProducts.filter(p => p.categoria === 'vegetales'));
          return mappedProducts;
        }),
        catchError(error => {
          console.error('Error al obtener productos:', error);
          console.log('Detalles del error:', error.message, error.status, error.statusText);
          return throwError(() => new Error('No se pudieron cargar los productos'));
        })
      )
      .subscribe({
        next: (data) => {
          console.log('Productos mapeados:', data);
          this.products = data;
          this.filteredProducts = data;
          this.cdr.detectChanges();
          console.log('Productos asignados a this.products:', this.products);
          console.log('Productos asignados a this.filteredProducts:', this.filteredProducts);
        },
        error: (err) => {
          console.error('Error en la suscripción:', err);
          alert('Error al cargar los productos. Por favor, verifica la conexión o intenta de nuevo.');
        }
      });
  }

  filterByCategory(category: string): void {
    console.log('Filtrando por categoría:', category);
    this.selectedCategory = category;
    if (category === 'todos') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(
        (product) => product.categoria === category
      );
    }
    console.log('Productos filtrados:', this.filteredProducts);
    this.cdr.detectChanges();
  }

  filterByOffer(products: Product[]): Product[] {
    console.log('Mostrando los 3 primeros productos para Ofertas Destacadas:', products);
    const filtered = products.slice(0, 3);
    console.log('Productos en Ofertas Destacadas:', filtered);
    return filtered;
  }

  viewDetails(product: Product): void {
    console.log(`Ver detalles de ${product.nombre}`);
    this.selectedProduct = product;
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedProduct = null;
    this.cdr.detectChanges();
  }

  // Manejar errores de carga de imágenes
  handleImageError(event: Event): void {
    console.error('Error al cargar la imagen:', (event.target as HTMLImageElement).src);
  }

  // Formatear precio para evitar toFixed en el template
  formatPrice(price: number | undefined): string {
    return price !== undefined && price !== null ? price.toFixed(2) : '0.00';
  }
}