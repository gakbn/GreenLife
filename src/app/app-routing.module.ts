import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { RecetasComponent } from './pages/recetas/recetas.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';

import { SidebarAdminComponent } from './admin/sidebar-admin/sidebar-admin.component';
import { RepartidoresAdminComponent } from './admin/repartidores-admin/repartidores-admin.component';
import { PedidosAdminComponent } from './admin/pedidos-admin/pedidos-admin.component';
import { InventarioAdminComponent } from './admin/inventario-admin/inventario-admin.component';
import { ClientesAdminComponent } from './admin/clientes-admin/clientes-admin.component';
import { EstadisticasAdminComponent } from './admin/estadisticas-admin/estadisticas-admin.component';
import { AuthGuard } from './guards/auth.guard';
import { DashboardAdminComponent } from './admin/dashboard-admin/dashboard-admin.component';
import { NosotrosComponent } from './pages/nosotros/nosotros.component';


const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'inicio', component: InicioComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'recetas', component: RecetasComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'nosotros', component: NosotrosComponent },

  {
    path: 'admin',
    component: SidebarAdminComponent, // Componente base para el panel de administración
    canActivate: [AuthGuard], // Proteger la ruta admin y sus hijas
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardAdminComponent },
      { path: 'repartidores', component: RepartidoresAdminComponent },
      { path: 'pedidos', component: PedidosAdminComponent },
      { path: 'inventario', component: InventarioAdminComponent },
      { path: 'clientes', component: ClientesAdminComponent },
      { path: 'estadisticas', component: EstadisticasAdminComponent },
    ]
  },
  { path: '**', redirectTo: '/inicio' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }