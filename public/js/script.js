(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })

  const guests = {
  adults: 1,
  children: 0,
  infants: 0
};

const minGuests = {
  adults: 1,
  children: 0,
  infants: 0
};

function updateTotalGuests() {
  const total =
    guests.adults + guests.children + guests.infants;

  document.getElementById("totalGuests").innerText = total;
}

window.updateGuests = function (type, change) {
  const newValue = guests[type] + change;

  if (newValue < minGuests[type]) return;

  guests[type] = newValue;

  document.getElementById(`${type}Count`).innerText = guests[type];
  document.getElementById(`${type}Input`).value = guests[type];

  updateTotalGuests();
};
})();