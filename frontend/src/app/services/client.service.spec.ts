import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ClientService } from './client.service';
import { Client } from '../models/client.model';

describe('ClientService', () => {
  let service: ClientService;
  let httpMock: HttpTestingController;

  const mockClient: Client = {
    id: 1,
    name: 'João da Silva',
    document: '12345678900',
    clientAddress: {
      cep: '88010000',
      street: 'Rua Central',
      neighborhood: 'Centro',
      city: 'Florianópolis',
      state: 'SC',
      number: '42'
    },
    consumerUnits: [],
    active: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClientService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve listar clientes recentes', () => {
    service.list(true).subscribe(clients => {
      expect(clients.length).toBe(1);
      expect(clients[0].name).toBe('João da Silva');
    });

    const req = httpMock.expectOne('http://localhost:8082/api/clients?recent=true');
    expect(req.request.method).toBe('GET');
    req.flush([mockClient]);
  });

  it('deve listar todos os clientes', () => {
    service.list(false).subscribe(clients => {
      expect(clients).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:8082/api/clients?recent=false');
    expect(req.request.method).toBe('GET');
    req.flush([mockClient]);
  });

  it('deve obter cliente por id', () => {
    service.findById(1).subscribe(client => {
      expect(client.id).toBe(1);
      expect(client.name).toBe('João da Silva');
    });

    const req = httpMock.expectOne('http://localhost:8082/api/clients/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockClient);
  });

  it('deve cadastrar um novo cliente', () => {
    const newClient: Client = { ...mockClient, id: undefined };
    service.create(newClient).subscribe(res => {
      expect(res.id).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:8082/api/clients');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('João da Silva');
    req.flush(mockClient);
  });

  it('deve atualizar um cliente existente', () => {
    service.update(1, mockClient).subscribe(res => {
      expect(res.name).toBe('João da Silva');
    });

    const req = httpMock.expectOne('http://localhost:8082/api/clients/1');
    expect(req.request.method).toBe('PUT');
    req.flush(mockClient);
  });

  it('deve deletar (soft delete) um cliente', () => {
    service.delete(1).subscribe(res => {
      expect(res).toBeFalsy();
    });

    const req = httpMock.expectOne('http://localhost:8082/api/clients/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('deve consultar CEP no ViaCEP', () => {
    const mockCep = { cep: '88010-000', logradouro: 'Rua Central', uf: 'SC', localidade: 'Florianópolis' };
    service.consultCep('88010000').subscribe(res => {
      expect(res.uf).toBe('SC');
    });

    const req = httpMock.expectOne('https://viacep.com.br/ws/88010000/json/');
    expect(req.request.method).toBe('GET');
    req.flush(mockCep);
  });
});
