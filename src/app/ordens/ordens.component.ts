import { Component, OnInit, Input } from '@angular/core';
import { OrdemDeVenda, OrdemDeCompra, AcaoEmCarteira, Usuario } from '../interfaces';
import {
  addDoc,
  collection,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { fdb } from '../db.service';
import { registerLocaleData } from '@angular/common';
import localeBr from '@angular/common/locales/br';
registerLocaleData(localeBr, 'br');

@Component({
  selector: 'app-ordens',
  templateUrl: './ordens.component.html',
  styleUrls: ['./ordens.component.css'],
})
export class OrdensComponent implements OnInit {
  @Input() ordensDeVenda: OrdemDeVenda[] = [];
  @Input() dictOrdensVenda: { [key: string]: number } = {};

  @Input() ordensDeCompra: OrdemDeCompra[] = [];
  @Input() dictOrdensCompra: { [key: string]: number } = {};

  @Input() acoesEmCarteira: AcaoEmCarteira[] = [];
  @Input() dictAcoesEmCarteira: { [key: string]: number } = {};

  @Input() usuario: Usuario | null = null;

  constructor() {}

  ngOnInit(): void {}

  async cancelarOrdemVenda(key: string): Promise<void> {
    if (this.usuario) {
      let ordemSelecionada: OrdemDeVenda = this.ordensDeVenda[this.dictOrdensVenda[key]];
      let q: number =
        1 *
          this.acoesEmCarteira[
            this.dictAcoesEmCarteira[ordemSelecionada.keyAcao]
          ].quantidade +
        1 * (ordemSelecionada.quantidade - ordemSelecionada.qtdeExecutada);
      await updateDoc(
        doc(
          fdb,
          'users/' + this.usuario.uid + '/carteira/' + ordemSelecionada.keyAcao
        ),
        { quantidade: q }
      );
      await updateDoc(doc(fdb, 'vendas', key), { status: 'cancelada' });
    }
  }

  async cancelarOrdemCompra(key: string): Promise<void> {
    if (this.usuario) {
      let ordemSelecionada: OrdemDeCompra =
        this.ordensDeCompra[this.dictOrdensCompra[key]];
      await updateDoc(
        doc(fdb, 'users/' + this.usuario.uid),
      { cash: this.usuario.cash + (ordemSelecionada.quantidade - ordemSelecionada.qtdeExecutada) }
      );
      await updateDoc(doc(fdb, 'compras', key), { status: 'cancelada' });
    }
  }
}
