const db = firebase.firestore();

const avisoSesion = document.querySelector('#avisoSesion')
const tabla = document.querySelector('#tabla')
const catalogo = document.querySelector('#catalogo');
const productos = document.querySelector('#productos');
const footerTabla = document.querySelector('#footer-table');
const templateCard = document.querySelector('#template-card-glasses').content;
const fragment = document.createDocumentFragment();
const templateFooterTabla = document.querySelector('#template-carrito-footer').content;
const templateCarrito = document.querySelector('#template-carrito').content;
const menu = document.querySelector('#menu');

let carrito = {};
let listaModelos = []
let cliente

document.addEventListener('DOMContentLoaded', () =>{
    fetchData();
    if(localStorage.getItem('carrito')){
        carrito = JSON.parse(localStorage.getItem('carrito'));
        pintarCarrito();
    }
});


const loginCheck = user =>{
    if(user){
        cliente = user.email
        templateCard.querySelector('button').style.display = 'block';
        cerrarSesion.style.display = 'block';
        iniciarSesion.style.display = 'none'; 
        let referenciaUsuario = db.collection('usuarios').doc(user.email);
        referenciaUsuario.get().then((docSnapshot) => {
            if(docSnapshot.data().rol === "Administrador"){
            }
            else{
                menu.querySelector('#menuInventario').style.display = 'none'
            menu.querySelector('#menuPedidos').style.display = 'none'
            }
        })

    }
    else{
        avisoSesion.innerHTML = '<h2 id="avisoChild" >Inicia Sesión para llenar tu carrito</h2>'
        tabla.style.display = 'none';
        cerrarSesion.style.display = 'none';
        menu.querySelector('#menuInventario').style.display = 'none'
        menu.querySelector('#menuPedidos').style.display = 'none'
        iniciarSesion.style.display = 'block'; 
        templateCard.querySelector('button').style.display = 'none';
        fetchData();
        carrito = {};
        pintarCarrito()
    }
}

const onGetGafas = async (callback) => await db.collection('gafas').onSnapshot(callback);  

const fetchData = async () =>{
   try{
      await onGetGafas((data)=>{
          pintarTarjeta(data);
      }) 


   }catch(error){
        console.error(error);
   }
}

const pintarTarjeta = (querySnapshot) => {
    catalogo.innerHTML='';
    querySnapshot.forEach(doc => {

        templateCard.querySelector('img').setAttribute("src", doc.data().imagen);
        let precio = doc.data().precio;
        templateCard.querySelector('#precio').textContent = (new Intl.NumberFormat("es-MX").format(precio));

        templateCard.querySelector("#modelo").textContent = doc.data().modelo;

        templateCard.querySelector("#marca").textContent = doc.data().marca;

        templateCard.querySelector('button').dataset.id =doc.id;

        const clone = templateCard.cloneNode(true);
        fragment.appendChild(clone);
    })

    catalogo.appendChild(fragment);
 }

 const agregarCarrito = e => {
    if(e.target.classList.contains('btn-dark')){
        setCarrito(e.target.parentElement)
    }

    e.stopPropagation();
}

const setCarrito= objeto =>{
    const producto = {
        id: objeto.querySelector('button').dataset.id,
        modelo: objeto.querySelector('#modelo').textContent ,
        marca: objeto.querySelector('#marca').textContent,
        precio: objeto.querySelector('#precio').textContent,
        cantidad: 1
    }

    if(carrito.hasOwnProperty(producto.id)){
        producto.cantidad = carrito[producto.id].cantidad+1;
    }

    carrito[producto.id] = {...producto};
    pintarCarrito();
}

catalogo.addEventListener('click', e => {
    agregarCarrito(e);
});

productos.addEventListener('click', e =>{
    btnAccion(e);
})

const pintarCarrito = () =>{
    productos.innerHTML = '';
    Object.values(carrito).forEach(producto =>{
        templateCarrito.querySelector('th').textContent = producto.id;
        templateCarrito.querySelectorAll('td')[0].textContent = producto.modelo;
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
        templateCarrito.querySelector('#agregarProducto').dataset.id = producto.id;
        templateCarrito.querySelector('#eliminarProducto').dataset.id = producto.id;

        subtotalPrecio = (producto.cantidad * (producto.precio.replace(/,/g, ""))).toFixed(2);
        templateCarrito.querySelector('span').textContent = (new Intl.NumberFormat("es-MX").format(subtotalPrecio));

        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone);
    })

    productos.append(fragment);

    pintarFooterTabla ();
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

pintarFooterTabla = () => {
    footerTabla.innerHTML= ''
    if(Object.keys(carrito).length ===0 ){
        footerTabla.innerHTML= '<th scope="row" colspan="5">Carrito Vacio</th>';
    }

    else{
        const totalCantidad = Object.values(carrito).reduce((acum,{cantidad})=> acum+cantidad,0)
        
        const totalPrecio = Object.values(carrito).reduce((acum = 0, {cantidad,precio})=> (acum + (cantidad*(precio).replace(/,/g, ""))),0);

        let totalPrecioRed = totalPrecio.toFixed(2);

        templateFooterTabla.querySelectorAll('td')[0].textContent = totalCantidad;

        templateFooterTabla.querySelector('span').textContent = (new Intl.NumberFormat("es-MX").format(totalPrecioRed));

        const clone = templateFooterTabla.cloneNode(true);
        fragment.appendChild(clone);

        footerTabla.appendChild(fragment);

        const btnVaciar = document.querySelector('#vaciar-carrito');
        btnVaciar.addEventListener('click', ()=> {
            carrito = {};
            pintarCarrito();
        })
        const btnEnviar = document.querySelector('#enviarPedido')
        btnEnviar.addEventListener('click', ()=>{
            Object.values(carrito).forEach(producto =>{
                
                listaModelos.push(producto.modelo+" x "+producto.cantidad)
                //console.log(listaModelos)

            })

            db.collection('pedidos').doc().set({
                cliente: cliente,
                detalles: listaModelos,
                total: totalPrecioRed,
                estado: false
            })
            
            alert('Pedido Enviado')
            carrito= {}
            pintarCarrito();
        })
    }
}

const btnAccion = e =>{
    if(e.target.id === 'agregarProducto'){

        const productoCantidad = carrito[e.target.dataset.id];
        productoCantidad.cantidad++;

        carrito[e.target.dataset.id] = {...productoCantidad}

        pintarCarrito();
    }
    
    else if(e.target.id === 'eliminarProducto'){
        const productoCantidad = carrito[e.target.dataset.id];
        productoCantidad.cantidad--;

        if(productoCantidad.cantidad == 0){
            delete carrito[e.target.dataset.id]
        }
        pintarCarrito();
    }


    e.stopPropagation();
}

const iniciarSesion = document.querySelector('#iniciarSesion')
const cerrarSesion = document.querySelector('#cerrarSesion')
const auth = firebase.auth()

iniciarSesion.addEventListener('click', async (e) => {
    const proveedor = new firebase.auth.GoogleAuthProvider();

    await auth.signInWithRedirect(proveedor).then(result => {
        console.log(result);
    }).catch(err => {
        console.error(err);
    })
})

cerrarSesion.addEventListener('click', async (e) =>{
    

    try{
        await auth.signOut()
    }catch(err) {
        console.error(err)
    }
})


auth.onAuthStateChanged(user =>{
    if(user){
        loginCheck(user);
        let referenciaUsuario = db.collection('usuarios').doc(user.email)
        referenciaUsuario.get().then((docSnapshot) => {
            if(docSnapshot.exists){
                console.log(docSnapshot.data().rol)
            }
            else{
                const emailUsuario = user.email;
                const nombreUsuario = user.displayName;
                const rolUsuario = "Cliente"
                guardarUsuario(emailUsuario,nombreUsuario,rolUsuario);
            }
        })
    }
    else{
        loginCheck(user);
    }
})

const guardarUsuario = async (email,nombre,rol) =>{
    await db.collection('usuarios').doc(email).set({
        nombre,
        rol
    })
}