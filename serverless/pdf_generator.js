/**
 * RENEW WATER - PDF Generator Service v3.1
 * Plantilla: confirmaciondeordenv1.pdf
 * Author: Antigravity Backend Senior
 */

const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

exports.handler = async (req, res) => {
  try {
    const payload = req.body;

    // 1. Cargar Plantilla (Ruta relativa a la raíz del proyecto)
    // En producción AntiGravity, asegúrate de que el PDF se suba junto al script.
    const templatePath = path.join(__dirname, '../confirmaciondeordenv1.pdf');
    if (!fs.existsSync(templatePath)) {
      throw new Error(`No se encontró el archivo confirmaciondeordenv1.pdf en la ruta: ${templatePath}`);
    }
    
    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // --- RELLENADO DE CAMPOS DE TEXTO (Mapping) ---
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
      'serial_system': payload.equipos.serial_renew,
      'serial_alkaline': payload.equipos.serial_alkaline,
      'serial_well': payload.equipos.serial_well,
      'txt_other': payload.equipos.other_text,
      'led_iniciales': payload.preguntas.led_iniciales,
      'lugar_iniciales': payload.preguntas.lugar_iniciales,
      'clima_iniciales': payload.preguntas.clima_iniciales,
      'costo_inst': `$${payload.costos.instalacion}`,
      'costo_millas': `$${payload.costos.millas}`,
      'costo_extra': `$${payload.costos.extra}`,
      'costo_otro': `$${payload.costos.otro}`,
      'costo_total': `$${payload.costos.total}`,
      'fecha_firma': payload.firmas.fecha_firma
    };

    Object.entries(textMappings).forEach(([fieldName, value]) => {
      try {
        const field = form.getTextField(fieldName);
        field.setText(value?.toString() || '');
      } catch (e) {}
    });

    // --- LÓGICA DE CHECKBOXES FALSOS ('X') ---
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
            const base64Data = payload.firmas.firma_comprador.replace(/^data:image\/\w+;base64,/, "");
            const imageBuffer = Buffer.from(base64Data, 'base64');
            const signatureImage = await pdfDoc.embedPng(imageBuffer);

            // Localizar el campo firma_comprador en el PDF
            const signatureField = form.getTextField('firma_comprador');
            const widgets = signatureField.acroField.getWidgets();
            
            if (widgets.length > 0) {
                const sigRect = widgets[0].getRectangle();
                firstPage.drawImage(signatureImage, {
                    x: sigRect.x,
                    y: sigRect.y,
                    width: sigRect.width,
                    height: sigRect.height,
                });
                signatureField.setText(''); // Limpiar el cursor/texto del campo area
            }
        } catch (err) {
            console.error('Error al incrustar la firma:', err);
        }
    }

    // 6. Cierre y Respuesta
    form.flatten(); // Bloquear edición
    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    return res.status(200).send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('[FATAL ERROR]:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
