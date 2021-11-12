// odoo.define("website.user_custom_code", function (require) {
// ;("use strict")

// require("web.dom_ready")

//------------------------------
// TABLA
//------------------------------

//  [ ENCABEZADO_TABLA, CAMPO_ODOO, TRANSFORMACION ]
const accessoADatos = [
  { encabezado: "Nombre", campo: "name", transformacion: null },
  {
    encabezado: "Categoría",
    campo: "categ_id",
    transformacion: arregloDato => arregloDato[1],
  },
  {
    encabezado: "Num de cuartos",
    campo: "booking_rom_num",
    transformacion: null,
  },
  { encabezado: "Piso", campo: "booking_floor", transformacion: null },
  {
    encabezado: "Área del departamento",
    campo: "booking_area",
    transformacion: null,
  },
  {
    encabezado: "Área del balcon",
    campo: "booking_lookout_area",
    transformacion: numero => (numero ? numero : "N/A"),
  },
  {
    encabezado: "Estado",
    campo: "is_booking_type",
    transformacion: booleano => (booleano ? "Disponible" : "No disponible"),
  },
]

/**
 *Genera los encabezados y comprueba si debemos continuar
 *
 * @param {*} encabezados
 * @returns false si no se ha detectado el id indicado
 */
function generarEncabezado(encabezados) {
  let headerTemplate = document.getElementById(
    "depa_disponibilidad_template_head"
  )

  //Agregamos uno al principio y al final
  // para estilizar
  if (!headerTemplate) return false
  let trHead = headerTemplate.parentElement

  encabezados.forEach(x => {
    let header = headerTemplate.cloneNode()
    header.innerHTML = x
    header.id = x
    trHead.appendChild(header)
  })

  headerTemplate.remove()
  return true
}

function generarDatos(datos) {
  let trTemplate = document.getElementById("depa_disponibilidad_template_tr")
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

function generarTabla() {
  let continuar = generarEncabezado(accessoADatos.map(x => x.encabezado))
  if (!continuar) return
  function getProductBySKU() {
    const model = "product.template"
    const method = "search_read"
    // Use an empty array to search for all the records
    const domain = [["is_booking_type", "=", true]]
    // Use an empty array to read all the fields of the records
    const fields = accessoADatos.map(x => x.campo)
    const options = {
      model,
      method,
      args: [domain, fields],
    }
    const rpc = require("web.rpc")
    rpc
      .query(options)
      .then(products => {
        let datos = products.map(product => {
          return accessoADatos.map(accD => {
            if (product.hasOwnProperty(accD.campo)) {
              if (accD.transformacion) {
                //Los campos pupulados vienen en un arreglo de datos.
                //Si necesitamos más información, lo extraemos con el dato
                // que almacenamos en el arreglo de campos (TRANSFORMACION)
                return accD.transformacion(product[accD.campo])
              }
              return product[accD.campo]
            }
            return "CAMPO NO DISPOIBLE"
          })
        })

        generarDatos(datos)
      })
      .catch(err => console.error(err))
  }

  getProductBySKU()
}

//------------------------------
// CARRUSEL
//------------------------------

function generarCarrusel() {
  const refs = {
    carrusel_contenedor: ".carrusel_contenedor",
    carrusel_plantilla: "#carrusel_plantilla",
    carrusel_nombre: ".carrusel_nombre",
  }
  function construirCarrusel(XXdatos) {
    let contador = 0
    const datos = new Array(10).fill(null).map(x => {
      return {
        src: "https://barriotec-testweb-3531788.dev.odoo.com/web/image/574-a75ba442/DEPTO_702-B.png?deste=" + Math.random(),
        nombre: "DEPA" + contador++,
      }
    })

    let plantilla = $(refs.carrusel_plantilla)
    datos.forEach(dato => {
      let $nuevo = plantilla.clone()
      $nombre = $nuevo.find(refs.carrusel_nombre).text(dato.nombre)
      $nuevo
        .click(() => {
          console.log("Mostrar detalle: ", dato)
        })
        .removeAttr("id")
        .insertBefore(plantilla)
        .find("img")
        .attr("src", dato.src)
    })

    plantilla.remove()
  }

  function ejecutarCarrusel() {
    $(refs.carrusel_contenedor).slick({
      infinite: true,
      slidesToShow: 4,
      slidesToScroll: 4,
      autoplay: true,
      autoplaySpeed: 2000,

      responsive: [
        {
          breakpoint: 1400,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 4,
          },
        },

        {
          breakpoint: 1200,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
          },
        },
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    })
  }

  construirCarrusel(null)
  ejecutarCarrusel()
}

$(document).ready(() => {
  // generarTabla()

  //CARRUSEL

  ;[
    "//cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css",
    "//cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css",
  ].forEach(href => {
    $("<link/>", {
      rel: "stylesheet",
      type: "text/css",
      href,
    }).appendTo("head")
  })

  $.getScript(
    "//cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js",
    generarCarrusel
  )
})
// })
