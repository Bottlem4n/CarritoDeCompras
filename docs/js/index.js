const db = firebase.firestore();
const formulario = document.querySelector('#formulario');

const guardarGafas = async (marca,modelo,precio) =>{
    await db.collection('gafas').doc().set({
        marca,
        modelo,
        precio
    })
}

const getGafas = async () => await db.collection('gafas').get();

window.addEventListener("DOMContentLoaded", async e => {
    const querySnapshot = await getGafas();
    querySnapshot.forEach( doc => {
        console.log(doc.data())
    });
})

async function guardar(){
    const marca = formulario['marca'].value;
    const modelo = formulario['modelo'].value;
    const precio = formulario['precio'].value;

    guardarGafas(marca, modelo,precio);
    formulario.reset();
    console.log('registrado');
}
