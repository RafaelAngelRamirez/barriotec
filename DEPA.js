/** 
 * version:  1.2.11 - Fri Nov 19 13:55:11 2021
*/

//------------------------------
// GLOBALES
//------------------------------
/**
 * En modo producción almacena el resutlado de require('web.rpc')
 */
let rpc = null

/**
 * Para pruebas en dev
 */
let debug =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"

const OPT = {
  /** Los campos que se quieren traer */
  fields: [],
  /** Filtros de busqueda */
  domain: [["is_booking_type", "=", true]],
}

const OPERACIONES = {
  getSkus: (opciones = OPT) => {
    opciones = { ...OPT, ...opciones }
    const model = "product.template"
    const method = "search_read"
    const options = {
      model,
      method,
      args: [opciones.domain, opciones.fields],
    }

    return rpc.query(options)
  },
}

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

  if (debug) {
    console.error("[ WARNING ] Estas en modo debug!")
    const dummyData = [
      ["DEPA 301", "Departamento", "3", "1", "23", "2", "Disponible"],
      ["Depa 101", "Departamento", "2", "1", "80", "N/A", "Disponible"],
      ["Depa 201", "Departamento", "2", "2", "100", "6", "Disponible"],
    ]
    generarDatos(dummyData)
  } else
    OPERACIONES.getSkus()
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
            return "CAMPO NO DISPONIBLE"
          })
        })

        generarDatos(datos)
      })
      .catch(_ => next(_))
}

//------------------------------
// CARRUSEL
//------------------------------

function inicializarSlide() {
  const refs = {
    carrusel_contenedor: ".carrusel_contenedor",
    carrusel_plantilla: "#carrusel_plantilla",
    carrusel_nombre: ".carrusel_nombre",
  }

  /**
   *Construye y muestra los detalle del depa.
   *
   * @param {*} datos
   */
  function mostrarDetalleDepa(datos) {
    $("#depa_detalle_nombre").text(datos.nombre)
    $("#depa_detalle_descripcion").text(datos.descripcion)
    $("#depa_detalle_img").attr("src", datos.src[0])
    $("#depa_detalle_precio").text(datos.precio)
    $("#depa_detalle_area_depa").text(datos.area_depa)
    $("#depa_detalle_area_balcon").text(datos.area_balcon)
    $("#depa_detalle_cuartos").text(datos.cuartos)

    // GALERIA

    try {
      $("#depa_detalle_galeria").slick("unslick")
    } catch (error) {}

    $(".depa_detalle_container").removeClass("collapse").addClass("show")

    let padreT = $("#depa_detalle_template")
    let template = $("#depa_detalle_template:first-child").clone()
    $("#depa_detalle_template").empty()

    datos.src.forEach(src => {
      let nuevo = template.clone()
      nuevo.find("img").attr("src", src)
      nuevo.insertBefore(padreT)
    })

    template.remove()

    $("#depa_detalle_galeria").slick({
      fade: true,
      autoplay: true,
      dots: true,
    })

    // PLANO
    $(".depa_detalle_plano_img").find("img").attr("src", datos.plano)
  }

  /**
   *Genera las etiquetas html con los datos que se le
   * pasen como parametros
   *
   * @param {*} datosDebug
   */
  function construirSlide(dataCruda) {
    console.log({debug, dataCruda  })

    let datos = dataCruda?.map(x => {
      return {
        nombre: x.name,
        //Este debe ser un arreglo de imagenes
        src: [x.image_1024].map(i => `data:image/png;base64, ${i}`),
        descripcion: x.description ?? "",
        // Este es un array
        precio: `${x.cost_currency_id.pop()} ${x.cost_currency_id.pop()}`,
        area_depa: x.booking_area,
        area_balcon: x.booking_lookout_area,
        cuartos: x.booking_rom_num,
        plano: x.extra_image_data_uri,
      }
    })

    if (debug) {
      let contador = 0
      const ran = () => Math.round(Math.random() * 4) + 4
      datos = new Array(10).fill(null).map(x => {
        return {
          src: new Array(5)
            .fill(null)
            .map(
              x => `http://lorempixel.com/${ran()}00/${ran()}00/people/` + ran()
            ),
          nombre: "DEPA" + contador++,
          descripcion: `Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Exercitationem alias, sunt velit eligendi mollitia libero
                laudantium a quos. Tempora quam repellat adipisci quis iure
                doloribus facilis deleniti architecto quas repellendus!`,
          precio: "99999.99",
          area_depa: "999",
          area_balcon: "999",
          cuartos: "999",
          plano: `http://lorempixel.com/${ran()}00/${ran()}00/people/` + ran(),
        }
      })
    }

    let plantilla = $(refs.carrusel_plantilla)
    datos.forEach(dato => {
      let $nuevo = plantilla.clone()
      $nombre = $nuevo.find(refs.carrusel_nombre).text(dato.nombre)
      $nuevo
        .click(() => {
          $(".depa_detalle_container").removeClass("show").addClass("collapse")
          mostrarDetalleDepa(dato)
        })
        .removeAttr("id")
        .insertBefore(plantilla)
        .find("img")
        .attr("src", dato.src[0])
    })

    plantilla.remove()
  }

  /**
   *Crea las animaciones del slide y lo activa despues
   * de construidos los datos.
   *
   */
  function ejecutarSlide() {
    $(refs.carrusel_contenedor).slick({
      // infinite: true,
      slidesToShow: 4,
      slidesToScroll: 4,
      autoplay: true,
      autoplaySpeed: 2000,
      dots: true,

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

  if (debug) {
    construirSlide(null)
    ejecutarSlide()
  } else
    OPERACIONES.getSkus()
      .then(respuesta => {
        construirSlide(respuesta)
        ejecutarSlide()
      })
      .catch(_ => console.error(_))
}

/**
 *Carga los plugins e inicia la genracion del carrusel.
 *
 */
function scriptsEInicializacion() {
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
    () => inicializarSlide()
  )
}

function document_ready() {
  $(document).ready(() => {
    generarTabla()
    scriptsEInicializacion()
  })
}

// -----------------------------
// CONFIGURACIONES Y PREPARACIONES
// -----------------------------

if (debug) document_ready()
else
  odoo.define("website.user_custom_code", function (require) {
    ;("use strict")

    require("web.dom_ready")
    rpc = require("web.rpc")
    document_ready()
  })

// odoo.define("website.user_custom_code", function (require) {
//   ;("use strict")

//   require("web.dom_ready")
//   rpc = require("web.rpc")
//   const model = "product.template"
//   const method = "search_read"
//   // Use an empty array to search for all the records
//   const domain = []
//   // Use an empty array to read all the fields of the records
//   const fields = [] //accessoADatos.map(x => x.campo)
//   const options = {
//     model,
//     method,
//     args: [domain, fields],
//   }

//   rpc
//     .query(options)
//     .then(products => console.log(products))
//     .catch(err => console.error(err))
// })
