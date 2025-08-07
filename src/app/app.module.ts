import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Importar los módulos de Angular Material
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';                 // Para formularios
import { HttpClientModule } from '@angular/common/http'; // Importa esto
import { MatSelectModule } from '@angular/material/select'; // Para select de Angular Material
// Importar los componentes de la aplicación
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';

// Importar las páginas de la aplicación
import { InicioComponent } from './pages/inicio/inicio.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { RecetasComponent } from './pages/recetas/recetas.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';

// Importar los componentes de administración
import { SidebarAdminComponent } from './admin/sidebar-admin/sidebar-admin.component';
import { RepartidoresAdminComponent } from './admin/repartidores-admin/repartidores-admin.component';
import { PedidosAdminComponent } from './admin/pedidos-admin/pedidos-admin.component';
import { InventarioAdminComponent } from './admin/inventario-admin/inventario-admin.component';
import { ClientesAdminComponent } from './admin/clientes-admin/clientes-admin.component';
import { EstadisticasAdminComponent } from './admin/estadisticas-admin/estadisticas-admin.component';
import { DashboardAdminComponent } from './admin/dashboard-admin/dashboard-admin.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NosotrosComponent } from './pages/nosotros/nosotros.component';




@NgModule({
  declarations: [
    AppComponent,
   
    NavbarComponent,
    FooterComponent,
    InicioComponent,
    ProductosComponent,
    RecetasComponent,
    ContactoComponent,
    LoginComponent,
    RegistroComponent,
    SidebarAdminComponent,
    RepartidoresAdminComponent,
    PedidosAdminComponent,
    InventarioAdminComponent,
    ClientesAdminComponent,
    EstadisticasAdminComponent,
    DashboardAdminComponent,
    NosotrosComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatButtonModule,
    MatToolbarModule,
    MatGridListModule,
    MatIconModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    HttpClientModule,
    MatSelectModule,
    MatTableModule,
    

  ],
  providers: [    provideAnimationsAsync()
],
  bootstrap: [AppComponent]
})
export class AppModule { }
