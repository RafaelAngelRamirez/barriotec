$(document).ready(function () {
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
          src: "http://lorempixel.com/400/200/food",
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
          .attr("data-lazy", dato.src)
      })

      plantilla.remove()
    }

    function ejecutarCarrusel() {
      $(refs.carrusel_contenedor).slick({
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 4,
        lazyLoad: "ondemand",
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

  generarCarrusel()
})
