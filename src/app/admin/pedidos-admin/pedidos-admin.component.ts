import { Component } from '@angular/core';

@Component({
  selector: 'app-pedidos-admin',
  standalone: false,
  templateUrl: './pedidos-admin.component.html',
  styleUrl: './pedidos-admin.component.scss'
})
export class PedidosAdminComponent {
 pedidosRecientes = [
    { id: '001', cliente: 'Pablo Martínez', fecha: '2025-07-01', total: 150.50, estado: 'Entregado' },
    { id: '002', cliente: 'María Gómez', fecha: '2025-07-02', total: 89.99, estado: 'En camino' },
    { id: '003', cliente: 'Carlos López', fecha: '2025-07-02', total: 230.00, estado: 'Preparando' },
    { id: '004', cliente: 'Ana Martínez', fecha: '2025-07-03', total: 45.75, estado: 'Entregado' }
  ];

  displayedColumns: string[] = ['id', 'cliente', 'fecha', 'total', 'estado', 'acciones'];
}