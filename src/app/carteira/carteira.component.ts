import { Component, Input, OnInit } from '@angular/core';
import { fdb } from '../db.service';

import { FormControl, Validators } from '@angular/forms';
import { AcaoEmCarteira, OrdemDeVenda } from '../interfaces';

@Component({
  selector: 'app-carteira',
  templateUrl: './carteira.component.html',
  styleUrls: ['./carteira.component.css'],
})
export class CarteiraComponent implements OnInit {

  @Input() acoesEmCarteira: AcaoEmCarteira[] = [];
  @Input() dictAcoesEmCarteira: { [key: string]: number } = {};

  constructor() { }

  ngOnInit(): void {}

}
