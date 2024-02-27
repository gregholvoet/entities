let parliaments = []
let entities = []

function parliament(d) {
    d.forEach(parliament => {
        const detailParliament = parliament.branches[0];
        parliaments.push({
          id: detailParliament.id, 
          label: detailParliament.label === "Royaume" ? parliament.slug + ' ' + detailParliament.label : detailParliament.label
        })

        if(detailParliament.branches && detailParliament.branches.length > 0) {
          entity(detailParliament.branches);
        }
    })
}

function entity(entry) {
  // console.log(e)
  if(entry.type !== 'commune') {
    entry.forEach(e => {
      if(e.type !== 'commune') {
        entities.push({
          id: e.id, label: e.label
        })
  
        if(e.branches && e.branches.length > 0) {
          entity(e.branches);
        }
      }
    })
  }
}

function generateHtml(data) {
  const app = document.getElementById('app');
  let html = '<table class="table table-striped">';
  html +='<tr>';
  html += '<th>ID</th>'
  html += '<th>Label</th>'
  html +='</tr>';
    
  let id, label= '';
  data.forEach(row => {
    id = row.id !== undefined ? row.id : '---';
    label = row.label !== undefined ? row.label : '---';

    html +="<tr>";
    html += "<td>'" + id + "</td>";
    html += "<td>" + label + "</td>";
    html +="</tr>";
  });
  const tempHtml = document.createElement("div");
  tempHtml.innerHTML = html;
  app.appendChild(tempHtml)
}

function recupererDonnees(url) {
  fetch(url)
    .then(response => {
      return response.json();
    })
    .then(data => {
        // console.log(data.data)
        parliament(data.data)
        // console.log(parliaments)
        console.log('###', entities.sort())
        generateHtml(parliaments.sort().concat(entities.sort()))
    });      
}

recupererDonnees('https://services-service.uat.rtbf.be/elections/v1/entities');
