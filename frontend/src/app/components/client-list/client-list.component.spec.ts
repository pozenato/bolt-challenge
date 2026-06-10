import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientListComponent } from './client-list.component';
import { ClientService } from '../../services/client.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { Client } from '../../models/client.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideEnvironmentNgxMask } from 'ngx-mask';

describe('ClientListComponent', () => {
  let component: ClientListComponent;
  let fixture: ComponentFixture<ClientListComponent>;
  let mockClientService: jasmine.SpyObj<ClientService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const mockClients: Client[] = [
    {
      id: 1,
      name: 'João da Silva',
      document: '12345678900',
      clientAddress: { cep: '88010000', number: '42', state: 'SC' },
      consumerUnits: [],
      active: true
    },
    {
      id: 2,
      name: 'Maria Souza',
      document: '98765432100',
      clientAddress: { cep: '30130000', number: '10', state: 'MG' },
      consumerUnits: [],
      active: false
    }
  ];

  beforeEach(async () => {
    mockClientService = jasmine.createSpyObj('ClientService', ['list', 'delete']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    mockClientService.list.and.returnValue(of(mockClients));

    await TestBed.configureTestingModule({
      imports: [ClientListComponent, NoopAnimationsModule],
      providers: [
        { provide: ClientService, useValue: mockClientService },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy },
        provideEnvironmentNgxMask()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientListComponent);
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
    expect(mockClientService.list).toHaveBeenCalledWith(true);
    expect(component.dataSource.data.length).toBe(2);
  });

  it('deve formatar CPF corretamente', () => {
    const resultado = component.formatDocument('12345678900');
    expect(resultado).toBe('123.456.789-00');
  });

  it('deve formatar CNPJ corretamente', () => {
    const resultado = component.formatDocument('12345678000195');
    expect(resultado).toBe('12.345.678/0001-95');
  });

  it('deve alternar modo de exibição ao trocar toggle', () => {
    component.onToggleChange(false);
    expect(component.recent).toBeFalse();
    expect(mockClientService.list).toHaveBeenCalledWith(false);
  });

  it('deve chamar snackBar em caso de erro ao carregar', () => {
    mockClientService.list.and.returnValue(throwError(() => new Error('Erro de rede')));
    component.loadClients();
    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('deve chamar deletar e recarregar ao confirmar exclusão', () => {
    dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);
    mockClientService.delete.and.returnValue(of(undefined));
    component.deleteClient(mockClients[0]);
    expect(dialogSpy.open).toHaveBeenCalled();
    expect(mockClientService.delete).toHaveBeenCalledWith(1);
    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('não deve deletar se o usuário cancelar o confirm', () => {
    dialogSpy.open.and.returnValue({ afterClosed: () => of(false) } as any);
    component.deleteClient(mockClients[0]);
    expect(dialogSpy.open).toHaveBeenCalled();
    expect(mockClientService.delete).not.toHaveBeenCalled();
  });

  it('deve abrir dialog ao chamar abrirFormulario', () => {
    dialogSpy.open.and.returnValue({ afterClosed: () => of(false) } as any);
    component.openForm();
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('deve recarregar lista ao fechar modal com resultado', () => {
    dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);
    component.openForm();
    // of(true) is synchronous — reload should occur immediately
    expect(mockClientService.list).toHaveBeenCalledTimes(2);
  });

  it('deve aplicar filtro corretamente', () => {
    const event = { target: { value: 'Penelope' } } as unknown as Event;
    component.applyFilter(event);
    expect(component.filterValue).toBe('Penelope');
    expect(component.dataSource.filter).toBe('penelope');
  });

  it('deve limpar filtro ao chamar clearFilter', () => {
    component.filterValue = 'Penelope';
    component.dataSource.filter = 'penelope';
    component.clearFilter();
    expect(component.filterValue).toBe('');
    expect(component.dataSource.filter).toBe('');
  });

  it('deve retornar a primeira letra do nome em maiúsculo', () => {
    expect(component.getAvatarInitial('penelope')).toBe('P');
    expect(component.getAvatarInitial(' bruno')).toBe('B');
    expect(component.getAvatarInitial('')).toBe('');
  });

  it('deve retornar cores consistentes baseado no nome', () => {
    const cor1 = component.getAvatarColor('Penelope');
    const cor2 = component.getAvatarColor('Penelope');
    const cor3 = component.getAvatarColor('Bruno');
    expect(cor1).toBe(cor2);
    expect(cor1).not.toBe(cor3);
    expect(component.getAvatarColor('')).toBe('#64748b');
  });
});
