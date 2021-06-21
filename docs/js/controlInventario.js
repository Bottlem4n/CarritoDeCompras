const auth = firebase.auth()
const db = firebase.firestore()
const storage = firebase.storage()

const cerrarSesion = document.querySelector('#cerrarSesion')

const modalC = document.querySelector('.modal-container')
const cerrarModal = document.querySelector('#cerrarModal')

const inventario = document.querySelector('#listaInventario')
const templateInventario = document.querySelector('#template-inventario').content
const fragment = document.createDocumentFragment();

const abrirFormularioAgregar = document.querySelector('#agregarNuevo')
const modalCAgregar = document.querySelector('.modal-container-agregar')

const modalEditar = document.querySelector('.modal-container-editar')
const formularioEditar = document.querySelector('#formularioEditar')


cerrarSesion.addEventListener('click', async (e) =>{
    try{
        await auth.signOut()
        location.href="index.html";
    }catch(err) {
        console.error(err)
    }
})

function abrirModal(){
    inventario.style.visibility = "hidden"
    modalC.style.opacity = "1"
    modalC.style.visibility = "visible"
}

cerrarModal.addEventListener('click', e =>{
    location.href="index.html"
})



auth.onAuthStateChanged(user =>{
    if(user){
        loginCheck(user);
    }
    else{
        abrirModal();
    }

})

function resetInventario(){
    inventario.innerHTML=''
}

const loginCheck = user =>{
    
    if(user){    
        let referenciaUsuario = db.collection('usuarios').doc(user.email);
        referenciaUsuario.get().then((docSnapshot) => {
            if(docSnapshot.data().rol === "Administrador"){
                console.log('Bienvenido Admin')
            }
            else if(docSnapshot.data().rol === "Cliente"){
                console.log('Bienvenido Cliente')
                inventario.innerHTML=''
                abrirModal()
            }
        })
    }
}

document.addEventListener('DOMContentLoaded', () =>{
    fetchData();
})

const onGetGafas = async (callback) => await db.collection('gafas').onSnapshot(callback);  

const fetchData = async () =>{
    try{
       await onGetGafas((data)=>{
           pintarInventario(data);
       }) 
 
 
    }catch(error){
         console.error(error);
    }
 } 


const pintarInventario = (querySnapshot) =>{
    inventario.innerHTML= ''
    querySnapshot.forEach(doc => {

        templateInventario.querySelector('#clave').textContent = doc.id
        templateInventario.querySelector('#imagen').setAttribute("src", doc.data().imagen)
        templateInventario.querySelector('#modelo').textContent = doc.data().modelo
        templateInventario.querySelector('#marca').textContent = doc.data().marca
        let precio = doc.data().precio
        templateInventario.querySelector('#precio').textContent = (new Intl.NumberFormat("es-MX").format(precio))

        templateInventario.querySelector('#editarProducto').dataset.id = doc.id
        templateInventario.querySelector('#editarProducto').dataset.name = doc.data().modelo
        templateInventario.querySelector('#eliminarProducto').dataset.id = doc.id
        templateInventario.querySelector('#eliminarProducto').dataset.name = doc.data().modelo

        const clone = templateInventario.cloneNode(true)
        fragment.appendChild(clone)
    })

    inventario.appendChild(fragment)
}

async function guardarProducto () {
    let imagenI = formularioAgregar.querySelector('#subirImagenProducto').files[0]
    let modelo = formularioAgregar.querySelector('#modeloProducto').value
    let marca = formularioAgregar.querySelector('#marcaProducto').value
    let precio = formularioAgregar.querySelector('#precioProducto').value 


    imagen = await obtenerURL(imagenI,modelo);

    await db.collection('gafas').doc().set({
        imagen,
        marca,
        modelo,
        precio
    })
    
    alert('Producto Guardado')
    modalCAgregar.style.opacity = "0"
    modalCAgregar.style.visibility = "hidden"
}


async function subirImagen(imagen, modelo) {
   await storage.ref(`productos/${modelo}`).put(imagen)
}

async function obtenerURL(imagen,modelo){
    const ref = await storage.ref(`productos/${modelo}`)
    await subirImagen(imagen,modelo);
    url = await ref.getDownloadURL()

    return url
}


abrirFormularioAgregar.addEventListener('click', e => {
    modalCAgregar.style.opacity = "1"
    modalCAgregar.style.visibility = "visible"
})

function cerrarFormularioAgregar(){
    modalCAgregar.style.opacity = "0"
    modalCAgregar.style.visibility = "hidden"
}

inventario.addEventListener('click', e =>{
    btnAccion(e);
})

const deleteProducto = (id) => db.collection('gafas').doc(id).delete()
const deleteProductoImg = (nombre) => storage.ref(`productos/${nombre}`).delete()

const getGafas = async (id) => await db.collection('gafas').doc(id).get()
const updateProducto = (id, updateG) => db.collection('gafas').doc(id).update(updateG)



const btnAccion = async e =>{
    if(e.target.id === 'editarProducto'){

        modalEditar.style.opacity = "1"
        modalEditar.style.visibility = "visible"


        idProducto = e.target.dataset.id


        let producto = await getGafas(idProducto)
        formularioEditar.querySelector('#claveProducto').value = producto.id
        formularioEditar.querySelector('#modeloProducto').value = producto.data().modelo
        formularioEditar.querySelector('#marcaProducto').value = producto.data().marca
        formularioEditar.querySelector('#precioProducto').value = producto.data().precio

        //console.log(modeloNuevo, marcaNueva, precioNuevo)
    }

    
    
    else if(e.target.id === 'eliminarProducto'){
        deleteProducto(e.target.dataset.id)
        deleteProductoImg(e.target.dataset.name)
        console.log(e.target.dataset.id)
        console.log(e.target.dataset.name)
    }


    e.stopPropagation();
}

function cerrarFormularioActualizar(){
    modalEditar.style.opacity = "0"
    modalEditar.style.visibility = "hidden"
}

async function actualizarProducto(){
    const clave = formularioEditar.querySelector('#claveProducto').value
    const modeloNuevo = formularioEditar.querySelector('#modeloProducto').value
    const marcaNueva = formularioEditar.querySelector('#marcaProducto').value
    const precioNuevo = formularioEditar.querySelector('#precioProducto').value

     await updateProducto(clave, {
        modelo: modeloNuevo,
        marca: marcaNueva,
        precio: precioNuevo
    })

    alert('Producto Actualizado')
    modalEditar.style.opacity = "0"
    modalEditar.style.visibility = "hidden"
}