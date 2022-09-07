import { Component, OnInit, Input } from '@angular/core';
import { Lote } from '../interfaces';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  @Input() lotesListados: Lote[] = [];
  @Input() dictLotesListados: { [key: string]: number } = {};

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    let mapimg = document.getElementById('mapimg');
    mapimg?.setAttribute('src', 'https://firebasestorage.googleapis.com/v0/b/salvia-ambiental.appspot.com/o/img%2Flandscreen.png?alt=media&token=db1e0ccf-3b10-4a9c-8a3b-a4d3845d5c6b');
  }

}
