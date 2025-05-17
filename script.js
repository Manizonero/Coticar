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
    let initialTouchY = 0; 
    let initialTouchX = 0; 
    const MOVEMENT_TOLERANCE = 5;

    let currentDragTarget = null; 
    let isTouchDragging = false;

    // Función para renderizar la tabla desde el array quoteItems
    const renderTable = () => {
        itemsTableBody.innerHTML = '';

        quoteItems.forEach((item, index) => {
            const newRow = itemsTableBody.insertRow();
            newRow.dataset.index = index; 
            newRow.draggable = true;

            newRow.addEventListener('dragstart', handleDragStart);
            newRow.addEventListener('dragover', handleDragOver);
            newRow.addEventListener('dragleave', handleDragLeave);
            newRow.addEventListener('drop', handleDrop);
            newRow.addEventListener('dragend', handleDragEnd);

            newRow.addEventListener('touchstart', handleTouchStart);
            newRow.addEventListener('touchmove', handleTouchMove);
            newRow.addEventListener('touchend', handleTouchEnd);
            newRow.addEventListener('touchcancel', handleTouchEnd); 

            // Insertar celdas (<td>) en la fila con los datos
            newRow.insertCell().textContent = item.descrip;
            newRow.insertCell().textContent = item.cant;
            newRow.insertCell().textContent = item.dym;
            newRow.insertCell().textContent = item.estado;
            newRow.insertCell().textContent = item.pint;
            newRow.insertCell().textContent = item.dat;

            const actionsCell = newRow.insertCell();
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', () => {
                quoteItems.splice(index, 1);
                renderTable(); 
            });
            actionsCell.appendChild(deleteButton);
        });
    };

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

    function handleTouchStart(e) {
        if (e.touches.length !== 1) return;
        
        if (longPressTimer) {
            clearTimeout(longPressTimer);
        }

        draggedRow = this;
        initialTouchY = e.touches[0].clientY;
        initialTouchX = e.touches[0].clientX;
        isTouchDragging = false;

        longPressTimer = setTimeout(() => {
            const currentY = e.touches[0].clientY;
            const currentX = e.touches[0].clientX;
            const deltaY = Math.abs(currentY - initialTouchY);
            const deltaX = Math.abs(currentX - initialTouchX);
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance < MOVEMENT_TOLERANCE) {
                isTouchDragging = true;
                draggedRow.classList.add('dragging');
                e.preventDefault(); 
                if (navigator.vibrate) {
                    navigator.vibrate(50); 
                }
            } else {
                handleTouchEnd(); 
            }
        }, LONG_PRESS_DELAY);
    }

    function handleTouchMove(e) {
        if (!isTouchDragging) {
            const currentY = e.touches[0].clientY;
            const currentX = e.touches[0].clientX;
            const deltaY = Math.abs(currentY - initialTouchY);
            const deltaX = Math.abs(currentX - initialTouchX);
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (longPressTimer && distance > MOVEMENT_TOLERANCE) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
                return;
            }
            return;
        }

        e.preventDefault();

        const touchY = e.touches[0].clientY;
        const touchX = e.touches[0].clientX;
        const targetElement = document.elementFromPoint(touchX, touchY);

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
        
    }

    function handleTouchEnd() {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }

        if (!isTouchDragging) {
            draggedRow = null; 
            return;
        }

        if (draggedRow) {
            draggedRow.classList.remove('dragging');
        }

        if (currentDragTarget && currentDragTarget !== draggedRow) {
            const draggedIndex = parseInt(draggedRow.dataset.index);
            const targetIndex = parseInt(currentDragTarget.dataset.index);

            const [movedItem] = quoteItems.splice(draggedIndex, 1);
            quoteItems.splice(targetIndex, 0, movedItem);
            
            renderTable();
        }

        if (currentDragTarget) {
            currentDragTarget.classList.remove('drop-target');
        }
        draggedRow = null;
        currentDragTarget = null;
        initialTouchY = 0;
        initialTouchX = 0;
        isTouchDragging = false;
    }

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

        quoteItems.push(newItem); 
        renderTable(); 
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
        } catch (error) {
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
        } catch (error) {
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
