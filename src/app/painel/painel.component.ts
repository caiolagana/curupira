import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Ativo } from '../interfaces';
import { registerLocaleData } from '@angular/common';
import localeBr from '@angular/common/locales/br';
registerLocaleData(localeBr, 'br');

@Component({
  selector: 'app-painel',
  templateUrl: './painel.component.html',
  styleUrls: ['./painel.component.css'],
})
export class PainelComponent implements OnInit {
  @Input() ativosListados: Ativo[] = [];
  @Input() ativoEscolhido: string = '';
  @Output() escolheAtivo = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {}

  selecionaAtivo(ativo: string): void {
    this.ativoEscolhido = ativo;
    this.escolheAtivo.emit(ativo);
  }
}
