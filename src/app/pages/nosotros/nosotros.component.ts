import { Component } from '@angular/core';

@Component({
  selector: 'app-nosotros',
  standalone: false,
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.scss'
})
export class NosotrosComponent {
ngOnInit(): void {
      window.scrollTo(0, 0); 
    }
}