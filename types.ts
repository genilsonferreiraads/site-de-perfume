
export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  avatarUrl: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export enum PaymentMethod {
  Pix = 'Pix',
  Card = 'Cartão',
  Cash = 'Dinheiro',
  Credit = 'Fiado'
}

export enum SaleStatus {
  Paid = 'Pago',
  Pending = 'Pendente',
  Partial = 'Parcial'
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
}

export interface Sale {
  id: string;
  clientId: string;
  items: SaleItem[];
  total: number;
  date: string;
  paymentMethod: PaymentMethod;
  payments: Payment[];
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
}

export enum Page {
  Dashboard = 'Dashboard',
  NovaVenda = 'Nova Venda',
  Produtos = 'Produtos',
  Clientes = 'Clientes',
  Historico = 'Histórico',
  Fiados = 'Fiados',
  Despesas = 'Despesas',
  Configuracoes = 'Configurações'
}
