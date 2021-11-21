/**
 * version:  1.3.3 - Sat Nov 20 12:47:00 2021
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

const categoriaIdDepartamento = 4
const categoriaIdEstudio = 5

//Debe ser el nombre del paquete literal
const paquetesCard = ["BASIC", "GOLD", "ALL IN"]

/**
 * La categoria (Departamento, Estudio) es dínamico en función
 * del pathname
 */
let categoriaId = undefined
/**
 * La sección (Departamento, Estudio) es dínamico en función
 * del pathname. Sirve para generar los contenidos diferenciados.
 */
let seccion = null
switch (location.pathname) {
  case "/depas":
    seccion = 0
    categoriaId = categoriaIdDepartamento
    break
  case "/estudios":
    seccion = 1
    categoriaId = categoriaIdEstudio
    break

  default:
    throw "Seccion invalida " + location.pathname
    break
}

/**
 * las configuraciones de texto.
 * Deben respetar el orden. 0=depas, 1=estudios
 */
const CONFIGURACIONES = [
  {
    tipo: "string",
    match: "#tabla_titulo",
    textos: ["DEPAS", "ESTUDIOS"],
  },
  {
    tipo: "string",
    match: "#slide_titulo",
    textos: ["DEPAS", "ESTUDIOS"],
  },
  {
    tipo: "string",
    match: "#paquetes_titulo",
    textos: ["depa", "estudio"].map(x => "Elige tu " + x),
  },
].map(x => ({
  ...x,
  get texto() {
    return this.textos[seccion]
  },
}))

/**
 *
 * Consulta a la BD.
 * @param opciones = { domain: [], fields: [] id: string}
 *
 *
 */
const OPERACIONES = {
  getSkus: opciones => {
    opciones = {
      ...{
        domain: [
          ["is_booking_type", "=", true],
          //La categoria se toma dinamicamente del pathname
          ["categ_id", "=", categoriaId],
        ],
      },
      ...opciones,
    }
    const model = "product.template"
    const method = "search_read"
    const options = {
      model,
      method,
      args: [opciones.domain, opciones.fields],
    }

    return rpc.query(options)
  },

  getPlans: opciones => {
    opciones = {
      ...{ domain: [["id", "=", opciones.id]] },
      ...opciones,
    }
    const model = "pgmx.booking.product.plans"
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
      .catch(_ => console.log(_))
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
  async function mostrarDetalleDepa(datos) {
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
        planes: x.planes,
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
          paqueteConstruir(dato)
        })
        .removeAttr("id")
        .insertBefore(plantilla)
        .find("img")
        .attr("src", dato.src[0])
    })

    plantilla.remove()
  }

  /**
   *Construye y popula los datos de paquetes si existen
   *
   * @param {*} dato
   */
  function paqueteConstruir(dato) {
    //Si hay paquetes cargamos el contenedor.
    const hayPaquetes = datos?.paquetes?.length > 0
    if (!hayPaquetes) return

    $("#paquete_section").css("display", "unset")

    //Los id de los 3 elementos html para mostrar los paquetes.
    const ids = ["paquete_basic", "paquete_gold", "paquete_all_inn"]

    // TRES PAQUETES  - SE RESPESTA EL ORDEN [0,1,2] SEGUN POSICION HTML
    let contador = 0
    paquetesCard.forEach(paq => {
      paquete = dato.paquetes.find(p => p.plan_id[1] === paq)
      console.log("paquete selecciondo, ", paquete)

      const cardHTML = $("#" + ids[contador])
      cardHTML.find(".paquete_nombre").innerText(paquete.plan_id[1])
      cardHTML.find(".paquete_precio").innerText(paquete.price)
      cardHTML.find(".paquete_precio").click(() => {
        alert("no definido")
      })

      contador++
    })
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

  // CARGA DE DATOS

  if (debug) {
    construirSlide(null)
    ejecutarSlide()
  } else
    OPERACIONES.getSkus()
      .then(async skus => {
        let ids = skus
          .map(x => x.booking_plan_ids)
          .reduce((acumulator, current) => [...acumulator, ...current], [])

        let paquetes = await OPERACIONES.getPlans({ id: ids })
        skus = skus.map(sku => ({
          ...sku,
          paquetes: paquetes.filter(plan =>
            sku?.booking_plan_ids?.includes(plan.id)
          ),
        }))

        console.log("skus", skus)

        construirSlide(skus)
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

    //Textos generales
    CONFIGURACIONES.filter(x => (x.tipo = "string")).forEach(x => {
      $(x.match).text(x.texto)
    })
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
