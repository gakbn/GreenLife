import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface ProductRaw {
  idproducto: number;
  nombreproducto: string;
  stock: string;
  fechaingreso: string;
  precio: number;
  descripcion: string;
  idalmacen: number;
  idadministrador: number;
  create_at: string;
  update_at: string | null;
  delete_at: string | null;
  fotourl: string | null;
}

interface UserRaw {
  idusuario: number;
  nombre: string;
  appaterno: string;
  apmaterno: string;
  correo: string;
  contrasena: string;
  direccion: string;
  fechanacimiento: string;
  create_at: string;
  update_at: string | null;
  delete_at: string | null;
  fotourl: string | null;
  idadministrador?: number;
}

interface WarehouseRaw {
  idalmacen: number;
  capacidad: string;
  tipoalmacen: string;
  create_at: string;
  update_at: string | null;
  delete_at: string | null;
}

interface Product {
  id: number;
  name: string;
  stock: number;
  lastModified: string;
}

interface Admin {
  name: string;
  email: string;
}

interface DashboardMetrics {
  totalOrders: number;
  totalSales: number;
  activeClients: number;
  totalProducts: number;
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: false,
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.scss'
})
export class DashboardAdminComponent implements OnInit {
  metrics: DashboardMetrics = { totalOrders: 0, totalSales: 0, activeClients: 0, totalProducts: 0 };
  lowInventory: Product[] = [];
  activeAdmins: Admin[] = [];
  newOrModifiedProducts: Product[] = [];
  displayedColumns: string[] = ['name', 'email'];
  productColumns: string[] = ['name', 'stock']; // Removed 'actions'
  private apiUrl = 'http://74.208.44.191:3004/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchMetrics();
    this.fetchLowInventory();
    this.fetchRecentAdmins();
    this.fetchNewOrModifiedProducts();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = 'Gr33nL1f3#cgm#';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  fetchMetrics(): void {
    forkJoin({
      products: this.http.get<{ message: string, data: ProductRaw[] }>(`${this.apiUrl}/producto`, { headers: this.getAuthHeaders() }),
      users: this.http.get<{ message: string, data: UserRaw[] }>(`${this.apiUrl}/usuario`, { headers: this.getAuthHeaders() }),
      warehouses: this.http.get<{ message: string, data: WarehouseRaw[] }>(`${this.apiUrl}/almacen`, { headers: this.getAuthHeaders() })
    }).subscribe({
      next: ({ products, users, warehouses }) => {
        this.metrics = {
          totalOrders: warehouses.data.filter(w => !w.delete_at).length,
          totalSales: 2450,
          activeClients: users.data.filter(u => !u.delete_at).length,
          totalProducts: products.data.filter(p => !p.delete_at).length
        };
      },
      error: (err) => console.error('Error fetching metrics:', err)
    });
  }

  fetchLowInventory(): void {
    this.http.get<{ message: string, data: ProductRaw[] }>(`${this.apiUrl}/producto`, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => response.data
          .filter(p => !p.delete_at && parseInt(p.stock) >= 1 && parseInt(p.stock) <= 19)
          .map(p => ({
            id: p.idproducto,
            name: p.nombreproducto,
            stock: parseInt(p.stock),
            lastModified: p.update_at || p.create_at
          }))
          .slice(0, 5) // Limit to 5 records
        )
      )
      .subscribe({
        next: (data) => {
          this.lowInventory = data;
        },
        error: (err) => console.error('Error fetching low inventory:', err)
      });
  }

  fetchRecentAdmins(): void {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    this.http.get<{ message: string, data: { idadministrador: number, nombre: string, correo: string, create_at: string, update_at: string | null, delete_at: string | null }[] }>(`${this.apiUrl}/admin`, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => response.data
          .filter(a => !a.delete_at && (new Date(a.create_at) >= sevenDaysAgo || (a.update_at && new Date(a.update_at) >= sevenDaysAgo)))
          .map(a => ({
            name: a.nombre,
            email: a.correo
          }))
          .slice(0, 5) // Limit to 5 records
        )
      )
      .subscribe({
        next: (data) => {
          this.activeAdmins = data;
        },
        error: (err) => console.error('Error fetching recent admins:', err)
      });
  }

  fetchNewOrModifiedProducts(): void {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    this.http.get<{ message: string, data: ProductRaw[] }>(`${this.apiUrl}/producto`, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => response.data
          .filter(p => !p.delete_at && (new Date(p.create_at) >= sevenDaysAgo || (p.update_at && new Date(p.update_at) >= sevenDaysAgo)))
          .map(p => ({
            id: p.idproducto,
            name: p.nombreproducto,
            stock: parseInt(p.stock),
            lastModified: p.update_at || p.create_at
          }))
          .slice(0, 5) // Limit to 5 records
        )
      )
      .subscribe({
        next: (data) => {
          this.newOrModifiedProducts = data;
        },
        error: (err) => console.error('Error fetching new/modified products:', err)
      });
  }
}