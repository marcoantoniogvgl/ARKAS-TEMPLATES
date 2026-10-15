// Datos de ejemplo compartidos por la web (navegador) y el servidor (Node): artistas, productos y conciertos.
(() => {
  const K = '#0B0B0B', W = '#FFFFFF', G = '#C9A24B', M = '#BFE3C8', Y = '#8D8D95', N = '#1E3A8A';
  const ACCENT = { Pop: '#D4AF37', Rock: '#0B0B0B', Urbano: '#C9A24B', 'Electrónica': '#7BC9A0', Flamenco: '#B8860B', Indie: '#A8DDB5', Jazz: '#8A6A1F', Folk: '#5FA77A', 'Clásica': '#E5D3A1' };
  const artists = [
    ['Lola Marén', 'Pop', 'Madrid', 'Pop luminoso con estribillos que se quedan en la cabeza.'],
    ['Nera Sol', 'Pop', 'Valencia', 'Voz cálida y sintetizadores de verano, todo el año.'],
    ['Los Faroles', 'Rock', 'Bilbao', 'Guitarras de carretera y letras de barrio desde 2009.'],
    ['Hierro Viejo', 'Rock', 'Zaragoza', 'Rock duro, riffs pesados y directos que se oyen desde la calle.'],
    ['Nitro Vega', 'Urbano', 'Sevilla', 'Rimas afiladas y bases frías, con el sur en la cabeza.'],
    ['Zafiro 24', 'Urbano', 'Málaga', 'Trap melódico y flow nocturno a pie de puerto.'],
    ['Kodo Wave', 'Electrónica', 'Barcelona', 'Techno melódico y sesiones largas que no dejan de crecer.'],
    ['Azahar Trío', 'Flamenco', 'Granada', 'Guitarra, cante y palmas: flamenco de raíz con aire nuevo.'],
    ['Bosque Lento', 'Indie', 'Santander', 'Canciones pequeñas, guitarras suaves y mucha niebla.'],
    ['Ámbar Quartet', 'Jazz', 'Sevilla', 'Jazz de club: improvisación, saxo y luz baja.'],
    ['Valle Hondo', 'Folk', 'Cantabria', 'Folk de cuerda y voces que cuentan historias de valle.'],
    ['Cuarteto Alba', 'Clásica', 'Salamanca', 'Música de cámara con repertorio clásico y encargos nuevos.']
  ].map(([name, genre, city, bio], i) => ({ id: 'a' + (i + 1), name, genre, city, bio, avatar: '' }));
  const products = [
    [0, 'tee', 'Camiseta Neón Tour', 'NEÓN', 15, 'Printify', [W, K, G]], [0, 'cap', 'Gorra Neón', 'NEÓN', 12, 'SPOD', [K, W]],
    [1, 'tote', 'Tote Girasol', 'SOL', 9, 'Printify', [W, M]], [1, 'mug', 'Taza Verano', 'VERANO', 8, 'Gelato', [W]],
    [2, 'hoodie', 'Sudadera Ruta 66', 'RUTA', 32, 'Gelato', [K, Y]], [2, 'vinyl', 'Vinilo Ruta 66', 'RUTA', 22, 'Fábrica de discos', [K]],
    [3, 'tee', 'Camiseta Forja', 'FORJA', 16, 'Printify', [K, W]], [3, 'patch', 'Parche Yunque', 'YUNQUE', 5, 'Printify', [K]],
    [4, 'cap', 'Gorra Corona', 'NV', 13, 'SPOD', [K, G]], [4, 'hoodie', 'Sudadera Calle', 'CALLE', 34, 'Gelato', [K, W]],
    [5, 'tee', 'Camiseta Zafiro', 'Z24', 15, 'Printify', [W, N]], [5, 'sticker', 'Pegatinas Z24', 'Z24', 4, 'Printify', [W]],
    [6, 'poster', 'Póster Pulso 24h', 'PULSO', 10, 'Gelato', [W]], [6, 'pin', 'Chapa Pulso', 'PULSO', 3, 'Printify', [K, G]],
    [7, 'tote', 'Tote Duende', 'DUENDE', 9, 'Printify', [W, M]], [7, 'mug', 'Taza Duende', 'DUENDE', 8, 'Gelato', [W]],
    [8, 'tee', 'Camiseta Musgo', 'MUSGO', 14, 'Printify', [M, W]], [8, 'poster', 'Póster Niebla', 'NIEBLA', 10, 'Gelato', [W]],
    [9, 'vinyl', 'Vinilo Ámbar en directo', 'ÁMBAR', 24, 'Fábrica de discos', [K]], [9, 'mug', 'Taza Ámbar', 'ÁMBAR', 8, 'Gelato', [K]],
    [10, 'beanie', 'Gorro Valle', 'VALLE', 14, 'SPOD', [Y, K]], [10, 'tote', 'Tote Cosecha', 'COSECHA', 9, 'Printify', [W]],
    [11, 'cd', 'CD Alba en vivo', 'ALBA', 12, 'Fábrica de discos', [K]], [11, 'poster', 'Póster Partitura', 'ALBA', 10, 'Gelato', [W]]
  ].map(([i, type, name, text, price, supplier, colors], n) => ({ id: 'p' + (n + 1), artist: artists[i].name, genre: artists[i].genre, color: ACCENT[artists[i].genre], colors, type, name, text, textColor: '', design: '', scale: 85, dy: 0, price, supplier }));
  const events = [
    [0, 'Madrid', 'Sala Aurora', '2026-11-21', 22, 120], [1, 'Valencia', 'Sala Mercat', '2026-11-28', 18, 150],
    [2, 'Bilbao', 'Sala Ría', '2026-12-12', 20, 200], [3, 'Zaragoza', 'Sala Forja', '2027-01-23', 16, 140],
    [4, 'Sevilla', 'Sala Cartuja', '2026-12-19', 18, 220], [5, 'Málaga', 'Sala Puerto', '2027-02-06', 15, 180],
    [6, 'Barcelona', 'Nave Pulso', '2027-01-16', 30, 300], [7, 'Granada', 'Peña del Albaicín', '2026-12-05', 15, 60],
    [8, 'Santander', 'Sala Bruma', '2027-02-20', 14, 90], [9, 'Sevilla', 'Club Ámbar', '2026-11-14', 25, 80],
    [10, 'Cantabria', 'Plaza Mayor', '2027-03-06', 12, 250], [11, 'Salamanca', 'Sala de Cámara', '2026-12-17', 20, 110]
  ].map(([i, city, venue, date, price, stock], n) => ({ id: 'e' + (n + 1), artist: artists[i].name, genre: artists[i].genre, color: ACCENT[artists[i].genre], city, venue, date, price, stock }));
  const seed = { artists, products, events };
  if (typeof module !== 'undefined' && module.exports) module.exports = seed; else window.SEED = seed;
})();
