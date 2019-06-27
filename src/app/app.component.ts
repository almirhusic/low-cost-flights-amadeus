import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Flights';

  clicked(e){
    let elements = Array.from(document.getElementsByClassName('nav-link'));

    elements.forEach(el => {
      el.classList.remove('active')
    });

    e.target.classList.toggle('active');
  }
}
