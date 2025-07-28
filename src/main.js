// https://restcountries.com/v3.1/name/${name}?fullText=true

const error = document.querySelector('#error');
const loader = document.querySelector('#loading');
const searchInput= document.querySelector('#searchInput');
const searchBtn = document.getElementById('searchBtn');
const countryDetails = document.getElementById('countryDetails');
let map;

searchBtn.addEventListener('click', async () => {
const countryName = searchInput.value.trim();
if(!countryName) return;

await fetchCountry(countryName);
})

// Load default country on page load
document.addEventListener('DOMContentLoaded', async () => {
    await fetchCountry('Egypt');
})

async  function fetchCountry(name){
    loader.classList.remove('hidden');
     error.classList.add('hidden');
     countryDetails.innerHTML =``;
    try{
      const res = await fetch(`https://restcountries.com/v3.1/name/${name}?fullText=true`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      const country = data[0];
        if(!country){
            throw new Error('Invaild Country Name');
        }
        const languages = country.languages? Object.values(country.languages).join(', ') : 'N/A';
      countryDetails.innerHTML =`
      <div class='p-4 border rounded shadow'>
      <img src="${country.flags.svg}" alt="flag" class="w-32 mb-2">
     <h2 class="text-xl font-bold">${country.name.common}</h2>
     <p><strong>Capital: </strong> ${country.capital}</p>
      <p><strong>Population: </strong> ${country.population.toLocaleString()}</p>
           <p><strong>Languages: </strong> ${languages}</p>
           <div class="mb-4">
          <h2 class="text-xl font-semibold mb-2">Local Times</h2>
        <ul id="timezoneList" class="list-disc ml-6"></ul>
         </div>
      </div>
      `
      UpdateTimezones(country.timezones);
      drawMap(country.latlng, country.name.common);
    }
    catch(error){
        loader.classList.add('hidden');
        error.classList.remove('hidden');
        error.textContent = `Country not found: ${error.message}`;
    }finally{
        loader.classList.add('hidden');
    }
}
function UpdateTimezones(timezones) {
    const timezoneList = document.getElementById('timezoneList');
    timezoneList.innerHTML = '';
    timezones.forEach(zone => {
      const li = document.createElement('li');
      const ianaZone = convertToIANA(zone) || zone;
      const localTime = getTimeUsingIntl(ianaZone);
      li.textContent = `${zone} - ${localTime}`;
      timezoneList.appendChild(li);
  
});


}

function convertToIANA(utcString) {
  // Handle special cases first
  if (utcString === "UTC") return "Etc/UTC";
  
  // Extract the offset
  const match = utcString.match(/^UTC([+-])(\d{2}):?(\d{2})?$/);
  if (!match) return null;
  
  const [_, sign, hours, minutes = "00"] = match;
  // Flip the sign because IANA format uses opposite sign convention from UTC
  const flippedSign = sign === "+" ? "-" : "+";
  
  return `Etc/GMT${flippedSign}${parseInt(hours)}`;
}

function getTimeUsingIntl(tz) {
  try {
    const options = {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    return Intl.DateTimeFormat("en-US", options).format(new Date());
  } catch (err) {
    console.warn(`Timezone ${tz} not supported, falling back.`);
    return "Unsupported timezone";
  }
}



function drawMap(latlng, name) {
    const [lat,lng]= latlng;

    if(!map){

         map = L.map('map').setView([lat,lng], 5);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    }else{
        map.setView([lat, lng], 5);

    }
    L.marker([lat,lng]).addTo(map)
    .bindPopup(name)
    .openPopup();
   
}