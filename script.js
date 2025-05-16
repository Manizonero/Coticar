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
    let initialY = 0; // Para el seguimiento del toque inicial
    let initialX = 0; // Para el seguimiento del toque inicial (añadido para umbral)
    let isDragging = false; // Bandera para indicar si el arrastre se ha activado
    const DRAG_THRESHOLD = 10; // Umbral de píxeles para iniciar el arrastre (moviles)
    let currentDragTarget = null; // Para la fila sobre la que se arrastra en móvil

    // Función para renderizar la tabla desde el array quoteItems
    const renderTable = () => {
        // Limpiar la tabla antes de renderizar
        itemsTableBody.innerHTML = '';

        quoteItems.forEach((item, index) => {
            const newRow = itemsTableBody.insertRow(); // Crea un <tr>
            newRow.dataset.index = index; // Guardar el índice en la fila para fácil referencia
            newRow.draggable = true; // HACER LA FILA ARRASTRABLE

            // Añadir manejadores de eventos para Drag & Drop (RATÓN)
            newRow.addEventListener('dragstart', handleDragStart);
            newRow.addEventListener('dragover', handleDragOver);
            newRow.addEventListener('dragleave', handleDragLeave);
            newRow.addEventListener('drop', handleDrop);
            newRow.addEventListener('dragend', handleDragEnd);

            // --- INICIO: Añadir manejadores de eventos para Drag & Drop (TÁCTIL) ---
            // { passive: false } es crucial para preventDefault en touchstart/move
            newRow.addEventListener('touchstart', handleTouchStart, { passive: false }); 
            newRow.addEventListener('touchmove', handleTouchMove, { passive: false });
            newRow.addEventListener('touchend', handleTouchEnd);
            newRow.addEventListener('touchcancel', handleTouchEnd); // Por si el toque se interrumpe
            // --- FIN: Añadir manejadores de eventos para Drag & Drop (TÁctIL) ---

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

    // --- Funciones de Drag & Drop (RATÓN) ---

    function handleDragStart(e) {
        draggedRow = this; // 'this' se refiere a la fila que se está arrastrando
        e.dataTransfer.effectAllowed = 'move'; // Define el tipo de arrastre
        e.dataTransfer.setData('text/html', this.outerHTML);
        setTimeout(() => {
            this.classList.add('dragging');
        }, 0);
    }

    function handleDragOver(e) {
        e.preventDefault(); // Permite soltar el elemento (por defecto, no se permite)
        e.dataTransfer.dropEffect = 'move'; // Cambia el cursor a 'move'
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

    // --- FIN: Funciones de Drag & Drop (RATÓN) ---

    // --- INICIO: Funciones de Drag & Drop (TÁCTIL - con umbral de movimiento) ---

    function handleTouchStart(e) {
        // Solo si es un toque con un dedo
        if (e.touches.length === 1) {
            draggedRow = this;
            initialY = e.touches[0].clientY;
            initialX = e.touches[0].clientX; // Almacenar X también
            isDragging = false; // Resetear la bandera de arrastre
            // No prevenir el default aquí aún, lo haremos en touchmove si se cumple el umbral
        }
    }

    function handleTouchMove(e) {
        if (!draggedRow) return;

        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;

        // Calcular la distancia movida
        const deltaY = Math.abs(currentY - initialY);
        const deltaX = Math.abs(currentX - initialX);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // Distancia euclidiana

        // Si la distancia es mayor que el umbral y no estamos arrastrando aún
        if (distance > DRAG_THRESHOLD && !isDragging) {
            isDragging = true; // Activar el modo arrastre
            draggedRow.classList.add('dragging'); // Añadir clase visual de arrastre
            e.preventDefault(); // Prevenir el desplazamiento una vez que el arrastre se activa
        }

        if (isDragging) {
            e.preventDefault(); // Seguir previniendo el desplazamiento
            const touchY = e.touches[0].clientY;
            const targetElement = document.elementFromPoint(e.touches[0].clientX, touchY);

            let newDropTarget = null;
            if (targetElement) {
                newDropTarget = targetElement.closest('tr');
                if (newDropTarget && newDropTarget.closest('#itemsTable tbody') && newDropTarget !== draggedRow) {
                    if (currentDragTarget && currentDragTarget !== newDropTarget) {
                        currentDragTarget.classList.remove('drop-target');
                    }
                    newDropTarget.classList.add('drop-target');
                    currentDragTarget = newDropTarget;
                } else {
                    if (currentDragTarget) {
                        currentDragTarget.classList.remove('drop-target');
                        currentDragTarget = null;
                    }
                }
            }
            // Opcional: para mover visualmente la fila arrastrada
            // draggedRow.style.transform = `translateY(${currentY - initialY}px)`;
        }
    }

    function handleTouchEnd() {
        if (!draggedRow) return;

        // Limpiar el estilo de transformación si se aplicó
        // draggedRow.style.transform = '';

        draggedRow.classList.remove('dragging'); // Quitar clase de arrastre

        if (isDragging && currentDragTarget && currentDragTarget !== draggedRow) {
            // Si estábamos arrastrando y hay un objetivo válido donde soltar
            const draggedIndex = parseInt(draggedRow.dataset.index);
            const targetIndex = parseInt(currentDragTarget.dataset.index);

            const [movedItem] = quoteItems.splice(draggedIndex, 1);
            quoteItems.splice(targetIndex, 0, movedItem);
            
            renderTable(); // Re-renderizar la tabla para actualizar el orden y los event listeners
        }

        // Limpiar las referencias y banderas
        if (currentDragTarget) {
            currentDragTarget.classList.remove('drop-target');
        }
        draggedRow = null;
        currentDragTarget = null;
        initialY = 0;
        initialX = 0;
        isDragging = false;
    }

    // --- FIN: Funciones de Drag & Drop (TÁCTIL) ---


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
                worksheet.getCell(`A${startRow}`).value = item.descrip;
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


    // --- INICIO: Nueva función para copiar datos de la tabla ---

    /**
     * Copia los datos de la tabla (excluyendo la columna de acciones) al portapapeles
     * en un formato de texto simple (tabulado o CSV).
     */
    const copyTableData = () => {
        if (quoteItems.length === 0) {
            alert('No hay ítems en la tabla para copiar.');
            return;
        }

        let clipboardText = '';

        // Obtener los encabezados de la tabla (excepto la última columna de acciones si existe)
        const headers = Array.from(document.querySelectorAll('#itemsTable thead th'))
                             .slice(0, -1) // Excluir la última columna (acciones)
                             .map(th => th.textContent.trim());
        clipboardText += headers.join('\t') + '\n'; // Encabezados separados por tabulaciones

        // Recorrer los datos de quoteItems
        quoteItems.forEach(item => {
            // Asegurarse de que el orden de las propiedades coincide con los encabezados
            const rowData = [
                item.descrip,
                item.cant,
                item.dym,
                item.estado,
                item.pint,
                item.dat
            ];
            clipboardText += rowData.join('\t') + '\n'; // Filas separadas por tabulaciones
        });

        // Intentar copiar al portapapeles
        navigator.clipboard.writeText(clipboardText)
            .then(() => {
                alert('Datos de la tabla copiados al portapapeles.');
            })
            .catch(err => {
                console.error('Error al copiar al portapapeles:', err);
                alert('No se pudieron copiar los datos de la tabla. Por favor, inténtalo manualmente.');
            });
    };


});
