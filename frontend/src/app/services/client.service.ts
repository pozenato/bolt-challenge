import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:8082/api/clients';

  constructor(private http: HttpClient) {}

  list(recent: boolean = false): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}?recent=${recent}`);
  }

  findById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  create(client: Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  update(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  consultCep(cep: string): Observable<any> {
    const cleanCep = cep.replace(/\D/g, '');
    return this.http.get<any>(`https://viacep.com.br/ws/${cleanCep}/json/`);
  }
}
