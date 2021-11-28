/**
 * version:  1.5.1 - Sat Nov 27 17:18:45 2021
 */

//------------------------------
// GLOBALES
//------------------------------

/**
 * Para pruebas en dev
 */
let debug = false

// const categoriaIdDepartamento = 4
// const categoriaIdEstudio = 5
const categoriaIdDepartamento = 4
const categoriaIdEstudio = 5

const BD = "barriotec-testweb-3531788"
const DOMINIO = "https://barriotec-testweb-3531788.dev.odoo.com/"
const API = path => `${DOMINIO}barriotec/${path}?db=${BD}`

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
    // throw "Seccion invalida " + location.pathname
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
const SERVICE = {
  getSkus: () =>
    new Promise((resolve, reject) => {
      $.get(
        API("skus/" + categoriaId),
        {},
        function (data, textStatus, jqXHR) {
          resolve(data.skus)
        },
        "json"
      )
    }),

  getPlans: opciones =>
    new Promise((resolve, reject) => {
      $.get(
        API("plans/" + opciones.id.join("-")),
        {},
        function (data, textStatus, jqXHR) {
          resolve(data.plans)
        },
        "json"
      )
    }),

  getImages: opciones =>
    new Promise((resolve, reject) => {
      $.get(
        API("imagenes/" + opciones.id.join("-")),
        {},
        function (data, textStatus, jqXHR) {
          resolve(data.imagenes)
        },
        "json"
      )
    }),
}

const base64 = i => (!debug ? `data:image/png;base64, ${i}` : i)
const ran = () => Math.round(Math.random() * 4) + 4

//------------------------------
// TABLA
//------------------------------

//  [ ENCABEZADO_TABLA, CAMPO_ODOO, TRANSFORMACION ]
const accessoADatos = [
  { encabezado: "Nombre", campo: "name", transformacion: null },
  {
    encabezado: "Categoría",
    campo: "categ_id",
    transformacion: arregloDato => {
      return arregloDato[0]
    },
  },
  {
    encabezado: "Cuartos",
    campo: "booking_rom_num",
    transformacion: null,
  },
  { encabezado: "Piso", campo: "booking_floor", transformacion: null },
  {
    encabezado: "Área",
    campo: "booking_area",
    transformacion: null,
  },
  {
    encabezado: "Balcón",
    campo: "booking_lookout_area",
    transformacion: numero => (numero ? numero : "N/A"),
  },
  {
    encabezado: "Estado",
    campo: "is_booking_type",
    transformacion: booleano => (booleano ? "Disponible" : "No disponible"),
  },

  //Debe ser el ultimo en el arreglo de datos para asignarlo como
  // evento en la tabla. Usamos pop para obtenerlo.
  {
    encabezado: "web_site",
    campo: "website_url",
    transformacion: null,
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

  //Eliminamos el ultimo encabezado que es la url
  encabezados.pop()
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
    // let trEspacio = trEspacioTemplate.cloneNode()
    let url = conjuntoDeDatos.pop()

    conjuntoDeDatos.forEach(datoColumna => {
      let td = document.createElement("td")
      let tdEspacio = document.createElement("td")
      td.innerText = datoColumna
      tr.appendChild(td)
      // trEspacio.appendChild(tdEspacio)
    })
    // Evento para booking
    tr.classList.add("pointer")
    tr.addEventListener("click", () => (window.location.href = url))

    tbody.appendChild(tr)
    // tbody.appendChild(trEspacio)
  })
}

function generarTabla() {
  let continuar = generarEncabezado(accessoADatos.map(x => x.encabezado))
  if (!continuar) return

  SERVICE.getSkus()
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
    .catch(_ => console.error(_))
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

    $(".depa_detalle_container").collapse("show")

    let padreT = $("#depa_detalle_template")
    let template = $("#depa_detalle_template:first-child").clone()
    $("#depa_detalle_template").empty()

    let contenedorMedia = new Array(5).fill(null).map(x => ({
      image_1024: `http://lorempixel.com/${ran()}00/${ran()}00/people/` + ran(),
      embed_code: `<iframe
      class="embed-responsive-item"
      src="//www.youtube.com/embed/Mw-voVnKtcA?rel=0"
      allowfullscreen="true"
      frameborder="0"
      ></iframe
      >`,
    }))
    if (!debug)
      contenedorMedia = await SERVICE.getImages({
        id: datos.imagenes,
      })

    $("#depa_detalle_template").find(".lds-ripple").remove()

    datos = {
      ...datos,
      src: [
        ...datos.src,
        ...contenedorMedia.map(media => media.image_1024),
      ].filter(x => x),
      videos: contenedorMedia.map(media => media.video).filter(x => x),
    }

    datos.src.forEach(src => {
      let nuevo = template.clone()
      nuevo.find("img").attr("src", src)
      nuevo.insertBefore(padreT)
    })

    datos.videos.forEach(video => {
      let nuevo = template.clone()
      let padre = nuevo.find("img").parent()
      padre.append(video)
      nuevo.find("img").remove()
      nuevo.insertBefore(padreT)
    })

    template.remove()

    $("#depa_detalle_galeria").slick({
      fade: false,
      autoplay: true,
      dots: true,
      pauseOnHover: true,
      pauseOnFocus: true,
    })
    $("#depa_detalle_galeria").find(".lds-ripple").remove()
    // PLANO
    $(".depa_detalle_plano_img").find("img").attr("src", datos.plano)
    $(".depa_detalle_plano_img").find(".lds-ripple").remove()
  }

  /**
   *Genera las etiquetas html con los datos que se le
   * pasen como parametros
   *
   * @param {*} datosDebug
   */
  function construirSlide(dataCruda) {
    let datos = []

    if (debug) datos = generarDataDePruebas()
    // Transformamos los datos desde BD
    else
      datos = dataCruda?.map(x => {
        return {
          nombre: x.name,
          //Este debe ser un arreglo de imagenes
          src: [x.image_1024],
          imagenes: x.imagenes,
          descripcion: x.description ?? "",
          // Este es un array
          precio: x.list_price,
          area_depa: x.booking_area,
          area_balcon: x.booking_lookout_area,
          cuartos: x.booking_rom_num,
          plano: x.extra_image_data_uri,
          planes: x.planes,
          paquetes: x.paquetes,
          website_url: x.website_url,
        }
      })

    let plantilla = $(refs.carrusel_plantilla)
    plantilla.find(".lds-ripple").remove()
    datos.forEach(dato => {
      let $nuevo = plantilla.clone()
      $nombre = $nuevo.find(refs.carrusel_nombre).text(dato.nombre)
      $nuevo
        .click(() => {
          mostrarDetalleDepa(dato)
          paqueteConstruir(dato)
          $(".depa_detalle_container").collapse("show")
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
    const hayPaquetes = dato?.paquetes?.length > 0
    if (!hayPaquetes) return

    $("#paquete_section").css("display", "block")

    //Los id de los 3 elementos html para mostrar los paquetes.
    const ids = ["paquete_basic", "paquete_gold", "paquete_all_inn"]

    // TRES PAQUETES  - SE RESPESTA EL ORDEN [0,1,2] SEGUN POSICION HTML
    let contador = 0
    paquetesCard.forEach(paq => {
      paquete = dato.paquetes.find(p => p.name === paq)
      const cardHTML = $("#" + ids[contador])

      if (paquete) {
        cardHTML.find(".paquete_nombre").text(paquete.name)
        cardHTML.find(".paquete_precio").text(paquete.price)

        //DESCRIPTION ===

        $descripcion = cardHTML.find(".card-text.description")
        $descripcion.empty()

        paquete.description
          .replace("<p>", "")
          .replace("</p>", "")
          .split(",")
          .map(x => x.trim())
          .forEach(texto => {
            let t = `<p>${texto}</p>`
            $descripcion.append(t, document.createElement("hr"))
          })

        $(".paquete_accion").click(
          () => (window.location.href = dato.website_url)
        )
      }
      //Ocultamos el paquete si no esta definido
      else cardHTML.css("display", "none")

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
    SERVICE.getSkus()
      .then(async skus => {
        let ids = skus
          .map(x => x.booking_plan_ids)
          .reduce((acumulator, current) => [...acumulator, ...current], [])

        let paquetes = await SERVICE.getPlans({ id: ids })
        skus = skus.map(sku => ({
          ...sku,
          paquetes: paquetes.filter(plan =>
            sku?.booking_plan_ids?.includes(plan.id)
          ),
          imagenes: sku?.product_template_image_ids,
        }))

        //product_template_image_ids []

        construirSlide(skus)
        ejecutarSlide()
      })
      .catch(_ => console.error(_))
}

function generarDataDePruebas() {
  let contador = 0
  let dataDePrueba = new Array(10).fill(null).map(x => {
    contador++
    return {
      src: new Array(5)
        .fill(null)
        .map(
          x => `http://lorempixel.com/${ran()}00/${ran()}00/people/` + ran()
        ),
      videos: [
        `<iframe
              class="embed-responsive-item"
              src="//www.youtube.com/embed/Mw-voVnKtcA?rel=0"
              allowfullscreen="true"
              frameborder="0"
            ></iframe
            >`,
      ],
      nombre: "DEPA" + contador,
      descripcion: `Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Exercitationem alias, sunt velit eligendi mollitia libero
                  laudantium a quos. Tempora quam repellat adipisci quis iure
                  doloribus facilis deleniti architecto quas repellendus!`,
      precio: "99999.99",
      area_depa: "999",
      area_balcon: "999",
      cuartos: "999",
      plano: `http://lorempixel.com/${ran()}00/${ran()}00/people/` + ran(),
      paquetes: [
        {
          id: 3,
          product_id: [6, "Depa 201"],
          plan_id: [1, "BASIC"],
          price: 200,
          display_name: "pgmx.booking.product.plans,3",
          create_uid: [2, "Mitchell Admin"],
          create_date: "2021-09-27 21:20:31",
          write_uid: [2, "Mitchell Admin"],
          write_date: "2021-09-27 21:20:31",
          __last_update: "2021-09-27 21:20:31",
        },
        {
          id: 3,
          product_id: [6, "Depa 201"],
          plan_id: [1, "GOLD"],
          price: 200,
          display_name: "pgmx.booking.product.plans,3",
          create_uid: [2, "Mitchell Admin"],
          create_date: "2021-09-27 21:20:31",
          write_uid: [2, "Mitchell Admin"],
          write_date: "2021-09-27 21:20:31",
          __last_update: "2021-09-27 21:20:31",
        },
        {
          id: 4,
          product_id: [6, "Depa 201"],
          plan_id: [2, "ALL IN"],
          price: 1000,
          display_name: "pgmx.booking.product.plans,4",
          create_uid: [2, "Mitchell Admin"],
          create_date: "2021-09-27 21:20:31",
          write_uid: [2, "Mitchell Admin"],
          write_date: "2021-09-27 21:20:31",
          __last_update: "2021-09-27 21:20:31",
        },
      ],
      website_url: "algunaURL_" + contador,
    }
  })
  return dataDePrueba
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
  ;[
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet"></link>',
  ].forEach(link => {
    $(link).appendTo("head")
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
    document_ready()
  })
