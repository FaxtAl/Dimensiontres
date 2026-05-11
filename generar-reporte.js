const fs = require('fs');

function generarReporteSimple() {
    console.log("--- Iniciando proceso de reporte ---");
    
    const fechaActual = new Date().toLocaleString('es-ES');
    
    // Contenido del reporte
    const textoReporte = `
=============================================
     REPORTE DE ESTADO - TRABAJO DIARIO     
=============================================
Fecha y Hora: ${fechaActual}

1. Estado del sistema: OPERATIVO
2. Tareas importantes pendientes:
   - Revisión de base de datos
   - Actualización de servidor
   
Reporte generado automáticamente.
=============================================
`;

    // Nombre del archivo de salida
    const nombreArchivo = 'reporte_facil.txt';

    // Guardar el archivo
    fs.writeFile(nombreArchivo, textoReporte, (err) => {
        if (err) {
            console.error("Hubo un error al generar el archivo:", err);
            return;
        }
        console.log(`¡ÉXITO! El archivo '${nombreArchivo}' se creó correctamente en tu carpeta.`);
    });
}

// Ejecutar la función
generarReporteSimple();
