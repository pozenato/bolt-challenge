import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ClienteService } from './cliente.service';
import { Cliente } from '../models/cliente.model';

describe('ClienteService', () => {
  let service: ClienteService;
  let httpMock: HttpTestingController;

  const mockCliente: Cliente = {
    id: 1,
    nome: 'João da Silva',
    documento: '12345678900',
    enderecoCliente: {
      cep: '88010000',
      logradouro: 'Rua Central',
      bairro: 'Centro',
      localidade: 'Florianópolis',
      uf: 'SC',
      numero: '42'
    },
    unidadesConsumidoras: [],
    ativo: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClienteService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ClienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve listar clientes recentes', () => {
    service.listar(true).subscribe(clientes => {
      expect(clientes.length).toBe(1);
      expect(clientes[0].nome).toBe('João da Silva');
    });

    const req = httpMock.expectOne('http://localhost:8082/api/clientes?recentes=true');
    expect(req.request.method).toBe('GET');
    req.flush([mockCliente]);
  });

  it('deve listar todos os clientes', () => {
    service.listar(false).subscribe(clientes => {
      expect(clientes).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:8082/api/clientes?recentes=false');
    expect(req.request.method).toBe('GET');
    req.flush([mockCliente]);
  });

  it('deve obter cliente por id', () => {
    service.obterPorId(1).subscribe(cliente => {
      expect(cliente.id).toBe(1);
      expect(cliente.nome).toBe('João da Silva');
    });

    const req = httpMock.expectOne('http://localhost:8082/api/clientes/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockCliente);
  });

  it('deve cadastrar um novo cliente', () => {
    const novoCliente: Cliente = { ...mockCliente, id: undefined };
    service.cadastrar(novoCliente).subscribe(res => {
      expect(res.id).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:8082/api/clientes');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.nome).toBe('João da Silva');
    req.flush(mockCliente);
  });

  it('deve atualizar um cliente existente', () => {
    service.atualizar(1, mockCliente).subscribe(res => {
      expect(res.nome).toBe('João da Silva');
    });

    const req = httpMock.expectOne('http://localhost:8082/api/clientes/1');
    expect(req.request.method).toBe('PUT');
    req.flush(mockCliente);
  });

  it('deve deletar (soft delete) um cliente', () => {
    service.deletar(1).subscribe(res => {
      expect(res).toBeFalsy();
    });

    const req = httpMock.expectOne('http://localhost:8082/api/clientes/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('deve consultar CEP no ViaCEP', () => {
    const mockCep = { cep: '88010-000', logradouro: 'Rua Central', uf: 'SC', localidade: 'Florianópolis' };
    service.consultarCep('88010000').subscribe(res => {
      expect(res.uf).toBe('SC');
    });

    const req = httpMock.expectOne('https://viacep.com.br/ws/88010000/json/');
    expect(req.request.method).toBe('GET');
    req.flush(mockCep);
  });
});
