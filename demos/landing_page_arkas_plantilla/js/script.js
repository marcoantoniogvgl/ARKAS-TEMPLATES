const buyButton = document.getElementById('buyButton');

if (buyButton) {
 buyButton.addEventListener('click', function () {
   const originalText = this.textContent;
   this.textContent = '¡Gracias por tu compra!';
   this.disabled = true;

   setTimeout(() => {
     this.textContent = originalText;
     this.disabled = false;
     alert('¡Gracias por tu interés! Serás redirigido al proceso de compra.');
   }, 1200);
 });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
 anchor.addEventListener('click', function (event) {
   const targetId = this.getAttribute('href');

   if (!targetId || targetId === '#') {
     return;
   }

   const target = document.querySelector(targetId);
   if (!target) {
     return;
   }

   event.preventDefault();
   target.scrollIntoView({ behavior: 'smooth', block: 'start' });
 });
});

const observer = new IntersectionObserver(
 (entries) => {
   entries.forEach((entry) => {
     if (entry.isIntersecting) {
       entry.target.classList.add('is-visible');
     }
   });
 },
 { threshold: 0.12 }
);

document.querySelectorAll('.card, .testimonial, .feature-box').forEach((element) => {
 element.classList.add('reveal');
 observer.observe(element);
});