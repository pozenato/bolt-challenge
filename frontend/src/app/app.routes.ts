import { Routes } from '@angular/router';
import { ClienteListComponent } from './components/cliente-list/cliente-list.component';

export const routes: Routes = [
  { path: 'clientes', component: ClienteListComponent },
  { path: '', redirectTo: 'clientes', pathMatch: 'full' }
];

