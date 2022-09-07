import { Timestamp } from "firebase/firestore";

export class Interfaces {
}

export interface Usuario {
    cash: number;
    email: string | null;
    nome: string | null;
    uid: string;
    imgurl: string | null;
  }
  
  export interface Ativo {
    bioma: string;
    codigo: string;
    manejo: string;
    porcentagem: number;
    titulo: string;
    ultimoPreco: number;
    zona: string;
  }
  
  export interface AcaoEmCarteira {
    ativo: string;
    key: string;
    lote: string;
    quantidade: number;
    usuario: string;
  }
  
  export interface OrdemDeVenda {
    ativo: string;
    corretagem: number;
    data: Timestamp;
    key: string;
    keyAcao: string;
    lote: string;
    preco: number;
    qtdeExecutada: number;
    quantidade: number;
    status: string;
    user: string;
  }
  
  export interface OrdemDeCompra {
    ativo: string;
    corretagem: number;
    data: Timestamp;
    key: string;
    preco: number;
    qtdeExecutada: number;
    quantidade: number;
    status: string;
    user: string;
  }
  
  export interface Lote {
    area: number;
    ativo: string;
    bioma: string;
    codigo: string;
    data: Timestamp;
    dossie: string;
    gps: string;
    gpsurl: string;
    imgs: string[];
    manejo: string;
    projetoId: string;
    quantidade: number;
    zona: string;
  }

  export interface Projeto {
    nome: string;
    id: string;
    areaTotal: number;
    bioma: string;
    uid: string;
    imgurl: string;
  }