const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePDF = async (evaluacion, fotos, resultado, uploadsPath) => {
  const doc = new PDFDocument({ margin: 30 });
  const fileName = `informe-${evaluacion?.id}-${Date.now()}.pdf`;
  const filePath = path.join(uploadsPath, fileName);

  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Función para obtener valores seguros
    const safeGet = (obj, prop, defaultValue = 'N/A') =>
      obj?.[prop]?.toString().trim() || defaultValue;

    // ===== PÁGINA 1: DATOS DEL PACIENTE =====
    doc.fontSize(18)
      .text('Informe de Evaluación', { align: 'center' })
      .moveDown(0.5);

    // Sección de información personal
    doc.fontSize(14).text('Datos del Paciente:').moveDown(0.3);
    doc.fontSize(12)
      .text(`• Nombre completo: ${safeGet(evaluacion, 'primer_nombre')} ${safeGet(evaluacion, 'segundo_nombre')} ${safeGet(evaluacion, 'primer_apellido')} ${safeGet(evaluacion, 'segundo_apellido')}`)
      .text(`• Edad: ${safeGet(evaluacion, 'edad')} años`)
      .text(`• Género: ${safeGet(evaluacion, 'genero')}`)
      .text(`• Dirección: ${safeGet(evaluacion, 'direccion')}`)
      .text(`• Ubicación: ${safeGet(evaluacion, 'ciudad')}, ${safeGet(evaluacion, 'pais')}`)
      .moveDown(1);

    // Sección médica
    doc.fontSize(14).text('Antecedentes Médicos:').moveDown(0.3);
    doc.fontSize(12)
      .text(`• Historial familiar: ${safeGet(evaluacion, 'historial_familiar')}`)
      .text(`• Cirugías oculares: ${safeGet(evaluacion, 'cirugias_oculares')}`)
      .text(`• Traumatismos: ${safeGet(evaluacion, 'traumatismos_oculares')}`)
      .moveDown(1);

    // Sección de síntomas
    doc.fontSize(14).text('Síntomas Reportados:').moveDown(0.3);
    doc.fontSize(12)
      .text(`• Visión borrosa: ${safeGet(evaluacion, 'vision_borrosa')} (Intensidad: ${safeGet(evaluacion, 'intensidad_borrosa')}/5)`)
      .text(`• Fotofobia: ${safeGet(evaluacion, 'fotofobia')}`)
      .text(`• Dificultad nocturna: ${safeGet(evaluacion, 'dificultad_noche')}`)
      .text(`• Otros síntomas: ${safeGet(evaluacion, 'otros_sintomas')}`)
      .moveDown(1);

    // ===== PÁGINA 2: RESULTADOS Y FOTOS =====
    doc.addPage()
      .fontSize(18)
      .text('Resultados del Análisis', { align: 'center' })
      .moveDown(0.5);

    // Resultados
    doc.fontSize(14).text('Diagnóstico:').moveDown(0.3);
    doc.fontSize(12)
      .text(`• Severidad: ${safeGet(resultado, 'severidad')}`)
      .text(`• Descripción: ${safeGet(resultado, 'descripcion')}`)
      .moveDown(1);

    // Fotografías
    doc.fontSize(14).text('Fotografías Oculares:').moveDown(0.5);
    const imageY = doc.y;

    // Ojo izquierdo con etiqueta
    if (fotos?.ojo_izquierdo) {
      try {
        doc.image(path.join(uploadsPath, fotos.ojo_izquierdo),
          50, imageY,
          { width: 250, height: 180 }
        )
          .fontSize(12)
          .fillColor('#2E5BFF')
          .text('Ojo Izquierdo', 50, imageY + 185, {
            width: 250,
            align: 'center'
          });
      } catch (error) {
        doc.text('ERROR: Imagen ojo izquierdo no disponible', 50, imageY);
      }
    }

    // Ojo derecho con etiqueta
    if (fotos?.ojo_derecho) {
      try {
        doc.image(path.join(uploadsPath, fotos.ojo_derecho),
          50, imageY + 220,  // Aumentado espacio vertical
          { width: 250, height: 180 }
        )
          .fontSize(12)
          .fillColor('#2E5BFF')
          .text('Ojo Derecho', 50, imageY + 405, {  // Posición ajustada
            width: 250,
            align: 'center'
          });
      } catch (error) {
        doc.text('ERROR: Imagen ojo derecho no disponible', 50, imageY + 220);
      }
    }

    doc.end();

    stream.on('finish', () => resolve(fileName));
    stream.on('error', reject);
  });
};

module.exports = { generatePDF };