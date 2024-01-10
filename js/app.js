function iniciarApp() {
  const selectCategoria = document.querySelector("#categorias");
  const resultado = document.querySelector("#resultado");
  const modal = new bootstrap.Modal("#modal", {});
  const resultadoDiv = document.querySelector(".favoritos");

  if (selectCategoria) {
    limpiarHTML(resultado);
    selectCategoria.addEventListener("change", seleccionarCategoria);
    obtenerCategoria();
  }
  if (resultadoDiv) {
    mostrarFavoritos();
  }

  function obtenerCategoria() {
    const url = "https://www.themealdb.com/api/json/v1/1/categories.php";
    fetch(url)
      .then((respuesta) => respuesta.json())
      .then((resultado) => mostrarCategorias(resultado.categories));
  }

  function mostrarCategorias(categorias) {
    categorias.forEach((categoria) => {
      const { strCategory } = categoria;
      const option = document.createElement("OPTION");
      option.value = strCategory;
      option.textContent = strCategory;

      selectCategoria.appendChild(option);
    });
  }

  function seleccionarCategoria(e) {
    const categoria = e.target.value;
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;

    fetch(url)
      .then((respuesta) => respuesta.json())
      .then((resultado) => mostrarRecetas(resultado.meals));
  }

  function mostrarRecetas(recetas = []) {
    limpiarHTML(resultado);
    recetas.forEach((receta) => {
      // console.log(receta);
      const { strMeal, idMeal, strMealThumb } = receta;

      const recetaContenedor = document.createElement("DIV");
      recetaContenedor.classList.add("col-md-4");

      const recetaCard = document.createElement("DIV");
      recetaCard.classList.add("card", "mb-4");

      const recetaImagen = document.createElement("IMG");
      recetaImagen.classList.add("card-img-top");
      recetaImagen.alt = `Receta: ${strMeal ?? receta.titulo}`;
      recetaImagen.src = strMealThumb ?? receta.img;

      const recetaCardBody = document.createElement("DIV");
      recetaCardBody.classList.add("card-body");

      const recetaHeading = document.createElement("H3");
      recetaHeading.classList.add("card-title", "mb-3");
      recetaHeading.textContent = strMeal ?? receta.titulo;

      const recetaButton = document.createElement("BUTTON");
      recetaButton.classList.add("btn", "btn-danger", "w-100");
      recetaButton.textContent = "Ver Receta";
      recetaButton.onclick = () => {
        obtenerReceta(idMeal ?? receta.id);
        modal.show();
      };
      recetaCardBody.appendChild(recetaHeading);
      recetaCardBody.appendChild(recetaButton);

      recetaCard.appendChild(recetaImagen);
      recetaCard.appendChild(recetaCardBody);

      recetaContenedor.appendChild(recetaCard);

      resultado.appendChild(recetaContenedor);
    });
  }

  function obtenerReceta(id) {
    const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    fetch(url)
      .then((resultado) => resultado.json())
      .then((respuesta) => mostrarReceta(respuesta.meals[0]));
  }

  function mostrarReceta(receta) {
    // console.log(receta);
    const { idMeal, strMeal, strMealThumb, strInstructions } = receta;

    const modalHeading = document.querySelector(".modal .modal-title");
    const modalBody = document.querySelector(".modal .modal-body");

    modalHeading.textContent = strMeal;
    modalBody.innerHTML = `
      <img class="img-fluid" src="${strMealThumb}"></img> 
      <h3 class="my-3">Instructions</h3> 
      <p>${strInstructions}</p> 
      <h3 class="my-3">Ingredients and Quantities</h3>
      `;

    const listGroup = document.createElement("UL");
    listGroup.classList.add("list-group");

    for (let i = 1; i <= 20; i++) {
      if (receta[`strIngredient${i}`]) {
        const ingredientes = receta[`strIngredient${i}`];
        const cantidades = receta[`strMeasure${i}`];

        const ingredientesLi = document.createElement("LI");
        ingredientesLi.classList.add("list-group-item");
        ingredientesLi.textContent = `${ingredientes} - ${cantidades}`;

        listGroup.appendChild(ingredientesLi);
      }
    }

    modalBody.appendChild(listGroup);

    const modalFooter = document.querySelector(".modal .modal-footer");
    limpiarHTML(modalFooter);

    const btnFavorito = document.createElement("BUTTON");
    btnFavorito.classList.add("btn", "btn-danger", "col");
    btnFavorito.textContent = exiteStorage(idMeal)
      ? "Eliminar Favorito"
      : "Guardar Favorito";
    btnFavorito.onclick = () => {
      if (exiteStorage(idMeal)) {
        btnFavorito.textContent = "Guardar Favorito";
        eliminarReceta(idMeal);
        mostrarToast("Eliminado Correctamente");
        return;
      }
      agregarReceta({
        id: idMeal,
        titulo: strMeal,
        img: strMealThumb,
      });
      btnFavorito.textContent = "Eliminar Favorito";
      mostrarToast("Agregado Correctamente");
    };

    const btnCerrar = document.createElement("BUTTON");
    btnCerrar.classList.add("btn", "btn-secondary", "col");
    btnCerrar.textContent = "Cerrar";
    btnCerrar.onclick = () => {
      modal.hide();
    };

    modalFooter.appendChild(btnFavorito);
    modalFooter.appendChild(btnCerrar);
  }

  function exiteStorage(id) {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
    return favoritos.some((favorito) => favorito.id === id);
  }

  function eliminarReceta(id) {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
    const eliminarFavorito = favoritos.filter((favorito) => favorito.id !== id);
    localStorage.setItem("favoritos", JSON.stringify(eliminarFavorito));
  }

  function agregarReceta(receta) {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
    localStorage.setItem("favoritos", JSON.stringify([...favoritos, receta]));
  }

  function mostrarToast(mensaje) {
    const toastDiv = document.querySelector("#toast");
    const toastBody = document.querySelector(".toast-body");
    const toast = new bootstrap.Toast(toastDiv);

    toastBody.textContent = mensaje;

    toast.show();
  }

  function mostrarFavoritos() {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];

    if (favoritos.length) {
      mostrarRecetas(favoritos);
      return;
    }

    const noFavoritos = document.createElement("P");
    noFavoritos.classList.add("fs-4", "text-center", "font-bold", "mt-5");
    noFavoritos.textContent = "No hay favoritos aún";

    resultadoDiv.appendChild(noFavoritos);
  }

  function limpiarHTML(generador) {
    while (generador.firstChild) {
      generador.removeChild(generador.firstChild);
    }
  }
}
document.addEventListener("DOMContentLoaded", iniciarApp);
