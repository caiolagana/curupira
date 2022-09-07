import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-grafico',
  templateUrl: './grafico.component.html',
  styleUrls: ['./grafico.component.css']
})
export class GraficoComponent implements OnInit {

  grafico: string = 'M 10 350 L 20 350 L 30 330 L 40 300 L 50 240L 60 250 L 70 280 L 80 200 L 90 190 L 100 110 L 110 180 L 120 210 L 130 100 L 140 70';
  
  constructor() { }

  ngOnInit(): void {
  }

}
