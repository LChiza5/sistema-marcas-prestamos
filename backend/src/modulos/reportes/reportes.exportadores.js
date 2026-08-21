import PDFDocument from 'pdfkit';

/** Escapa los caracteres especiales de XML para evitar romper el documento. */
function escaparXML(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Punto 13 — Convierte las filas del reporte a un documento XML.
 * Se arma manualmente para no depender de una librería adicional.
 */
export function generarXML(filas) {
  const elementos = filas
    .map(
      (fila) => `  <marca>
    <usuario>${escaparXML(fila.usuario)}</usuario>
    <departamento>${escaparXML(fila.departamento)}</departamento>
    <fecha>${escaparXML(fila.fecha)}</fecha>
    <horaEntrada>${escaparXML(fila.hora_entrada)}</horaEntrada>
    <horaSalida>${escaparXML(fila.hora_salida)}</horaSalida>
    <dispositivoEntrada>${escaparXML(fila.dispositivo_entrada)}</dispositivoEntrada>
    <dispositivoSalida>${escaparXML(fila.dispositivo_salida)}</dispositivoSalida>
    <ipEntrada>${escaparXML(fila.ip_entrada)}</ipEntrada>
    <ipSalida>${escaparXML(fila.ip_salida)}</ipSalida>
  </marca>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<reporteMarcas total="${filas.length}">\n${elementos}\n</reporteMarcas>`;
}

/**
 * Punto 13 — Genera el PDF del reporte y lo transmite directamente hacia
 * la respuesta HTTP (res). PDFKit arma el archivo por streaming, así que
 * no es necesario guardarlo en disco.
 */
export function generarPDF(res, filas) {
  const documento = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
  documento.pipe(res);

  documento.fontSize(16).text('Reporte de marcas', { align: 'center' });
  documento
    .fontSize(9)
    .fillColor('gray')
    .text(`Generado el ${new Date().toLocaleString('es-CR')} — ${filas.length} registro(s)`, {
      align: 'center',
    });
  documento.moveDown(1);
  documento.fillColor('black');

  const columnas = [
    { titulo: 'Usuario', ancho: 130, campo: 'usuario' },
    { titulo: 'Departamento', ancho: 140, campo: 'departamento' },
    { titulo: 'Fecha', ancho: 70, campo: 'fecha' },
    { titulo: 'Entrada', ancho: 55, campo: 'hora_entrada' },
    { titulo: 'Salida', ancho: 55, campo: 'hora_salida' },
    { titulo: 'Dispositivo entrada', ancho: 110, campo: 'dispositivo_entrada' },
    { titulo: 'IP entrada', ancho: 90, campo: 'ip_entrada' },
    { titulo: 'IP salida', ancho: 90, campo: 'ip_salida' },
  ];

  const xInicial = documento.page.margins.left;
  let y = documento.y;

  function dibujarEncabezado() {
    let x = xInicial;
    documento.fontSize(9).fillColor('white');
    documento.rect(xInicial, y, columnas.reduce((s, c) => s + c.ancho, 0), 18).fill('#2b6cb0');
    documento.fillColor('white');
    columnas.forEach((col) => {
      documento.text(col.titulo, x + 3, y + 5, { width: col.ancho - 6 });
      x += col.ancho;
    });
    documento.fillColor('black');
    y += 18;
  }

  dibujarEncabezado();

  filas.forEach((fila, indice) => {
    // Salto de página cuando ya no cabe otra fila.
    if (y > documento.page.height - documento.page.margins.bottom - 20) {
      documento.addPage();
      y = documento.page.margins.top;
      dibujarEncabezado();
    }

    if (indice % 2 === 0) {
      documento.rect(xInicial, y, columnas.reduce((s, c) => s + c.ancho, 0), 16).fill('#f2f5f9');
      documento.fillColor('black');
    }

    let x = xInicial;
    documento.fontSize(8);
    columnas.forEach((col) => {
      documento.text(String(fila[col.campo] ?? '—'), x + 3, y + 4, { width: col.ancho - 6 });
      x += col.ancho;
    });
    y += 16;
  });

  documento.end();
}
