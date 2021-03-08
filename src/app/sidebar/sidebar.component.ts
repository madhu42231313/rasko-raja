import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Output() selectedItemEvent = new EventEmitter<string>();

  list = [
    {
      displayName: 'Home',
      icon: 'fa fa-home fa-2x',
      name: 'home',
      selected: true
    },
    // {
    //   displayName: 'Contact Us',
    //   icon: 'fa fa-address-book fa-2x',
    //   name: 'contact',
    //   selected: false
    // }
  ]

  constructor() { }

  ngOnInit(): void {
  }

  listSelected(item: any) {
    this.list.forEach(listItem => {
      listItem.selected = false;
    })
    item.selected = true;
    this.selectedItemEvent.emit(item.name);
  }

}
