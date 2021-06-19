const db = firebase.firestore();
const formulario = document.querySelector('#formulario');
const salidas = document.querySelector('#salidas');


let estado = false;
let id = "";

const guardarGafas = async (marca,modelo,precio) =>{
    await db.collection('gafas').doc().set({
        marca,
        modelo,
        precio
    })
}

const getGafas = async () => await db.collection('gafas').get();
const onGetGafas = async (callback) => await db.collection('gafas').onSnapshot(callback);

const deleteGafas = (id) => db.collection('gafas').doc(id).delete();

const editGafas = (id) => db.collection('gafas').doc(id).get();

const updateGafas = (id, updateG) => db.collection('gafas').doc(id).update(updateG);

window.addEventListener("DOMContentLoaded", async e => {
    onGetGafas((querySnapshot)=> {
        salidas.innerHTML = "";
        querySnapshot.forEach( doc => {
            
            salidas.innerHTML += 
            `<div> 
                
                ID: <output>${doc.id} </output><br>
                Marca: <output>${doc.data().marca}</output><br>
                Modelo: <output>${doc.data().modelo}</output><br>
                Precio <output>$ ${doc.data().precio}</output> <br>
                <button type="button" class="btn-eliminar" data-id="${doc.id}">Eliminar</button>
                <button type="button" class="btn-editar" data-id="${doc.id}">Editar</button>

            </div><br>`

            const btnDelete = document.querySelectorAll('.btn-eliminar');
            btnDelete.forEach(btn=>{
                btn.addEventListener('click', async (e)=> {
                    //console.log(e.target.dataset.id);
                    await deleteGafas(e.target.dataset.id);
                    formulario.reset();

                });
            });

            const btnEdit = document.querySelectorAll('.btn-editar');
            btnEdit.forEach(btn=>{
                btn.addEventListener('click', async (e)=> {
                    console.log(e.target.dataset.id);
                    const elemento = await editGafas(e.target.dataset.id);

                    estado = true;
                    formulario['btn-guardar'].innerText= 'Actualizar';
                    id = e.target.dataset.id;
                    formulario['id'].value = id;
                    formulario['marca'].value = elemento.data().marca;
                    formulario['modelo'].value = elemento.data().modelo;
                    formulario['precio'].value = elemento.data().precio;

                    //console.log(elemento.data());
                });
            });
        });
    })
    
})

async function guardar(){
    
    if(formulario['marca'].value.trim() == ""){
        formulario['marca'].setCustomValidity('Llena el Campo Marca')
        
        formulario['marca'].focus();
    }
    else if (formulario['modelo'].value == ""){
        formulario['modelo'].setCustomValidity('Llena el Campo Modelo');
        formulario['modelo'].focus();

    }
    else{
        const marca = formulario['marca'].value;
        const modelo = formulario['modelo'].value;
        const precio = formulario['precio'].value;
        if(estado === false){
            guardarGafas(marca, modelo,precio);
            formulario.reset();
            console.log('registrado');
        }
    
        else{
            await updateGafas(id,{
                marca: marca,
                modelo: modelo,
                precio: precio
            });
    
            estado = false;
            formulario['btn-guardar'].innerText= 'Guardar';
            formulario.reset();
        }
    }   
}
