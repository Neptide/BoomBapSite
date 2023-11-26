document.getElementById('ticketForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var formData = new FormData(event.target);
    fetch('/create-ticket', { // Aggiunto lo slash all'inizio del percorso
        method: 'POST',
        body: formData
    }).then(response => response.blob())
      .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'biglietto.pdf';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
      }).catch(err => console.error(err));
});
