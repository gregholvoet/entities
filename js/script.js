let i = 0;
let zip = [];
let entities = [];
let l1,l2,l3,l4;

function one(a, l1 = a.slug, l2, l3, l4) {
  // check le niveau
  switch(a.type) {
    case 'circonscription' :
      l2 = a.label;
      case 'canton' :
      l3 = a.label
      break;
  }

  if(l2 === undefined && l1 === 'bruxellois') {
    l2 = 'Circonscription de Bruxelles-Capitale';
  }

  if (Array.isArray(a)) {
    a.forEach(b => {
      one(b,l1,l2,l3);
    });
  } else {
    if (a.branches && a.branches.length > 0 && a.type != 'commune') {
      one(a.branches,l1,l2,l3);
    }
  }

  if (a.type != 'commune') {
    // console.log('data', a);
    // console.log('index', i++);
    if (a.zip && a.zip.length > 0) {
      zip.push({ id: a.id, election: l1, circ: l2, canton: l3, zip: a.zip });
    }
  }
}

function generateHtml(data, thead, title) {
  const app = document.getElementById('app');
  let html = '<h1>'+ title +'</h1><table class="table table-striped">';
  html +='<tr>';
  thead.forEach(th => {
    html += '<th>'+ th +'</th>'
  })
  html += '<th>Keywords</th>'
  html +='</tr>';
    
  let election, circ, canton, zip = '';
  data.forEach(row => {
    id = row.id !== undefined ? row.id : '---';
    election = row.election !== undefined ? row.election : '---';
    circ = row.circ !== undefined ? row.circ : '---';
    canton = row.canton !== undefined ? row.canton : '---';
    zip = row.zip !== undefined ? row.zip : '---';

    html +="<tr>";
    html += thead.includes('ID') ? "<td>" + id + "</td>" : '';
    html += thead.includes('Election') ? "<td>" + election + "</td>" : '';
    html += thead.includes('Circonscription') ? "<td>" + circ + "</td>" : '';
    html += thead.includes('Canton') ? "<td>" + canton + "</td>" : '';
    html += thead.includes('ZIP') ? "<td>" + zip.join(', ') + "</td>" : '';
    html += "<td class='js-keyword'></td>";
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
      one(data.data);
      const zipCanton = zip;

      const groupedElectionZip = zip.reduce((acc, current) => {
          if (!acc[current.election]) {
              acc[current.election] = [];
          }
          acc[current.election].push(current.zip);
          return acc;
      }, {});

      const groupedElectionZipArray = Object.entries(groupedElectionZip).map(([electionType, elements]) => ({
        election: electionType,
        zip: elements.flat().sort()
      }));

      const groupedCircData = zip.reduce((acc, current) => {
          if (!acc[current.circ]) {
              acc[current.circ] = [];
          }
          acc[current.circ].push(current.zip);
          return acc;
      }, {});

      const groupedCircDataArray = Object.entries(groupedCircData).map(([circ, elements]) => ({
        circ: circ,
        zip: elements.flat().sort()
      }));

      // generateHtml(groupedElectionZipArray, ['Election', 'ZIP'] ,"ZIP par Election");
      generateHtml(groupedCircDataArray, ['Circonscription', 'ZIP'] ,"ZIP par Circonscription");
      generateHtml(zipCanton, ['Canton', 'ZIP'], "ZIP par cantons");

      fetch('keywords.json')
        .then(response => {
          return response.json();
        })
        .then(data => {
          const keywordList = data
          // console.log('###', keywordList)

          const tdKeywords = document.querySelectorAll('.js-keyword')
          // console.log('###', tdKeywords)

          tdKeywords.forEach(td => {
            const zips = td.previousElementSibling.innerHTML
            const resultats = zips.split(', ').map(codePostal => rechercherMotsCles(codePostal));
            const html = resultats.filter(item => item.length > 0).join(', ')
            console.log('###', resultats)
            td.append(html)
          })

          function rechercherMotsCles(codePostal) {
            const r = keywordList
                      .filter(item => item.zip === parseInt(codePostal))
                      .map(item => {
                        const result = [];
                        if (item["keyword-cp"] !== null) {
                          result.push(item["keyword-cp"]);
                        }
                        if (item["keyword-city"] !== null) {
                          result.push(item["keyword-city"]);
                        }
                        return result.join(', ');
                      })
                      .filter(item => Object.keys(item).length > 0);
            console.log(r.length === 0, r)
            return r.length > 0 ? r : []
          }
        })
    });
}

recupererDonnees('https://services-service.uat.rtbf.be/elections/v1/entities');
