import { Component, OnInit } from '@angular/core';

interface Receta {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  tiempo: string;
  dificultad: string;
  ingredientes: string[];
}

interface Tip {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  link: string;
}

const recetas: Receta[] = [
  {
    id: 1,
    titulo: 'Ensalada César con Lechuga Grazion',
    descripcion: 'Una ensalada César clásica con la suave y fresca Lechuga Grazion, aderezo casero y crutones crujientes.',
    imagen: 'https://th.bing.com/th/id/OIP.IbjpViIQqAtjlnLCwK_mygHaE8?w=273&h=182&c=7&r=0&o=7&dpr=1.2&pid=1.7&rm=3',
    tiempo: '15 minutos',
    dificultad: 'Fácil',
    ingredientes: ['1 Lechuga Grazion', '50g de queso parmesano', 'Crutones', 'Aderezo César'],
  },
  {
    id: 2,
    titulo: 'Wrap de Lechuga Stharfither con Pollo',
    descripcion: 'Un wrap saludable usando las hojas crujientes de Lechuga Stharfither como envoltura para un sabroso pollo.',
    imagen: 'https://i0.wp.com/chelsealeblancrdn.com/wp-content/uploads/2017/02/Chicken-Lettuce-Wrap-Tacos-3.jpg?resize=1536%2C1069&ssl=1',
    tiempo: '20 minutos',
    dificultad: 'Media',
    ingredientes: ['Hojas grandes de Lechuga Stharfither', 'Pechuga de pollo', 'Aguacate', 'Tomate'],
  },
  {
    id: 3,
    titulo: 'Ensalada con Lechuga Skay Ruby',
    descripcion: 'Una ensalada fresca y vibrante con Skay Ruby, combinada con sabores mediterráneos como queso feta y aceitunas.',
    imagen: 'https://th.bing.com/th/id/R.72e039a99c29b6c0f8b0bd7433b93069?rik=f8wRxl%2fn2iHcpg&riu=http%3a%2f%2fwww.recetario-cocina.com%2farchivosbd%2fensalada-mixta-con-aceitunas.jpg&ehk=R%2bY%2faoRxZhOwz3ZfidJOnIh94rBHA7T5ynXpOUBMr6s%3d&risl=&pid=ImgRaw&r=0',
    tiempo: '12 minutos',
    dificultad: 'Fácil',
    ingredientes: ['Lechuga Skay Ruby', 'Aceitunas negras', 'Tomates cherry', 'Aderezo de aceite de oliva y limón'],
  },
];

const tips: Tip[] = [
  {
    id: 1,
    titulo: 'Cómo mantener la lechuga fresca',
    descripcion: 'Aprende a conservar tus lechugas frescas y crujientes durante más días.',
    imagen: 'https://th.bing.com/th/id/OIP.5kvhNPZd6WIhh1eYGMSbhAHaEK?w=308&h=180&c=7&r=0&o=7&dpr=1.2&pid=1.7&rm=3',
    link: 'https://es.wikihow.com/mantener-la-lechuga-fresca',
  },
  {
    id: 2,
    titulo: 'La forma correcta de lavar las lechugas',
    descripcion: 'Técnicas para lavar tus lechugas y eliminar residuos sin dañar las hojas.',
    imagen: 'https://tse3.mm.bing.net/th/id/OIP.Y4LdjWaI9JkFy3oClwNyKAHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
    link: 'https://es.wikihow.com/lavar-la-lechuga',
  },
  {
    id: 3,
    titulo: 'Cómo conservar la lechuga crujiente',
    descripcion: 'Trucos para evitar que tus lechugas se pongan marrones después de cortarlas.',
    imagen: 'https://i.pinimg.com/736x/fb/64/98/fb64981155e0e4c320d9e55f31eb3c0d.jpg',
    link: 'https://es.wikihow.com/conservar-la-lechuga-crujiente',
  },
];

@Component({
  selector: 'app-recetas',
  standalone: false,
  templateUrl: './recetas.component.html',
  styleUrls: ['./recetas.component.scss'],
})
export class RecetasComponent implements OnInit {
  recetas: Receta[] = recetas;
  tips: Tip[] = tips;

 ngOnInit(): void {
      window.scrollTo(0, 0); 
    }
  
  viewRecipe(receta: Receta): void {
    switch (receta.titulo) {
      case 'Ensalada César con Lechuga Grazion':
        window.open('https://comedera.com/ensalada-cesar/', '_blank');
        break;
      case 'Wrap de Lechuga Stharfither con Pollo':
        window.open('https://facilycasero.com/wrap-de-lechuga-con-pollo/', '_blank');
        break;
      case 'Ensalada con Lechuga Skay Ruby':
        window.open('https://cookpad.com/mx/recetas/15998006?ref=search&search_term=ensalada+de+aceitunas+y+lechuga', '_blank');
        break;
      default:
        console.log(`Ver receta completa: ${receta.titulo}`);
    }
  }

  readMore(tip: Tip): void {
    console.log(`Leer más: ${tip.titulo}`);
    window.open(tip.link, '_blank');
  }

  viewMoreRecipes(): void {
    console.log('Ver más recetas');
  }
}