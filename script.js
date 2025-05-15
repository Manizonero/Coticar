document.addEventListener('DOMContentLoaded', () => {

    const addItemButton = document.getElementById('addItemBtn');
    const itemsTableBody = document.querySelector('#itemsTable tbody');

    const descripInput = document.getElementById('descrip');
    const cantInput = document.getElementById('cant');
    const dymInput = document.getElementById('dym');
    const estadoInput = document.getElementById('estado');
    const pintInput = document.getElementById('pint');
    const datInput = document.getElementById('dat');

    // Array para almacenar los ítems de la cotización
    let quoteItems = [];

    // Variable para almacenar la fila que se está arrastrando
    let draggedRow = null;

    // Función para renderizar la tabla desde el array quoteItems
    const renderTable = () => {
        // Limpiar la tabla antes de renderizar
        itemsTableBody.innerHTML = '';

        quoteItems.forEach((item, index) => {
            const newRow = itemsTableBody.insertRow(); // Crea un <tr>
            newRow.dataset.index = index; // Guardar el índice en la fila para fácil referencia
            newRow.draggable = true; // HACER LA FILA ARRASTRABLE

            // Añadir manejadores de eventos para Drag & Drop a cada fila
            newRow.addEventListener('dragstart', handleDragStart);
            newRow.addEventListener('dragover', handleDragOver);
            newRow.addEventListener('dragleave', handleDragLeave);
            newRow.addEventListener('drop', handleDrop);
            newRow.addEventListener('dragend', handleDragEnd);


            // Insertar celdas (<td>) en la fila con los datos
            newRow.insertCell().textContent = item.descrip;
            newRow.insertCell().textContent = item.cant;
            newRow.insertCell().textContent = item.dym;
            newRow.insertCell().textContent = item.estado;
            newRow.insertCell().textContent = item.pint;
            newRow.insertCell().textContent = item.dat;

            // Celda para el botón de eliminar
            const actionsCell = newRow.insertCell();
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', () => {
                // Eliminar el ítem del array quoteItems por su índice
                quoteItems.splice(index, 1);
                renderTable(); // Volver a renderizar la tabla
            });
            actionsCell.appendChild(deleteButton);
        });
    };

    // --- Funciones de Drag & Drop ---

    function handleDragStart(e) {
        draggedRow = this; // 'this' se refiere a la fila que se está arrastrando
        e.dataTransfer.effectAllowed = 'move'; // Define el tipo de arrastre
        // Almacenar el HTML de la fila en dataTransfer. Esto es útil para otras áreas,
        // pero principalmente necesitamos la referencia a la fila y su índice.
        e.dataTransfer.setData('text/html', this.outerHTML);
        // Retrasar la adición de la clase 'dragging' para que no afecte la imagen fantasma del arrastre
        setTimeout(() => {
            this.classList.add('dragging');
        }, 0);
    }

    function handleDragOver(e) {
        e.preventDefault(); // Permite soltar el elemento (por defecto, no se permite)
        e.dataTransfer.dropEffect = 'move'; // Cambia el cursor a 'move'
        // Si no es la misma fila que se está arrastrando, añadir clase para retroalimentación visual
        if (this !== draggedRow) {
            this.classList.add('drop-target');
        }
    }

    function handleDragLeave() {
        this.classList.remove('drop-target'); // Quitar la clase si el arrastre sale de la fila
    }

    async function handleDrop(e) {
        e.preventDefault(); // Prevenir el comportamiento por defecto

        this.classList.remove('drop-target'); // Quitar la clase visual de destino

        if (this === draggedRow) {
            // Si la fila se soltó sobre sí misma, no hacer nada
            return;
        }

        // Obtener los índices de la fila arrastrada y la fila de destino
        const draggedIndex = parseInt(draggedRow.dataset.index);
        const targetIndex = parseInt(this.dataset.index);

        // Mover el elemento en el array quoteItems
        const [movedItem] = quoteItems.splice(draggedIndex, 1); // Cortar el elemento arrastrado
        quoteItems.splice(targetIndex, 0, movedItem); // Insertarlo en la nueva posición

        renderTable(); // Volver a renderizar la tabla con el nuevo orden
    }

    function handleDragEnd() {
        // Quitar la clase 'dragging' de la fila que se arrastró
        this.classList.remove('dragging');
        // Quitar la clase 'drop-target' de cualquier fila que pudiera tenerla
        const dropTargets = document.querySelectorAll('#itemsTable tbody tr.drop-target');
        dropTargets.forEach(target => target.classList.remove('drop-target'));
        
        draggedRow = null; // Limpiar la referencia a la fila arrastrada
    }

    // --- Fin de Funciones de Drag & Drop ---


    // Event listener para el botón "AGREGAR ITEM"
    addItemButton.addEventListener('click', () => {
        const descrip = descripInput.value.trim();
        const cant = cantInput.value.trim();
        const dym = dymInput.value.trim();
        const estado = estadoInput.value.trim();
        const pint = pintInput.value.trim();
        const dat = datInput.value.trim();

        if (!descrip) {
            alert('La descripción es obligatoria para agregar un ítem.');
            return;
        }

        const newItem = {
            descrip,
            cant,
            dym,
            estado,
            pint,
            dat
        };

        quoteItems.push(newItem); // Añadir el nuevo ítem al array
        renderTable(); // Renderizar la tabla con el nuevo ítem

        // Limpiar los inputs después de agregar el ítem
        descripInput.value = '';
        cantInput.value = '';
        dymInput.value = '';
        estadoInput.value = '';
        pintInput.value = '';
        datInput.value = '';
        descripInput.focus();
    });

    /* --- Exportar Excel con nombre de placa --- */
    document.getElementById('cecxel').addEventListener('click', async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const response = await fetch('template.xlsx');
            const arrayBuffer = await response.arrayBuffer();
            await workbook.xlsx.load(arrayBuffer);

            const worksheet = workbook.getWorksheet(1); // Selecciona la primera hoja de la plantilla

            worksheet.getCell('C2').value = document.getElementById('fecha').value || '';
            worksheet.getCell('C3').value = (document.getElementById('placa').value || '').toUpperCase();
            worksheet.getCell('E2').value = (document.getElementById('marca').value || '').toUpperCase();
            worksheet.getCell('E3').value = (document.getElementById('linea').value || '').toUpperCase();
            worksheet.getCell('C4').value = document.getElementById('modelo')?.value || '';
            worksheet.getCell('E4').value = (document.getElementById('color')?.value || '').toUpperCase();
            worksheet.getCell('C5').value = (document.getElementById('aseguradora')?.value || '').toUpperCase();


            let startRow = 8; // Comienza a escribir desde la fila 8 en Excel

            // Ahora iteramos sobre el array quoteItems para llenar el Excel
            quoteItems.forEach((item) => {
                worksheet.getCell(`B${startRow}`).value = item.descrip;
                worksheet.getCell(`F${startRow}`).value = item.cant;
                worksheet.getCell(`G${startRow}`).value = item.dym;
                worksheet.getCell(`H${startRow}`).value = item.estado;
                worksheet.getCell(`I${startRow}`).value = item.pint;
                worksheet.getCell(`J${startRow}`).value = item.dat;

                startRow++;
            });

            const placa = document.getElementById('placa').value || 'cotizacion';

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${placa}.xlsx`.toUpperCase();
            a.click();
            URL.revokeObjectURL(url);
            alert('¡Archivo Excel generado correctamente!');
        } catch (error) {
            console.error("Error al generar el archivo Excel:", error);
            alert('Error al generar el archivo Excel. Consulta la consola para más detalles.');
        }
    });


    /* --- Exportar Excel de Suzuki --- */
    document.getElementById('crearex').addEventListener('click', async () => {
        const cilindrajeInput = document.getElementById('cilindraje');
        const chasisInput = document.getElementById('chasis');

        if (!cilindrajeInput.value.trim() || !chasisInput.value.trim()) {
            alert('Por favor, ingresa los datos de cilindraje y chasis antes de exportar.');
            return;
        }

        try {
            const workbook = new ExcelJS.Workbook();
            const response = await fetch('template2.xlsx');
            const arrayBuffer = await response.arrayBuffer();
            await workbook.xlsx.load(arrayBuffer);

            const worksheet = workbook.getWorksheet(1);

            worksheet.getCell('B6').value = (document.getElementById('placa').value || '').toUpperCase();
            worksheet.getCell('B3').value = (document.getElementById('linea').value || '').toUpperCase();
            worksheet.getCell('B2').value = document.getElementById('modelo')?.value || '';
            worksheet.getCell('B4').value = cilindrajeInput.value || '';
            worksheet.getCell('B7').value = (document.getElementById('aseguradora')?.value || '').toUpperCase();
            worksheet.getCell('B5').value = (chasisInput.value || '').toUpperCase();

            let startRow = 14;

            // Ahora iteramos sobre el array quoteItems para llenar el Excel
            quoteItems.forEach((item) => {
                worksheet.getCell(`A${startRow}`).value = item.descrip.toUpperCase();
                worksheet.getCell(`B${startRow}`).value = item.cant;

                startRow++;
            });

            const placa = document.getElementById('placa').value || 'cotizacion';

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${placa} Cotizacion Repuestos Suzuki.xlsx`.toUpperCase();
            a.click();
            URL.revokeObjectURL(url);
            alert('¡Archivo Excel de Suzuki generado correctamente!');
        } catch (error) {
            console.error("Error al generar el archivo Excel de Suzuki:", error);
            alert('Error al generar el archivo Excel de Suzuki. Consulta la consola para más detalles.');
        }
    });

    // Lógica para habilitar/deshabilitar campos (Marca, Cilindraje, Chasis)
    const marcaInput = document.getElementById('marca');
    const cilindrajeInput = document.getElementById('cilindraje');
    const chasisInput = document.getElementById('chasis');

    // Deshabilitar los campos por defecto al cargar la página
    cilindrajeInput.disabled = true;
    chasisInput.disabled = true;

    const toggleFields = () => {
        const marcaValue = marcaInput.value.trim().toLowerCase();
        if (marcaValue === 'suzuki' || marcaValue === 'citroen') {
            cilindrajeInput.disabled = false;
            chasisInput.disabled = false;
        } else {
            cilindrajeInput.disabled = true;
            chasisInput.value = ''; // Limpiar el valor del input si se deshabilita
            chasisInput.disabled = true;
            cilindrajeInput.value = ''; // Limpiar el valor del input si se deshabilita
        }
    };

    marcaInput.addEventListener('input', toggleFields);
    toggleFields(); // Llamar al inicio para establecer el estado inicial
});
