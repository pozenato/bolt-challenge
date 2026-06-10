export interface Endereco {
  cep: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  numero: string;
  complemento?: string;
}

export interface UnidadeConsumidora {
  id?: number;
  nome: string;
  numeroInstalacao: string;
  endereco: Endereco;
}

export interface Cliente {
  id?: number;
  nome: string;
  documento: string;
  enderecoCliente: Endereco;
  unidadesConsumidoras: UnidadeConsumidora[];
  createdAt?: string;
  updatedAt?: string;
  ativo?: boolean;
}
