$(document).ready(function () {
  $(".carrusel_contenedor").slick({
    infinite: false,
    slidesToShow: 5,
    slidesToScroll: 5,
    lazyLoad: "ondemand",
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          // infinite: true,
          // dots: true,
        },
      },

      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          // infinite: true,
          // dots: true,
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
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ],
  })
  // const prefix = x => ".carrusel_contenido" + x
  // rotateSlides()
  // const interval = window.setInterval(() => rotateSlides(), 3000)

  // function rotateSlides() {
  //   console.log()
  //   const primero = $("#carrusel").find(prefix(":first"))

  //   console.log(primero)
  //   primero.css("background-color", "red")
  //   console.log(primero.css("background-color"))

  //   const width = primero.width()
  //   console.log(width)
  //   primero.animate({ marginLeft: -width }, 1000, animar(primero))
  // }

  // function animar(primero) {

  //     const ultimo = $("#carrusel").find(prefix(":last"))
  //     ultimo.after(primero)
  //     primero.css({ marginLeft: 0 })

  // }
})
