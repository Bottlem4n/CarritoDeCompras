const auth = firebase.auth()
const db = firebase.firestore()

const cerrarSesion = document.querySelector('#cerrarSesion')

const modalC = document.querySelector('.modal-container')
const cerrarModal = document.querySelector('#cerrarModal')

const pedidos = document.querySelector('#listaPedidos')
const templatePedido = document.querySelector('#template-pedido').content
const fragment = document.createDocumentFragment();

cerrarSesion.addEventListener('click', async (e) =>{
    try{
        await auth.signOut()
        location.href="index.html";
    }catch(err) {
        console.error(err)
    }
})

function abrirModal(){
    pedidos.style.visibility = "hidden"
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
        pedidos.innerHTML=''
        console.log('Bienvenido Extraño')
        abrirModal();
    }

})

const loginCheck = user =>{
    
    if(user){    
        let referenciaUsuario = db.collection('usuarios').doc(user.email);
        referenciaUsuario.get().then((docSnapshot) => {
            if(docSnapshot.data().rol === "Administrador"){
                console.log('Bienvenido Admin')
            }
            else if(docSnapshot.data().rol === "Cliente"){
                console.log('Bienvenido Cliente')
                pedidos.innerHTML= ''
                abrirModal()
            }
        })
    }
}

document.addEventListener('DOMContentLoaded', () =>{
    fetchData();
})

const onGetPedidos = async (callback) => await db.collection('pedidos').onSnapshot(callback);  

const fetchData = async () =>{
    try{
       await onGetPedidos((data)=>{
           pintarPedido(data);
       }) 
 
 
    }catch(error){
         console.error(error);
    }
 } 


 const pintarPedido = (querySnapshot) =>{
    pedidos.innerHTML= ''
    querySnapshot.forEach(doc => {

        templatePedido.querySelector('#clave').textContent= doc.id
        templatePedido.querySelector('#cliente').textContent = doc.data().cliente
        templatePedido.querySelector('#detalles').textContent = doc.data().detalles
        templatePedido.querySelector('#total').textContent = doc.data().total
        let vEstado
        if(doc.data().estado === true){
            vEstado = "Entregado"
        }
        else{
            vEstado = "Por Entregar"
        }

        templatePedido.querySelector('#estado').textContent = vEstado

        templatePedido.querySelector('#entregarPedido').dataset.id = doc.id
        templatePedido.querySelector('#cancelarPedido').dataset.id = doc.id

        const clone = templatePedido.cloneNode(true)
        fragment.appendChild(clone)
    })

    pedidos.appendChild(fragment)
}

pedidos.addEventListener('click', e =>{
    btnAccion(e);
})

const updateProducto = (id, updateG) => db.collection('pedidos').doc(id).update(updateG)

const btnAccion = async e =>{
    if(e.target.id === 'entregarPedido'){

        clavePedido = e.target.dataset.id
        nuevoEstado = true

        await updateProducto(clavePedido, {
            estado: nuevoEstado
        })
    }

    
    
    else if(e.target.id === 'cancelarPedido'){
        clavePedido = e.target.dataset.id
        nuevoEstado = false

         await updateProducto(clavePedido, {
            estado: nuevoEstado
        })
    }


    e.stopPropagation();
}