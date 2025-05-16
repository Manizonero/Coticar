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
    let longPressTimer = null; // Temporizador para el toque largo
    const LONG_PRESS_DELAY = 400; // Milisegundos para un toque largo
    let initialTouchY = 0; // Posición Y inicial del toque
    let initialTouchX = 0; // Posición X inicial del toque
    const MOVEMENT_TOLERANCE = 5; // Píxeles de tolerancia para considerar un toque "estacionario"

    let currentDragTarget = null; // Para la fila sobre la que se arrastra en móvil
    let isTouchDragging = false; // Bandera para indicar si el arrastre táctil está activo

    // Función para renderizar la tabla desde el array quoteItems
    const renderTable = () => {
        // Limpiar la tabla antes de renderizar
        itemsTableBody.innerHTML = '';

        quoteItems.forEach((item, index) => {
            const newRow = itemsTableBody.insertRow(); // Crea un <tr>
            newRow.dataset.index = index; // Guardar el índice en la fila para fácil referencia
            newRow.draggable = true; // HACER LA FILA ARRASTRABLE (para compatibilidad con ratón)

            // Añadir manejadores de eventos para Drag & Drop (RATÓN)
            newRow.addEventListener('dragstart', handleDragStart);
            newRow.addEventListener('dragover', handleDragOver);
            newRow.addEventListener('dragleave', handleDragLeave);
            newRow.addEventListener('drop', handleDrop);
            newRow.addEventListener('dragend', handleDragEnd);

            // --- INICIO: Añadir manejadores de eventos para Drag & Drop (TÁCTIL) ---
            // Los eventos táctiles ahora usan la lógica de toque largo
            newRow.addEventListener('touchstart', handleTouchStart);
            newRow.addEventListener('touchmove', handleTouchMove);
            newRow.addEventListener('touchend', handleTouchEnd);
            newRow.addEventListener('touchcancel', handleTouchEnd); 
            // --- FIN: Añadir manejadores de eventos para Drag & Drop (TÁCTIL) ---

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
    // (Estas permanecen igual, ya que funcionan bien en PC)
    function handleDragStart(e) {
        draggedRow = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.outerHTML);
        setTimeout(() => {
            this.classList.add('dragging');
        }, 0);
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (this !== draggedRow) {
            this.classList.add('drop-target');
        }
    }

    function handleDragLeave() {
        this.classList.remove('drop-target');
    }

    async function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drop-target');
        if (this === draggedRow) {
            return;
        }
        const draggedIndex = parseInt(draggedRow.dataset.index);
        const targetIndex = parseInt(this.dataset.index);
        const [movedItem] = quoteItems.splice(draggedIndex, 1);
        quoteItems.splice(targetIndex, 0, movedItem);
        renderTable();
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        const dropTargets = document.querySelectorAll('#itemsTable tbody tr.drop-target');
        dropTargets.forEach(target => target.classList.remove('drop-target'));
        draggedRow = null;
    }
    // --- FIN: Funciones de Drag & Drop (RATÓN) ---

    // --- INICIO: Funciones de Drag & Drop (TÁCTIL - con Toque Largo) ---

    function handleTouchStart(e) {
        if (e.touches.length !== 1) return; // Solo un dedo
        
        // Reiniciar cualquier temporizador existente
        if (longPressTimer) {
            clearTimeout(longPressTimer);
        }

        draggedRow = this;
        initialTouchY = e.touches[0].clientY;
        initialTouchX = e.touches[0].clientX;
        isTouchDragging = false; // Resetear la bandera de arrastre táctil

        // Iniciar un temporizador para el toque largo
        longPressTimer = setTimeout(() => {
            // Si el dedo no se ha movido mucho, activar el arrastre
            const currentY = e.touches[0].clientY;
            const currentX = e.touches[0].clientX;
            const deltaY = Math.abs(currentY - initialTouchY);
            const deltaX = Math.abs(currentX - initialTouchX);
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance < MOVEMENT_TOLERANCE) { // Si el movimiento es mínimo
                isTouchDragging = true;
                draggedRow.classList.add('dragging'); // Clase visual para indicar arrastre activo
                e.preventDefault(); // Prevenir el scroll y la selección
                // Opcional: vibración para indicar el inicio del arrastre
                if (navigator.vibrate) {
                    navigator.vibrate(50); 
                }
            } else {
                // Si hubo mucho movimiento antes del toque largo, no es un arrastre.
                handleTouchEnd(); // Limpiar el estado
            }
        }, LONG_PRESS_DELAY);
    }

    function handleTouchMove(e) {
        // Si no estamos en modo de arrastre táctil, permitir el scroll normal
        if (!isTouchDragging) {
            // Si hay un temporizador activo y el dedo se ha movido significativamente, cancelarlo.
            // Esto es para que un deslizamiento rápido no active el toque largo.
            const currentY = e.touches[0].clientY;
            const currentX = e.touches[0].clientX;
            const deltaY = Math.abs(currentY - initialTouchY);
            const deltaX = Math.abs(currentX - initialTouchX);
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (longPressTimer && distance > MOVEMENT_TOLERANCE) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
                // No hay draggedRow, ya que no se activó el arrastre.
                return; // Dejar que el navegador haga el scroll
            }
            return; // Si no hay temporizador y no estamos arrastrando, seguir permitiendo scroll
        }

        // Si estamos en modo de arrastre táctil
        e.preventDefault(); // Prevenir el desplazamiento de la página

        const touchY = e.touches[0].clientY;
        const touchX = e.touches[0].clientX;
        // console.log(`TouchMove - Y: ${touchY}, X: ${touchX}`); // Para depuración

        // Usar elementFromPoint para encontrar la fila bajo el dedo
        const targetElement = document.elementFromPoint(touchX, touchY);

        let newDropTarget = null;
        if (targetElement) {
            newDropTarget = targetElement.closest('tr');
            // Asegurarse de que el target es una fila de la tabla y no la fila que se arrastra
            if (newDropTarget && newDropTarget.closest('#itemsTable tbody') && newDropTarget !== draggedRow) {
                if (currentDragTarget && currentDragTarget !== newDropTarget) {
                    currentDragTarget.classList.remove('drop-target');
                }
                newDropTarget.classList.add('drop-target');
                currentDragTarget = newDropTarget;
            } else {
                // Si el elemento bajo el dedo no es una fila válida o es la misma, limpiar el target visual
                if (currentDragTarget) {
                    currentDragTarget.classList.remove('drop-target');
                    currentDragTarget = null;
                }
            }
        }
        // Opcional: para mover visualmente la fila arrastrada (simulación)
        // Puedes usar `transform` para hacer que la fila "siga" el dedo.
        // draggedRow.style.position = 'absolute'; // o 'relative' y ajustar top/left
        // draggedRow.style.zIndex = '1000'; // Asegurar que esté encima
        // draggedRow.style.left = `${touchX - draggedRow.offsetWidth / 2}px`;
        // draggedRow.style.top = `${touchY - draggedRow.offsetHeight / 2}px`;
    }

    function handleTouchEnd() {
        // Siempre limpiar el temporizador al levantar el dedo
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }

        if (!isTouchDragging) {
            // Si nunca entramos en modo arrastre, solo salir
            draggedRow = null; // Asegurarse de limpiar por si se asignó en touchstart
            return;
        }

        // Si estábamos arrastrando
        if (draggedRow) {
            draggedRow.classList.remove('dragging');
            // draggedRow.style.position = ''; // Limpiar estilos si se aplicaron
            // draggedRow.style.zIndex = '';
            // draggedRow.style.left = '';
            // draggedRow.style.top = '';
        }

        if (currentDragTarget && currentDragTarget !== draggedRow) {
            const draggedIndex = parseInt(draggedRow.dataset.index);
            const targetIndex = parseInt(currentDragTarget.dataset.index);

            const [movedItem] = quoteItems.splice(draggedIndex, 1);
            quoteItems.splice(targetIndex, 0, movedItem);
            
            renderTable(); // Re-renderizar la tabla para actualizar el orden
        }

        // Limpiar todas las referencias y banderas
        if (currentDragTarget) {
            currentDragTarget.classList.remove('drop-target');
        }
        draggedRow = null;
        currentDragTarget = null;
        initialTouchY = 0;
        initialTouchX = 0;
        isTouchDragging = false;
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
            const loadedWorkbook = await workbook.xlsx.load(arrayBuffer); // Asegúrate de que esto se resuelva correctamente

            const worksheet = loadedWorkbook.getWorksheet(1); // Usa loadedWorkbook para obtener la hoja

            worksheet.getCell('B6').value = (document.getElementById('placa').value || '').toUpperCase();
            worksheet.getCell('B3').value = (document.getElementById('linea').value || '').toUpperCase();
            worksheet.getCell('B2').value = document.getElementById('modelo')?.value || '';
            worksheet.getCell('B4').value = cilindrajeInput.value || '';
            worksheet.getCell('B7').value = (document.getElementById('aseguradora')?.value || '').toUpperCase();
            worksheet.getCell('B5').value = (chasisInput.value || '').toUpperCase();

            let startRow = 14;

            // Ahora iteramos sobre el array quoteItems para llenar el Excel
            quoteItems.forEach((item) => {
                worksheet.getCell(`A${startRow}`).value = item.descrip; // Solo descrip aquí
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

    // Añadir el event listener al botón de copiar (asumiendo que su ID será 'copyTableBtn')
    document.getElementById('copyTableBtn').addEventListener('click', copyTableData);

    // --- FIN: Nueva función para copiar datos de la tabla ---

});
