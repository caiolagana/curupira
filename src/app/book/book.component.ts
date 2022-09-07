import { Component, Input, OnChanges, EventEmitter, Output } from '@angular/core'
import { OrdemDeVenda, OrdemDeCompra, Ativo } from '../interfaces'
import { registerLocaleData } from '@angular/common';
import localeBr from '@angular/common/locales/br';
registerLocaleData(localeBr, 'br');

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css'],
})
export class BookComponent implements OnChanges {
  
  @Input() ativosListados: Ativo[] = [];
  @Input() ativoSelecionado: string = '';
  @Input() ofertasVenda: OrdemDeVenda[] = [];
  @Input() ofertasCompra: OrdemDeCompra[] = [];
  @Output() loteSelecionado = new EventEmitter<string | null>();
  @Output() selecionaAtivo = new EventEmitter<string>();

  constructor() { }

  ngOnChanges(): void { }

}
