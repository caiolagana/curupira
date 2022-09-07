import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { fdb } from '../db.service';
import {
  addDoc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { FormControl, Validators } from '@angular/forms';
import { AcaoEmCarteira, OrdemDeVenda, OrdemDeCompra, Ativo, Usuario } from '../interfaces';
import { registerLocaleData } from '@angular/common';
import localeBr from '@angular/common/locales/br';
registerLocaleData(localeBr, 'br');

interface transferencia {
  keyAcao: string;
  qde: number;
  preco: number;
  from: string;
  to: string;
}

@Component({
  selector: 'app-compravende',
  templateUrl: './compravende.component.html',
  styleUrls: ['./compravende.component.css'],
})
export class CompravendeComponent implements OnInit {
  @Input() usuario: Usuario | null = null;
  @Input() acoesEmCarteira: AcaoEmCarteira[] = [];
  @Input() dictAcoesEmCarteira: { [key: string]: number } = {};
  @Input() ativosListados: Ativo[] = [];
  @Input() ordensDeCompra: { [key: string]: OrdemDeCompra[] } = {};
  @Input() ordensDeVenda: { [key: string]: OrdemDeVenda[] } = {};
  cacheVenda: string[] = [];
  cacheCompra: string[] = [];
  cacheCustodia: transferencia[] = [];

  tab: string = 'comprar';

  keyAcaoSelecionada: string | null = null;
  numeroDeAcoesParaVenda = new FormControl(null, Validators.min(1));
  precoDeVenda = new FormControl(null, Validators.min(0));

  ativoSelecionadoParaCompra: string | null = null;
  numeroDeAcoesParaCompra = new FormControl(null, Validators.min(1));
  precoDeCompra = new FormControl(null, Validators.min(0));

  constructor() {}

  ngOnInit(): void {}

  async lancarOrdemVenda(): Promise<void> {
    if (
      this.usuario != null &&
      this.keyAcaoSelecionada != null &&
      this.numeroDeAcoesParaVenda.value != null &&
      this.precoDeVenda.value != null &&
      this.numeroDeAcoesParaVenda.value > 0
    ) {
      let acaoSelecionada: AcaoEmCarteira =
        this.acoesEmCarteira[this.dictAcoesEmCarteira[this.keyAcaoSelecionada]];
      if (this.numeroDeAcoesParaVenda.value > acaoSelecionada.quantidade) {
        console.log('ações insuficientes');
        return;
      } else {
        let v: number =
          this.numeroDeAcoesParaVenda.value * this.precoDeVenda.value;
        let ordem: OrdemDeVenda = {
          ativo: acaoSelecionada.ativo,
          corretagem: v * 0.01,
          data: Timestamp.now(),
          key: '',
          keyAcao: acaoSelecionada.key,
          lote: acaoSelecionada.lote,
          preco: this.precoDeVenda.value,
          quantidade: this.numeroDeAcoesParaVenda.value,
          user: this.usuario.uid,
          qtdeExecutada: 0,
          status: 'aberta',
        };
        let key = await addDoc(collection(fdb, 'vendas'), ordem);
        await updateDoc(doc(fdb, 'vendas', key.id), { key: key.id });
        updateDoc(
          doc(
            fdb,
            'users/' + this.usuario.uid + '/carteira/' + this.keyAcaoSelecionada
          ),
          {
            quantidade:
              acaoSelecionada.quantidade - this.numeroDeAcoesParaVenda.value,
          }
        );
        while (this.cacheCompra.length > 0) this.cacheCompra.pop();
        while (this.cacheCustodia.length > 0) this.cacheCustodia.pop();
        this.executaOrdemDeVenda(acaoSelecionada.ativo, 0, ordem.quantidade);
        this.limparCamposDeVenda();
      }
    }
    return;
  }

  limparCamposDeVenda(): void {
    this.numeroDeAcoesParaVenda.setValue(null);
    this.precoDeVenda.setValue(null);
    this.keyAcaoSelecionada = null;
  }

  async executaOrdemDeVenda(ativo: string, i: number = 0, n: number = 0): Promise<void> {
    let qtdeVendaDisponivel: number = n;
    let qtdeCompraDisponivel: number =
      i < this.ordensDeCompra[ativo].length
        ? this.ordensDeCompra[ativo][i].quantidade -
          this.ordensDeCompra[ativo][i].qtdeExecutada
        : 0;
    while (
      qtdeCompraDisponivel > 0 &&
      qtdeVendaDisponivel > 0 &&
      this.ordensDeVenda[ativo][0].preco <= this.ordensDeCompra[ativo][i].preco
    ) {
      if (qtdeVendaDisponivel < qtdeCompraDisponivel) {
        this.cacheCustodia.push({
          keyAcao: this.ordensDeVenda[ativo][0].keyAcao,
          qde: qtdeVendaDisponivel,
          preco: this.ordensDeVenda[ativo][0].preco,
          from: this.ordensDeVenda[ativo][0].user,
          to: this.ordensDeCompra[ativo][i].user
        });
        this.ordensDeVenda[ativo][0].qtdeExecutada += 1 * qtdeVendaDisponivel;
        this.ordensDeVenda[ativo][0].status = 'executada';
        this.cacheCompra.push(this.ordensDeCompra[ativo][i].key);
        this.ordensDeCompra[ativo][i].qtdeExecutada += 1 * qtdeVendaDisponivel;
        this.ordensDeCompra[ativo][i].status = 'aberta';
      } else if (qtdeCompraDisponivel == qtdeVendaDisponivel) {
        this.cacheCustodia.push({
          keyAcao: this.ordensDeVenda[ativo][0].keyAcao,
          qde: qtdeCompraDisponivel,
          preco: this.ordensDeVenda[ativo][0].preco,
          from: this.ordensDeVenda[ativo][0].user,
          to: this.ordensDeCompra[ativo][i].user
        });
        this.ordensDeCompra[ativo][i].qtdeExecutada += 1 * qtdeCompraDisponivel;
        this.ordensDeCompra[ativo][i].status = 'executada';
        this.cacheCompra.push(this.ordensDeCompra[ativo][i].key);
        this.ordensDeVenda[ativo][0].qtdeExecutada += 1 * qtdeVendaDisponivel;
        this.ordensDeVenda[ativo][0].status = 'executada';
      } else if (qtdeVendaDisponivel > qtdeCompraDisponivel) {
        this.cacheCustodia.push({
          keyAcao: this.ordensDeVenda[ativo][0].keyAcao,
          qde: qtdeCompraDisponivel,
          preco: this.ordensDeVenda[ativo][0].preco,
          from: this.ordensDeVenda[ativo][0].user,
          to: this.ordensDeCompra[ativo][i].user
        });
        this.cacheCompra.push(this.ordensDeCompra[ativo][i].key);
        this.ordensDeCompra[ativo][i].qtdeExecutada += qtdeCompraDisponivel;
        this.ordensDeCompra[ativo][i].status = 'executada';
        this.ordensDeVenda[ativo][0].qtdeExecutada += 1 * qtdeCompraDisponivel;
        this.executaOrdemDeVenda(ativo, i + 1, n - 1 * qtdeCompraDisponivel);
      }
      qtdeCompraDisponivel -= this.ordensDeCompra[ativo][i].qtdeExecutada;
      qtdeVendaDisponivel -= this.ordensDeVenda[ativo][0].qtdeExecutada;
    }
    if (i == 0) {
      updateDoc(doc(fdb, 'vendas/' + this.ordensDeVenda[ativo][0].key), {
        qtdeExecutada: 1 * this.ordensDeVenda[ativo][0].qtdeExecutada,
        status: this.ordensDeVenda[ativo][0].status,
      });
      let j = 0;
      this.cacheCompra.forEach((compra) => {
        updateDoc(doc(fdb, 'compras/' + compra), {
          qtdeExecutada: 1 * this.ordensDeCompra[ativo][j].qtdeExecutada,
          status: this.ordensDeCompra[ativo][j].status,
        });
        j++;
      });
      for (const transf of this.cacheCustodia) {
        addDoc(collection(fdb, 'ativos', ativo, 'precos'), {
          preco: transf.preco,
          data: Timestamp.now(),
        });
        updateDoc(doc(fdb, 'ativos', ativo), { ultimoPreco: transf.preco });
        await this.transfereCustodia(transf.keyAcao, transf.qde, transf.preco, transf.from, transf.to);
      }
      return;
    }
  }

  async lancarOrdemCompra(): Promise<void> {
    if (
      this.usuario != null &&
      this.ativoSelecionadoParaCompra != null &&
      this.numeroDeAcoesParaCompra.value != null &&
      this.precoDeCompra.value != null
    ) {
      let v: number =
        this.numeroDeAcoesParaCompra.value * this.precoDeCompra.value;
      if (v > this.usuario.cash) {
        console.log('saldo insuficiente');
        return;
      } else {
        let ordem: OrdemDeCompra = {
          ativo: this.ativoSelecionadoParaCompra,
          corretagem: v * 0.01,
          data: Timestamp.now(),
          key: '',
          preco: this.precoDeCompra.value,
          quantidade: this.numeroDeAcoesParaCompra.value,
          user: this.usuario.uid,
          qtdeExecutada: 0,
          status: 'aberta',
        };
        let key = await addDoc(collection(fdb, 'compras'), ordem);
        await updateDoc(doc(fdb, 'compras', key.id), { key: key.id });
        updateDoc(doc(fdb, 'users', this.usuario.uid), {
          cash:
            this.usuario.cash -
            ordem.quantidade * ordem.preco -
            ordem.corretagem,
        });
        while (this.cacheVenda.length > 0) this.cacheVenda.pop();
        while (this.cacheCustodia.length > 0) this.cacheCustodia.pop();
        this.executaOrdemDeCompra(this.ativoSelecionadoParaCompra, 0, ordem.quantidade);
        this.limparCamposDeCompra();
      }
    }
    return;
  }

  limparCamposDeCompra(): void {
    this.numeroDeAcoesParaCompra.setValue(null);
    this.precoDeCompra.setValue(null);
    this.ativoSelecionadoParaCompra = null;
    return;
  }

  async executaOrdemDeCompra(ativo: string, i: number = 0, n: number = 0): Promise<void> {
    let qtdeCompraDisponivel: number = n;
    let qtdeVendaDisponivel: number =
      i < this.ordensDeVenda[ativo].length
        ? this.ordensDeVenda[ativo][i].quantidade -
          this.ordensDeVenda[ativo][i].qtdeExecutada
        : 0;
    while (
      qtdeCompraDisponivel > 0 &&
      qtdeVendaDisponivel > 0 &&
      this.ordensDeCompra[ativo][0].preco >= this.ordensDeVenda[ativo][i].preco
    ) {
      if (qtdeCompraDisponivel < qtdeVendaDisponivel) {
        this.cacheCustodia.push({
          keyAcao: this.ordensDeVenda[ativo][i].keyAcao,
          qde: qtdeCompraDisponivel,
          preco: this.ordensDeVenda[ativo][i].preco,
          from: this.ordensDeVenda[ativo][i].user,
          to: this.ordensDeCompra[ativo][0].user
        });
        this.ordensDeCompra[ativo][0].qtdeExecutada += 1 * qtdeCompraDisponivel;
        this.ordensDeCompra[ativo][0].status = 'executada';
        this.cacheVenda.push(this.ordensDeVenda[ativo][i].key);
        this.ordensDeVenda[ativo][i].qtdeExecutada += 1 * qtdeCompraDisponivel;
        this.ordensDeVenda[ativo][i].status = 'aberta';
      } else if (qtdeCompraDisponivel == qtdeVendaDisponivel) {
        this.cacheCustodia.push({
          keyAcao: this.ordensDeVenda[ativo][i].keyAcao,
          qde: qtdeCompraDisponivel,
          preco: this.ordensDeVenda[ativo][i].preco,
          from: this.ordensDeVenda[ativo][i].user,
          to: this.ordensDeCompra[ativo][0].user
        });
        this.ordensDeCompra[ativo][0].qtdeExecutada += 1 * qtdeCompraDisponivel;
        this.ordensDeCompra[ativo][0].status = 'executada';
        this.cacheVenda.push(this.ordensDeVenda[ativo][i].key);
        this.ordensDeVenda[ativo][i].qtdeExecutada += 1 * qtdeVendaDisponivel;
        this.ordensDeVenda[ativo][i].status = 'executada';
      } else if (qtdeCompraDisponivel > qtdeVendaDisponivel) {
        this.cacheCustodia.push({
          keyAcao: this.ordensDeVenda[ativo][i].keyAcao,
          qde: qtdeVendaDisponivel,
          preco: this.ordensDeVenda[ativo][i].preco,
          from: this.ordensDeVenda[ativo][i].user,
          to: this.ordensDeCompra[ativo][0].user
        });
        this.cacheVenda.push(this.ordensDeVenda[ativo][i].key);
        this.ordensDeVenda[ativo][i].qtdeExecutada += qtdeVendaDisponivel;
        this.ordensDeVenda[ativo][i].status = 'executada';
        this.ordensDeCompra[ativo][0].qtdeExecutada += 1 * qtdeVendaDisponivel;
        this.executaOrdemDeCompra(ativo, i + 1, n - 1 * qtdeVendaDisponivel);
      }
      qtdeVendaDisponivel -= this.ordensDeVenda[ativo][i].qtdeExecutada;
      qtdeCompraDisponivel -= this.ordensDeCompra[ativo][0].qtdeExecutada;
    }
    if (i == 0) {
      updateDoc(doc(fdb, 'compras/' + this.ordensDeCompra[ativo][0].key), {
        qtdeExecutada: 1 * this.ordensDeCompra[ativo][0].qtdeExecutada,
        status: this.ordensDeCompra[ativo][0].status,
      });
      let j = 0;
      this.cacheVenda.forEach((venda) => {
        updateDoc(doc(fdb, 'vendas/' + venda), {
          qtdeExecutada: 1 * this.ordensDeVenda[ativo][j].qtdeExecutada,
          status: this.ordensDeVenda[ativo][j].status,
        });
        j++;
      });  
      for (const transf of this.cacheCustodia) {
        addDoc(collection(fdb, 'ativos', ativo, 'precos'), {
          preco: transf.preco,
          data: Timestamp.now(),
        });
        updateDoc(doc(fdb, 'ativos', ativo), { ultimoPreco: transf.preco });
        await this.transfereCustodia(transf.keyAcao, transf.qde, transf.preco, transf.from, transf.to);
      }
      return;
    }
  }

  async transfereCustodia(
    keyAcao: string,
    quantidade: number,
    preco: number,
    from: string,
    to: string
  ): Promise<void> {
    let qfrom: number;
    let qto: number;

    let afrom = await getDoc(
      doc(fdb, 'users/' + from + '/carteira/' + keyAcao)
    );
    if (afrom.exists()) {
      let x: number = (await getDoc(doc(fdb, 'sys/caixa'))).get('cash');
      await updateDoc(doc(fdb, 'sys/caixa'), { cash: 1 * x + 0.01 * preco * quantidade});
      let ato = await getDoc(doc(fdb, 'users/' + to + '/carteira/' + keyAcao));
      if (ato.exists()) {
        let qto = ato.get('quantidade');
        await updateDoc(doc(fdb, 'users/' + to + '/carteira/' + keyAcao), {
          quantidade: 1 * qto + 1 * quantidade,
        });
        let c: number = (await getDoc(doc(fdb, 'users/' + from))).get('cash');
        await updateDoc(doc(fdb, 'users/' + from), {
          cash: 1 * c + 1 * preco * quantidade,
        });
      } else {
        let acaoTo: AcaoEmCarteira = {
          ativo: afrom.get('ativo'),
          key: keyAcao,
          lote: afrom.get('lote'),
          quantidade: quantidade,
          usuario: to,
        };
        await setDoc(doc(fdb, 'users/' + to + '/carteira/' + keyAcao), acaoTo);
      }
    } else console.log('no doc');
    return;
  }

  // Only Integer Numbers
  keyPressNumbers(event: {
    which: any;
    keyCode: any;
    preventDefault: () => void;
  }) {
    var charCode = event.which ? event.which : event.keyCode;
    // Only Numbers 0-9
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }
}
