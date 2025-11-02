import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { UserService } from '../services/user.service';
import { AsyncPipe, NgIf } from "@angular/common";

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Menu, RouterLink, RouterLinkActive, ButtonModule, AsyncPipe, NgIf],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  items: MenuItem[] | undefined;

  constructor(public userService: UserService) {}

  ngOnInit() {
    this.items = [
      { separator: true },
      { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/' }, 
      { label: 'Filter Force', icon: 'pi pi-filter', routerLink: '/filter-force' },
      { label: 'Password Rush', icon: 'pi pi-lock', routerLink: '/password-rush' },
      { label: 'Phish Or Fake', icon: 'pi pi-envelope', routerLink: '/phish-or-fake' },
      { label: 'Quiz', icon: 'pi pi-question', routerLink: '/quiz' },
      { label: 'Revision Key Points', icon: 'pi pi-key', routerLink: '/revision-key-points' },
      { separator: true },
    ]

    // this.userService.currentUser$.subscribe(user => {
    //   console.log(user)
    // })
  }
}
