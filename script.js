document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.querySelector('.add_button');
    let containerCount = 1;

    addButton.addEventListener('click', () => {
        // Clonar el contenedor contdat
        const originalContainer = document.querySelector('.contdat');
        const newContainer = originalContainer.cloneNode(true);

        // Limpiar los inputs en la nueva copia
        const inputs = newContainer.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = '';
        });


        // Agregar clase para margen inferior en la nueva copia
        newContainer.classList.add('cloned-container');


        // Insertar la nueva copia debajo de la original
        originalContainer.parentNode.insertBefore(newContainer, addButton.parentNode);

        // Mover el botón debajo de la nueva copia
        const buttonsContainer = addButton.parentNode;
        originalContainer.parentNode.insertBefore(buttonsContainer, newContainer.nextSibling);

        
    });
});



/*exportar ecxel con nombre de placa*/
document.getElementById('cecxel').addEventListener('click', async () => {
    try {
        const workbook = new ExcelJS.Workbook();
        const response = await fetch('template.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.getWorksheet(1); // Selecciona la primera hoja de la plantilla

        // Mapea los datos fijos del formulario a las celdas específicas
        worksheet.getCell('C2').value = document.getElementById('fecha').value || '';
        worksheet.getCell('C3').value = (document.getElementById('placa').value || '').toUpperCase();
        worksheet.getCell('E2').value = (document.getElementById('marca').value || '').toUpperCase();
        worksheet.getCell('E3').value = (document.getElementById('linea').value || '').toUpperCase();
        worksheet.getCell('C4').value = document.getElementById('modelo').value || '';
        worksheet.getCell('E4').value = (document.getElementById('color').value || '').toUpperCase();
        worksheet.getCell('C5').value = (document.getElementById('aseguradora').value || '').toUpperCase();

        // Recorrer cada contenedor de datos clonados y agregarlos al Excel
        const containers = document.querySelectorAll('.contdat');
        let startRow = 8; // Comienza a escribir desde la fila 8 en Excel

        containers.forEach((container, index) => {
            const descrip = container.querySelector('#descrip').value || '';
            const cant = container.querySelector('#cant').value || '';
            const dym = container.querySelector('#dym').value || '';
            const estado = container.querySelector('#estado').value || '';
            const pint = container.querySelector('#pint').value || '';
            const dat = container.querySelector('#dat').value || '';

            worksheet.getCell(`B${startRow}`).value = descrip ;
            worksheet.getCell(`F${startRow}`).value = cant ;
            worksheet.getCell(`G${startRow}`).value = dym ;
            worksheet.getCell(`H${startRow}`).value = estado ;
            worksheet.getCell(`I${startRow}`).value = pint ;
            worksheet.getCell(`J${startRow}`).value = dat ;

            startRow++; // Moverse a la siguiente fila para cada contenedor
        });

        // Obtener el valor de la placa para usarlo en el nombre del archivo
        const placa = document.getElementById('placa').value || 'cotizacion';

        // Guardar el archivo modificado con el nombre que incluye la placa
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${placa}.xlsx`.toUpperCase(); // Usa el valor de la placa como parte del nombre del archivo
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error al generar el archivo Excel:", error);
    }
});


/*exportar ecxel de susuki*/
document.getElementById('crearex').addEventListener('click', async () => {
    const cilindrajeInput = document.getElementById('cilindraje');
    const chasisInput = document.getElementById('chasis');

    // Verificar si los campos de cilindraje y chasis están vacíos
    if (!cilindrajeInput.value.trim() || !chasisInput.value.trim()) {
        alert('datos cilindraje y chasis, antes de exportar.');
        return; // Detener la ejecución si los campos están vacíos
    }

    try {
        const workbook = new ExcelJS.Workbook();
        const response = await fetch('template2.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.getWorksheet(1); // Selecciona la primera hoja de la plantilla

        // Mapea los datos fijos del formulario a las celdas específicas
        worksheet.getCell('B6').value = (document.getElementById('placa').value || '').toUpperCase();
        worksheet.getCell('B3').value = (document.getElementById('linea').value || '').toUpperCase();
        worksheet.getCell('B2').value = document.getElementById('modelo').value || '';
        worksheet.getCell('B4').value = cilindrajeInput.value || '';
        worksheet.getCell('B7').value = (document.getElementById('aseguradora').value || '').toUpperCase();
        worksheet.getCell('B5').value = (chasisInput.value || '').toUpperCase();

        // Recorrer cada contenedor de datos clonados y agregarlos al Excel
        const containers = document.querySelectorAll('.contdat');
        let startRow = 14; // Comienza a escribir desde la fila 14 en Excel

        containers.forEach((container, index) => {
            const descrip = container.querySelector('#descrip').value || '';
            const cant = container.querySelector('#cant').value || '';

            worksheet.getCell(`A${startRow}`).value = descrip.toUpperCase();
            worksheet.getCell(`B${startRow}`).value = cant ;

            startRow++; // Moverse a la siguiente fila para cada contenedor
        });

        // Obtener el valor de la placa para usarlo en el nombre del archivo
        const placa = document.getElementById('placa').value || 'cotizacion';

        // Guardar el archivo modificado con el nombre que incluye la placa
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download =  `${placa} Cotizacion Repuestos Suzuki.xlsx`.toUpperCase();
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error al generar el archivo Excel:", error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const marcaInput = document.getElementById('marca');
    const cilindrajeInput = document.getElementById('cilindraje');
    const chasisInput = document.getElementById('chasis');

    // Deshabilitar los campos por defecto
    cilindrajeInput.disabled = true;
    chasisInput.disabled = true;

    // Función para habilitar o deshabilitar los campos basados en el valor de marca
    const toggleFields = () => {
        const marcaValue = marcaInput.value.trim().toLowerCase();
        if (marcaValue === 'suzuki' || marcaValue === 'citroen') {
            cilindrajeInput.disabled = false;
            chasisInput.disabled = false;
        } else {
            cilindrajeInput.disabled = true;
            chasisInput.disabled = true;
            cilindrajeInput.value = ''; // Limpiar el valor del input si se deshabilita
            chasisInput.value = ''; // Limpiar el valor del input si se deshabilita
        }
    };

    // Escuchar cambios en el input de marca
    marcaInput.addEventListener('input', toggleFields);
});

