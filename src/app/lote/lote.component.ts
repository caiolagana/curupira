import {
  Component,
  Input,
  OnInit,
  OnChanges,
  AfterViewInit,
} from '@angular/core';
import { storage } from '../db.service';
import { ref, getDownloadURL } from 'firebase/storage';
import { Lote } from '../interfaces';
import { getMatFormFieldMissingControlError } from '@angular/material/form-field';

@Component({
  selector: 'app-lote',
  templateUrl: './lote.component.html',
  styleUrls: ['./lote.component.css'],
})
export class LoteComponent implements OnChanges {
  @Input() loteSelecionado: string | null = null;
  @Input() lotesListados: Lote[] = [];
  @Input() dictLotesListados: { [key: string]: number } = {};

  constructor() {}

  ngOnChanges(): void {
    this.selecionaLote();
  }

  ngAfterViewInit() {
    this.selecionaLote();
  }

  selecionaLote(): void {
    if (this.loteSelecionado != null && this.lotesListados.length > 0) {
      getDownloadURL(
        ref(
          storage,
          this.lotesListados[this.dictLotesListados[this.loteSelecionado]].imgs[
            this.lotesListados[this.dictLotesListados[this.loteSelecionado]]
              .imgs.length - 1
          ]
        )
      ).then((url) => {
        const img = document.getElementById('loteimg');
        img?.setAttribute('src', url);
      });
    }
  }
}
