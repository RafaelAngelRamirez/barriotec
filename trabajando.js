odoo.define("website.user_custom_code", function (require) {
  "use strict"

  require("web.dom_ready")

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
      transformacion: null,
    },
    {
      encabezado: "Estado",
      campo: "is_booking_type",
      transformacion: booleano => (booleano ? "Disponible" : "No disponible"),
    },
  ]

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

  function cargarDatos() {
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

  docReady(cargarDatos)
})
