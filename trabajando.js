odoo.define("website.user_custom_code", function (require) {
  "use strict"

  require("web.dom_ready")

  const encabezados = [
    ["Nombre", "name"],
    ["Categoría", "public_categ_ids"],
    ["Num de cuartos", "booking_rom_num"],
    ["Piso", "booking_floor"],
    ["Área del departamento", "booking_area"],
    ["Área del balcon", "booking_lookout_area"],
    ["Estado", "is_booking_type"],
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

  function cargarDatos(datos) {
    let continuar = generarEncabezado(encabezados.map(x => x[0]))
    if (!continuar) return
    function getProductBySKU() {
      const model = "product.template"
      const method = "search_read"
      // Use an empty array to search for all the records
      const domain = []
      // Use an empty array to read all the fields of the records
      const fields = encabezados.map(x => x[1])
      const options = {
        model,
        method,
        args: [domain, fields],
      }
      const rpc = require("web.rpc")
      rpc
        .query(options)
        .then(products => {
          let campos = encabezados.map(x => x[1])
          let datos = products.map(product => {
            return campos.map(campo => {
              if (product.hasOwnProperty(campo)) return product[campo]
              return ""
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
