import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ButtonModule } from "primeng/button";

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Menu, RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      { separator: true },
      { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/' }, 
      { label: 'Filter Force', icon: 'pi pi-filter', routerLink: '/filter-force' },
      { label: 'Password Rush', icon: 'pi pi-lock', routerLink: '/password-rush' },
      { label: 'Phish Or Fake', icon: 'pi pi-envelope', routerLink: '/phish-or-fake' },
      { label: 'Quiz', icon: 'pi pi-question', routerLink: '/quiz' },
      { separator: true },
    ]
  }
}
