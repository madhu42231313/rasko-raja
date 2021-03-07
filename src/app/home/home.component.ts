import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  selectedItemName: string = 'home';

  constructor() { }

  ngOnInit(): void {
  }

  selectedItem(name: string) {
    this.selectedItemName = name;
  }

}
