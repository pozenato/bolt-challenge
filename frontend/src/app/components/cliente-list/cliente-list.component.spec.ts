import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClienteListComponent } from './cliente-list.component';
import { ClienteService } from '../../services/cliente.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { Cliente } from '../../models/cliente.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideEnvironmentNgxMask } from 'ngx-mask';

describe('ClienteListComponent', () => {
  let component: ClienteListComponent;
  let fixture: ComponentFixture<ClienteListComponent>;
  let mockClienteService: jasmine.SpyObj<ClienteService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const mockClientes: Cliente[] = [
    {
      id: 1,
      nome: 'João da Silva',
      documento: '12345678900',
      enderecoCliente: { cep: '88010000', numero: '42', uf: 'SC' },
      unidadesConsumidoras: [],
      ativo: true
    },
    {
      id: 2,
      nome: 'Maria Souza',
      documento: '98765432100',
      enderecoCliente: { cep: '30130000', numero: '10', uf: 'MG' },
      unidadesConsumidoras: [],
      ativo: false
    }
  ];

  beforeEach(async () => {
    mockClienteService = jasmine.createSpyObj('ClienteService', ['listar', 'deletar']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    mockClienteService.listar.and.returnValue(of(mockClientes));

    await TestBed.configureTestingModule({
      imports: [ClienteListComponent, NoopAnimationsModule],
      providers: [
        { provide: ClienteService, useValue: mockClienteService },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy },
        provideEnvironmentNgxMask()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteListComponent);
    component = fixture.componentInstance;

    // Override injected services directly on the component instance
    (component as any).snackBar = snackBarSpy;
    (component as any).dialog = dialogSpy;

    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar clientes ao inicializar', () => {
    expect(mockClienteService.listar).toHaveBeenCalledWith(true);
    expect(component.clientes.length).toBe(2);
  });

  it('deve formatar CPF corretamente', () => {
    const resultado = component.formatDocumento('12345678900');
    expect(resultado).toBe('123.456.789-00');
  });

  it('deve formatar CNPJ corretamente', () => {
    const resultado = component.formatDocumento('12345678000195');
    expect(resultado).toBe('12.345.678/0001-95');
  });

  it('deve alternar modo de exibição ao trocar toggle', () => {
    component.onToggleChange(false);
    expect(component.recentes).toBeFalse();
    expect(mockClienteService.listar).toHaveBeenCalledWith(false);
  });

  it('deve chamar snackBar em caso de erro ao carregar', () => {
    mockClienteService.listar.and.returnValue(throwError(() => new Error('Erro de rede')));
    component.carregarClientes();
    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('deve chamar deletar e recarregar ao confirmar exclusão', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockClienteService.deletar.and.returnValue(of(undefined));
    component.deletarCliente(mockClientes[0]);
    expect(mockClienteService.deletar).toHaveBeenCalledWith(1);
    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('não deve deletar se o usuário cancelar o confirm', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deletarCliente(mockClientes[0]);
    expect(mockClienteService.deletar).not.toHaveBeenCalled();
  });

  it('deve abrir dialog ao chamar abrirFormulario', () => {
    dialogSpy.open.and.returnValue({ afterClosed: () => of(false) } as any);
    component.abrirFormulario();
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('deve recarregar lista ao fechar modal com resultado', () => {
    dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);
    component.abrirFormulario();
    // of(true) is synchronous — reload should occur immediately
    expect(mockClienteService.listar).toHaveBeenCalledTimes(2);
  });
});
