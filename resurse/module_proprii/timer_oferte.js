document.addEventListener('DOMContentLoaded', function() {
    const offerTimerElement = document.getElementById('offer-timer');
    const offerBanner = document.getElementById('offer-banner');

    if (offerTimerElement && offerBanner) {
        const finalizareDateString = offerTimerElement.dataset.finalizare;
        const finalizareDate = new Date(finalizareDateString);

        if (isNaN(finalizareDate.getTime())) {
            console.error("Eroare: Data de finalizare a ofertei este invalida:", finalizareDateString);
            offerBanner.style.display = 'none';
            return;
        }

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = finalizareDate.getTime() - now;

            if (distance < 0) {
                offerBanner.style.display = 'none';
                clearInterval(countdownInterval);
                console.log("Oferta a expirat. Reincarcare pagina pentru a prelua noua oferta.");
                window.location.reload();
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            offerTimerElement.innerHTML = `${hours}h ${minutes}m ${seconds}s`;

            if (distance < 10000) {
                if (!offerTimerElement.classList.contains('ending-soon')) {
                    offerTimerElement.classList.add('ending-soon');
                }
            } else {
                if (offerTimerElement.classList.contains('ending-soon')) {
                    offerTimerElement.classList.remove('ending-soon');
                }
            }
        }

        const countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown();
    } else {
        console.log("Elementele pentru bannerul de oferta sau temporizator nu au fost gasite.");
    }
});
