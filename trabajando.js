//
// This file is meant to regroup your javascript code. You can either copy/past
// any code that should be executed on each page loading or write your own
// taking advantage of the Odoo framework to create new behaviors or modify
// existing ones. For example, doing this will greet any visitor with a 'Hello,
// world !' message in a popup:
//

odoo.define('website.user_custom_code', function (require) {
'use strict';

   require('web.dom_ready')
   
  function docReady(fn) {
    // see if DOM is already available
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      // call on next available tick
      setTimeout(fn, 1)
    } else {
      document.addEventListener("DOMContentLoaded", fn)
    }
  }

  function generarEncabezado(encabezados) {
    let headerTemplate = document.getElementById(
      "depa_disponibilidad_template_head"
    )

    //Agregamos uno al principio y al final
    // para estilizar

    let trHead = headerTemplate.parentElement

    encabezados.forEach(x => {
      let header = headerTemplate.cloneNode()
      header.innerHTML = x
      header.id = x
      trHead.appendChild(header)
    })

    headerTemplate.remove()
  }

  function generarDatos(datos) {
    let trTemplate = document.getElementById(
      "depa_disponibilidad_template_tr"
    )
    let trEspacioTemplate = document.getElementById(
      "depa_disponibilidad_template_tr_espacio"
    )

    let tbody = trTemplate.parentElement

    datos.forEach(conjuntoDeDatos => {
      let tr = trTemplate.cloneNode()
      let trEspacio = trEspacioTemplate.cloneNode()

      conjuntoDeDatos.forEach(x => {
        let td = document.createElement("td")
        let tdEspacio = document.createElement("td")
        td.innerText = x
        tr.appendChild(td)
        trEspacio.appendChild(tdEspacio)
      })
      tbody.appendChild(tr)
      tbody.appendChild(trEspacio)
    })
  }

  function cargarDatos(datos) {
    let encabezados = [
      ["Nombre", "name" ]
      ["Categoría", "public_categ_ids" ]
      ["Num de cuartos","booking_rom_num" ]
      ["Piso", "booking_floor"]
      ["Área del departamento", "booking_area" ]
      ["Área del balcon", "booking_lookout_area"]
      ["Estado", "is_booking_type" ]
    ]
    
    

   
    generarEncabezado(encabezados.map(x=> x[0]))
            
    // $('#query').click(getProductBySKU);
    function getProductBySKU(){
       
        var model = 'product.template';
        // Use an empty array to search for all the records
        var domain = [];
        // Use an empty array to read all the fields of the records
        var fields = encabezados.map(x=>x[1]);
        var rpc = require('web.rpc');
        var res = rpc.query({
            model,
            method: 'search_read',
            args: [domain, []]
        }).then( (products)=> {
             
            // alert(products)
            console.log({products})
            // let campos = encabezados.map(x=>x[1])
            // let datos = products.map(product=>{
                
            //     let r = []
            //     campos.forEach(campo=>{
                    
            //         if(product.hasOwnProperty(campo))    
            //             r.push(product[campo])
            //         else r.push('')
                    
            //     })
                
            //     return r
            // })
            
           
            
            
            // generarDatos(datos)
    
        });
        };
        
        
    getProductBySKU()
    }

    docReady(cargarDatos)
  
   
  
});

