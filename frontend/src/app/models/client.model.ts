export interface Address {
  cep: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  number: string;
  complement?: string;
}

export interface ConsumerUnit {
  id?: number;
  name: string;
  installationNumber: string;
  address: Address;
}

export interface Client {
  id?: number;
  name: string;
  document: string;
  clientAddress: Address;
  consumerUnits: ConsumerUnit[];
  createdAt?: string;
  updatedAt?: string;
  active?: boolean;
}
