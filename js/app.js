class Producto {
    constructor(id,nombre, precio, tipo, stock, imagen,cantidad){
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.tipo = tipo;
        this.stock = stock; 
        this.imagen = imagen;
        this.pedido = cantidad || 0;
    }
}
//Declaro las variables

let listaCarrito = [];
let listaProductos = [];

const contenedorProductos = document.getElementById('contenedor-productos');
const contenedorCarrito = document.getElementById('carrito-contenedor');
const botonTerminar = document.getElementById('terminar')

const contadorCarrito = document.getElementById('contadorCarrito');
const precioTotal = document.getElementById('precioTotal');


$.getJSON('data/productos.json', function (data) {
    for(const bebidas of data){
        listaProductos.push(new Producto(bebidas.id, bebidas.nombre, bebidas.precio, bebidas.tipo, bebidas.stock, bebidas.imagen))
    }

    mostrarProductos(listaProductos)
})


//cargo las imagenes
function mostrarProductos(array){
   $('#contenedor-productos').empty();
    for (const producto of array) {
        $('#contenedor-productos').append(
            `<div class="col mb-5">
            <div class="card h-100">
                <img class="card-img-top" src=${producto.imagen} alt=${producto.nombre} />
                    <div class="card-body p-4">
                        <div class="text-center">        
                            <h5 class="fw-bolder">${producto.nombre}</h5>      
                            <div class="d-flex justify-content-center small text-warning mb-2">
                                <div class="bi-star-fill"></div>
                                <div class="bi-star-fill"></div>
                                <div class="bi-star-fill"></div>
                                <div class="bi-star-fill"></div>
                                <div class="bi-star-fill"></div>
                            </div>      
                            $${producto.precio}
                        </div>
                    </div>
                    <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                         
                         <button id=${producto.id} type="button" class="text-center btn btn-outline-dark mt-auto">Comprar</button>
                  
                    </div>
                </div>
            </div>`)
            // atrapo el evento click
            $(`#${producto.id}`).on('click', () => comprar(producto))
        }
    }

function comprar(cerveza){
    // controlo si hay stock
    const productoEncontrado = listaCarrito.find(el => el.id === cerveza.id)

    if(productoEncontrado){
        if (cerveza.stock > productoEncontrado.pedido){
            actualizarCarrito ();
            ejecutarCarrito(productoEncontrado);
        }else{
            alert('no hay mas stock');
        } 
    }else{
        actualizarCarrito ();
        ejecutarCarrito(cerveza);
    }
    remover()
}


function ejecutarCarrito(cerveza){
    const productoEncontrado = listaCarrito.find(el => el.id === cerveza.id)
    if(productoEncontrado){
        productoEncontrado.pedido++;
        document.getElementById(`cantidad${productoEncontrado.id}`).innerHTML = `<p id="cantidad${productoEncontrado.id}">cantidad: ${productoEncontrado.pedido}</p>`
        actualizarCarrito()
    }else{
        let producto = cerveza
        listaCarrito.push(producto);
        producto.pedido = 1;
        actualizarCarrito()
        mostrarCarrito(producto)
    }
    localStorage.setItem('listaCarrito',JSON.stringify(listaCarrito));
}

function mostrarCarrito(producto){
  let div = document.createElement('div')
  div.classList.add('productoEnCarrito')
  div.innerHTML = `<p>${producto.nombre}</p>
                  <p>Precio: ${producto.precio}</p>
                  <p id="cantidad${producto.id}">cantidad: ${producto.pedido}</p>
                  <button id="eliminar${producto.id}" class="boton-eliminar"><i class="fas fa-trash-alt"></i></button>`
  contenedorCarrito.appendChild(div)
}
// actualiza el total y cantidad
function  actualizarCarrito (){
    contadorCarrito.innerText = listaCarrito.reduce((acc, el)=> acc + el.pedido, 0);
    precioTotal.innerText = `Precio total: $ ${listaCarrito.reduce((acc,el)=> acc + (el.precio * el.pedido), 0)}`
}
// remover del carrito
function remover(){
    for(const producto of listaCarrito){
        let botonEliminar = document.getElementById(`eliminar${producto.id}`)
        botonEliminar.addEventListener('click', ()=>{
            botonEliminar.parentElement.remove()
            listaCarrito = listaCarrito.filter(prodE => prodE.id != producto.id)
            localStorage.setItem('listaCarrito',JSON.stringify(listaCarrito))
            actualizarCarrito()
        }) 
    }
}

// cargo el carrito en el Storage
function cargarLocalStorage(){
    let carro = JSON.parse(localStorage.getItem('listaCarrito'))
    if(carro){
        for(let i = 0; i < carro.length; i++){
            listaCarrito.push(new Producto(carro[i].id,carro[i].nombre, carro[i].precio, carro[i].tipo, carro[i].stock, carro[i].imagen, carro[i].pedido));
            actualizarCarrito()
            mostrarCarrito(listaCarrito[i]);
        }
    }
    remover();
}

cargarLocalStorage();



botonTerminar.innerHTML= `<button id="finalizar" class="btn btn-primary">Terminar</button>`
let botonCheckout = document.getElementById('finalizar')
//boton terminar
botonCheckout.addEventListener('click', ()=>{
    $.post('https://jsonplaceholder.typicode.com/posts', JSON.stringify(listaCarrito),function(respuesta, estado){
        if(estado){
            botonTerminar.style.display='none'
            contenedorCarrito.innerHTML = ""
            contenedorCarrito.innerHTML = `<h6>Su pedido ha sido procesado orden N° 354655SA4D54A</h6>`
            listaCarrito=[]
            localStorage.clear()
            actualizarCarrito()
            precioTotal.innerText=""
        }
    })
})