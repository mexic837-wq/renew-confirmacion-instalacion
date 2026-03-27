/**
 * RENEW WATER - PDF Generator Service v4.5 (Vercel-Public Edition)
 * Estándar de ejecución: ES Modules (import/export)
 * Fuente de Datos: https://renew-confirmacion-instalacion.vercel.app/confirmaciondeordenv1.pdf
 */

import { PDFDocument } from 'pdf-lib';

/**
 * Handler Principal (Método POST) para Vercel Serverless Functions
 */
export default async function handler(req, res) {
  try {
    const payload = req.body;

    // 1. Validar el cuerpo de la petición
    if (!payload || !payload.cliente || !payload.firmas) {
      return res.status(400).json({ error: 'Estructura de payload inválida o incompleta.' });
    }

    // 2. Cargar Plantilla PDF desde la URL Pública de Vercel
    // Importante: El archivo confirmaciondeordenv1.pdf debe vivir en la carpeta /public
    const urlPlantilla = 'https://renew-confirmacion-instalacion.vercel.app/confirmaciondeordenv1.pdf';
    
    console.log(`Intentando descargar plantilla desde: ${urlPlantilla}`);
    const response = await fetch(urlPlantilla);
    
    if (!response.ok) {
      throw new Error(`No se pudo descargar la plantilla PDF pública. Status: ${response.status}`);
    }

    const plantillaArrayBuffer = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(plantillaArrayBuffer);
    const form = pdfDoc.getForm();
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // --- 3. MAPEO DE CAMPOS DE TEXTO PLANO ---
    const textMappings = {
      'fecha_doc': payload.cliente.fecha_doc,
      'comprador': payload.cliente.comprador,
      'telefono': payload.cliente.telefono,
      'email': payload.cliente.email,
      'direccion': payload.cliente.direccion,
      'ciudad': payload.cliente.ciudad,
      'estado': payload.cliente.estado,
      'zip': payload.cliente.zip,
      'fecha_inst': payload.instalacion.fecha_inst,
      'instalador': payload.instalacion.instalador,
      'representante': payload.instalacion.representante,
      
      // Costos
      'costo_inst': `$${payload.costos.instalacion}`,
      'costo_millas': `$${payload.costos.millas}`,
      'costo_extra': `$${payload.costos.extra}`,
      'costo_otro': `$${payload.costos.otro}`,
      'costo_total': `$${payload.costos.total}`,
      
      // Fecha de Firma
      'fecha_firma': payload.firmas.fecha_firma,

      // Otros campos de texto
      'serial_system': payload.equipos.serial_renew,
      'serial_alkaline': payload.equipos.serial_alkaline,
      'serial_well': payload.equipos.serial_well,
      'txt_other': payload.equipos.other_text,
      'led_iniciales': payload.preguntas.led_iniciales,
      'lugar_iniciales': payload.preguntas.lugar_iniciales,
      'clima_iniciales': payload.preguntas.clima_iniciales
    };

    // Aplicar setText a los campos de texto
    Object.entries(textMappings).forEach(([fieldName, value]) => {
      try {
        const field = form.getTextField(fieldName);
        field.setText(value?.toString() || '');
      } catch (err) {
        // Silenciar errores si el campo no existe en el PDF base
      }
    });

    // --- 4. LÓGICA DE CHECKBOXES FALSOS ('X') ---
    const checkboxFields = {
      'chk_municipal': payload.equipos.municipal,
      'chk_icemaker': payload.equipos.icemaker,
      'chk_system': payload.equipos.renew_system,
      'chk_alkaline': payload.equipos.alkaline,
      'chk_well': payload.equipos.well_system,
      'chk_uv': payload.equipos.ultraviolet,
      'chk_bigblue': payload.equipos.big_blue,
      'chk_spindown': payload.equipos.spin_down,
      'chk_other': payload.equipos.other,
      // Lógica Sí/No
      'led_yes': payload.preguntas.led === 'Yes',
      'led_no': payload.preguntas.led === 'No',
      'lugar_yes': payload.preguntas.lugar === 'Yes',
      'lugar_no': payload.preguntas.lugar === 'No',
      'clima_yes': payload.preguntas.clima === 'Yes',
      'clima_no': payload.preguntas.clima === 'No'
    };

    Object.entries(checkboxFields).forEach(([field, isTrue]) => {
      if (isTrue === true) {
        try { form.getTextField(field).setText('X'); } catch (e) {}
      }
    });

    // --- 5. INCRUSTACIÓN DE FIRMA DINÁMICA (Bounding Box) ---
    if (payload.firmas && payload.firmas.firma_comprador) {
        try {
            // Limpiar Prefijo Base64
            const base64Data = payload.firmas.firma_comprador.replace(/^data:image\/\w+;base64,/, "");
            const imageBuffer = Buffer.from(base64Data, 'base64');
            const signatureImage = await pdfDoc.embedPng(imageBuffer);

            // Obtener coordenadas dinámicas del campo 'firma_comprador'
            const signatureField = form.getTextField('firma_comprador');
            const widgets = signatureField.acroField.getWidgets();
            
            if (widgets.length > 0) {
                const sigRect = widgets[0].getRectangle();
                
                // Dibujar firma exactamente en el rectángulo del campo
                firstPage.drawImage(signatureImage, {
                    x: sigRect.x,
                    y: sigRect.y,
                    width: sigRect.width,
                    height: sigRect.height,
                });
                
                // Limpiar el texto auxiliar del campo de firma
                signatureField.setText(''); 
            }
        } catch (err) {
            console.error('Error procesando la firma:', err);
        }
    }

    // 6. Aplanado y Generación de Buffer Final
    form.flatten(); 
    const pdfBytes = await pdfDoc.save();

    // 7. Respuesta como PDF Binario
    res.setHeader('Content-Type', 'application/pdf');
    return res.status(200).send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('[Vercel API Error]:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error crítico al procesar el PDF.',
      details: error.message 
    });
  }
}
