/**
 * ============================================================================
 * PDF GENERATOR - COMPLETE ALL-IN-ONE VERSION (FIXED)
 * ============================================================================
 * This file contains all functions needed for PDF generation with:
 * - Text placeholder replacement with inline formatting [key(FORMAT)]
 * - Table row cloning and population
 * - GST column removal
 * - Image/QR code replacement
 * - Formatting utilities (INR, dates, phone numbers, etc.)
 * 
 * FIX: Resolved "Service Documents failed while accessing document" error
 * by ensuring document is properly saved before PDF conversion
 * ============================================================================
 */

/**
 * Main function to generate PDF from JSON parameters
 * @param {Object} JSON_1to1 - Object with key-value pairs for placeholder replacement
 * @param {Array} JSON_list - Array of objects for table row generation
 * @param {Object} JSON_PARAMETER - Configuration object with URLs and settings
 * @param {Array} JSON_IMG_QR - Array of image replacements (optional)
 */

// Debug Logs Global
var DEBUG_LOGS = [];
function log(msg) {
    console.log(msg);
    Logger.log(msg);
    DEBUG_LOGS.push(msg);
}
/**
 * Helper function to fetch parameters from DB
 */
function fetchWarrantyParameters(orderNo, subBu, envProduction, docType) {
    try {
        const conn = VR2_MYSQL_v20.VR2_openConn("0_PRODbop");
        if (!conn) throw new Error("Failed to open DB connection");
        // Call stored procedure: sp_war_json_parameter(p_orderNo, p_sub_bu, p_env_production, p_doc_type)
        const finalSubBu = subBu || 2;
        const finalEnv = envProduction || 1;
        const finalDocType = docType || 'WAR';  // Default to WAR (Warranty)
        Logger.log("Fetching doc_type: " + finalDocType + " for order: " + orderNo);
        const data = VR2_MYSQL_v20.VR2_MYSQL_Universal_JSON(
            conn,
            "sp_war_json_parameter",
            "defaultdb",
            [orderNo, finalSubBu, finalEnv, finalDocType]  // ADDED 4th parameter
        );
        VR2_MYSQL_v20.VR2_closeConn();
        return data;
    } catch (e) {
        Logger.log("DB Fetch Error: " + e.toString());
        return null;
    }
}
/**
 * GET Request Handler
 */
function doGet(e) {
    try {
        if (!e || !e.parameter) {
            throw new Error("No parameters received");
        }
        const parseJSON = (val, fallback) => {
            if (!val) return fallback;
            try {
                return JSON.parse(val);
            } catch (err) {
                throw new Error("Invalid JSON: " + val);
            }
        };
        const JSON_1to1 = parseJSON(e.parameter.json_1to1, {});
        const JSON_list = parseJSON(e.parameter.json_list, []);
        // JSON_PARAMETER will be fetched from DB
        const JSON_IMG_QR = parseJSON(e.parameter.json_img_qr, []);
        // 1. Get Order Number from the payload
        const orderNo = JSON_1to1.OrderNu || JSON_1to1.orderNumber; // Adjust key as per your frontend
        if (!orderNo) {
            throw new Error("Missing Order Number (OrderNu) in json_1to1");
        }
        // 2. Fetch Parameters from DB
        log("Fetching parameters for Order: " + orderNo);
        const dbData = fetchWarrantyParameters(orderNo, 2, 1, 'WAR');  // Explicitly request WAR template
        // 3. Validation
        if (!dbData || Object.keys(dbData).length === 0) {
            throw new Error("Invalid Order Number: " + orderNo + ". Please check and try again.");
        }
        // 4. Use DB Parameters
        // If the SP returns a structure like { "DOC_template_url":... }, use it directly.
        // If it returns { "parameters": {...} }, use dbData.parameters.
        // Based on the stored proc definition, it returns the JSON object directly in 'result_json'.
        // The VR2 library usually returns the parsed JSON. 
        // If dbData HAS 'parameters' property, use it, else use dbData itself if it fits.
        // Checking previous user snippet: const JSON_PARAMETER =data['parameters'];
        // Let's try to be robust.
        const JSON_PARAMETER = dbData['parameters'] || dbData;
        // Additional Validation
        if (!JSON_PARAMETER.DOC_template_url || !JSON_PARAMETER.DOC_folder_save_url) {
            throw new Error("DB Configuration missing DOC_template_url or DOC_folder_save_url for Order: " + orderNo);
        }
        const result = engine_pdf_vr2(
            JSON_1to1,
            JSON_list,
            JSON_PARAMETER,
            JSON_IMG_QR
        );
        result.logs = DEBUG_LOGS;
        return ContentService
            .createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({
                success: false,
                error: error.message || error.toString(),
                logs: DEBUG_LOGS
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
/**
 * POST Request Handler
 */
function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);
    try {
        Logger.log("Received POST request");
        var data = JSON.parse(e.postData.contents);
        var JSON_1to1 = data;
        const JSON_list = data['list'] || [];
        // 1. Get Order Number
        const orderNo = JSON_1to1.OrderNu || JSON_1to1.orderNumber;
        if (!orderNo) {
            throw new Error("Missing OrderNu in request data");
        }
        // 2. Fetch from DB
        Logger.log("Calling DB for Order: " + orderNo);
        const dbData = fetchWarrantyParameters(orderNo, 2, 1, 'WAR');  // Explicitly request WAR template
        // 3. Validate
        if (!dbData || Object.keys(dbData).length === 0) {
            throw new Error("Invalid Order Number. Database returned no config for: " + orderNo);
        }
        // DEBUG: Log the raw DB response
        Logger.log("Raw DB Data: " + JSON.stringify(dbData));
        // 4. Set Parameters
        // The stored procedure returns JSON_OBJECT(...) AS result_json
        // VR2_MYSQL_Universal_JSON might return it as { result_json: "..." } or already parsed
        let JSON_PARAMETER;
        if (dbData.result_json) {
            // If result_json is a string, parse it
            if (typeof dbData.result_json === 'string') {
                JSON_PARAMETER = JSON.parse(dbData.result_json);
            } else {
                JSON_PARAMETER = dbData.result_json;
            }
        } else if (dbData.parameters) {
            JSON_PARAMETER = dbData.parameters;
        } else {
            // Assume dbData itself is the parameters
            JSON_PARAMETER = dbData;
        }
        Logger.log("Parsed JSON_PARAMETER: " + JSON.stringify(JSON_PARAMETER));
        // FORCE Google_generate to 1 to ensure PDF is created
        if (JSON_PARAMETER.Google_generate === undefined) {
            JSON_PARAMETER.Google_generate = 1;
        }
        if (!JSON_PARAMETER.DOC_template_url) {
            throw new Error("DB returned invalid parameters (missing DOC_template_url)");
        }
        Logger.log("Calling PDF Engine...");
        var pdfResult = engine_pdf_vr2(JSON_1to1, JSON_list, JSON_PARAMETER);
        Logger.log("PDF Engine finished. Success: " + pdfResult.success);
        var response = {
            "result": pdfResult.success ? "success" : "error",
            "error": pdfResult.error,
            "pdfUrl": pdfResult.pdfUrl,
            "cloudinaryUrl": pdfResult.cloudinaryUrl,
            "docName": pdfResult.docName,
            "logs": DEBUG_LOGS
        };
        // ADDED LOGGING HERE
        Logger.log("Final Response: " + JSON.stringify(response));
        return ContentService.createTextOutput(JSON.stringify(response))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (e) {
        Logger.log("CRITICAL ERROR: " + e.toString());
        return ContentService.createTextOutput(JSON.stringify({
            "result": "error",
            "error": e.toString(),
            "logs": DEBUG_LOGS
        })).setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}


function engine_pdf_vr2(JSON_1to1, JSON_list, JSON_PARAMETER, JSON_IMG_QR) {
  let doc = null;
  let docCopy = null;

  try {
    Logger.log("Starting PDF generation...");
    const templateId = extractDocId(JSON_PARAMETER.DOC_template_url);
    const folderId = extractFolderId(JSON_PARAMETER.DOC_folder_save_url);
    if (!templateId || !folderId) {
      throw new Error("Invalid template or folder URL");
    }
    let templateFile;
    try {
      templateFile = DriveApp.getFileById(templateId);
      Logger.log("Template file found: " + templateFile.getName());
    } catch (e) {
      throw new Error("Template document not found: " + templateId);
    }
    const folder = DriveApp.getFolderById(folderId);
    Logger.log("Folder found: " + folder.getName());
    const tempName = "TEMP_" + new Date().getTime();
    Logger.log("Creating copy: " + tempName);
    docCopy = templateFile.makeCopy(tempName, folder);
    const docCopyId = docCopy.getId(); // Store the ID separately
    Logger.log("Copy created: " + docCopy.getName());
    doc = DocumentApp.openById(docCopyId);
    const body = doc.getBody();
    replacePlaceholders(body, JSON_1to1);
    if (JSON_list && JSON_list.length > 0) {
      processTableRows(body, JSON_list);
    }
    const removeGSTColumns = JSON_PARAMETER.quaici_gstin_table_remove_all_columns === 1;
    if (removeGSTColumns) {
      Logger.log("[GST] Removing unused columns...");
      handleGSTColumns(body, JSON_1to1);
    }
    if (JSON_IMG_QR && JSON_IMG_QR.length > 0) {
      Logger.log("[IMG] Replacing " + JSON_IMG_QR.length + " images...");
      replaceImagesInDoc(doc, JSON_IMG_QR);
    }
    // Remove leftover placeholders (safe version using replaceText)
    removeLeftoverPlaceholders(doc);
    const finalName = JSON_PARAMETER.DOC_file_save_name || "Generated_Document";
    doc.setName(finalName);
    doc.saveAndClose();
    Logger.log("Document saved: " + finalName);

    let pdfFile = null;
    let pdfBlob = null;
    let cloudinaryResult = null;

    if (JSON_PARAMETER.Google_generate == 1) {
      const pdf = DriveApp.getFileById(docCopyId).getAs("application/pdf").setName(finalName + ".pdf");
      pdfFile = folder.createFile(pdf);
      pdfBlob = pdf;
      Logger.log("PDF created: " + pdfFile.getName());
    }
    if (JSON_PARAMETER.Cloudinary_generate == 1 && pdfBlob) {
      // NOTE: Cloudinary upload function 'VR2_DEV_Cloudnary' is referenced but not defined in this snippet.
      // If you have a library for this, ensure it's included. 
      // If not, this part will fail if Cloudinary_generate is 1.
      try {
        cloudinaryResult = VR2_DEV_Cloudnary.uploadOrReplacePDF(pdfBlob, JSON_PARAMETER.Cloudinary_name);
        Logger.log("Cloudinary uploaded");
      } catch (cErr) {
        Logger.log("Cloudinary Upload Failed or Library missing: " + cErr.toString());
      }
    }

    DriveApp.getFileById(docCopyId).setTrashed(true);
    return {
      success: true,
      pdfUrl: pdfFile ? pdfFile.getUrl() : null,
      cloudinaryUrl: cloudinaryResult?.secure_url || cloudinaryResult?.url || null,
      docName: finalName
    };
  } catch (error) {
    Logger.log("ERROR: " + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}
/**
 * Replace all placeholders with inline formatting support
 * Supports: [key] and [key(FORMAT)]
 */
function replacePlaceholders(body, JSON_1to1) {
  replaceInElement(body, JSON_1to1);
  const doc = body.getParent();
  const header = doc.getHeader();
  const footer = doc.getFooter();
  if (header) replaceInElement(header, JSON_1to1);
  if (footer) replaceInElement(footer, JSON_1to1);
}
function replaceInElement(element, dataObject) {
  const text = element.editAsText().getText();
  const placeholderRegex = /\[([^,()\]]+)(?:[,(]([^)]+)\)?)?\]/g;
  let match;
  const replacements = [];
  while ((match = placeholderRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const key = match[1].trim();
    const format = match[2] ? match[2].trim() : null;
    if (dataObject.hasOwnProperty(key)) {
      const rawValue = dataObject[key];
      const transform = transformValue(rawValue, format, key)
      if (!(transform === '' && (format === 'IN2'||format === 'D'))) {
        const formattedValue = format ? transform : String(rawValue || "");
        replacements.push({
          placeholder: fullMatch,
          value: formattedValue
        });
      }
    }
  }
  for (const replacement of replacements) {
    element.replaceText(escapeRegExp(replacement.placeholder), replacement.value);
  }
}
function processTableRows(body, JSON_list) {
  const tables = body.getTables();
  if (tables.length === 0) return;
  let targetTable = null;
  let templateRowIndex = -1;
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    const tableText = table.getText();
    if (JSON_list.length > 0) {
      const firstItemKeys = Object.keys(JSON_list[0]);
      for (const key of firstItemKeys) {
        if (tableText.includes("[" + key + "]") || tableText.includes("[" + key + "(")) {
          targetTable = table;
          break;
        }
      }
    }
    if (targetTable) break;
  }
  if (!targetTable) return;
  for (let r = 0; r < targetTable.getNumRows(); r++) {
    const rowText = targetTable.getRow(r).getText();
    if (rowText.includes("[")) {
      templateRowIndex = r;
      break;
    }
  }
  if (templateRowIndex === -1) return;
  const templateRow = targetTable.getRow(templateRowIndex);
  for (let i = 0; i < JSON_list.length; i++) {
    const item = JSON_list[i];
    const newRow = cloneTableRow(targetTable, templateRow);
    for (let c = 0; c < newRow.getNumCells(); c++) {
      const cell = newRow.getCell(c);
      replacePlaceholdersInCell(cell, item);
    }
  }
  targetTable.removeRow(templateRowIndex);
}
function handleGSTColumns(body, formattedData) {
  const tables = body.getTables();
  const igstTotal = parseFloat(formattedData.T_IGST_T || 0);
  let taxTableIndex = -1;
  for (let t = 0; t < tables.length; t++) {
    const tableText = tables[t].getText();
    if (tableText.includes("CGST") || tableText.includes("SGST") || tableText.includes("IGST")) {
      taxTableIndex = t;
      break;
    }
  }
  if (taxTableIndex === -1 && tables.length > 2) {
    taxTableIndex = 2;
  }
  if (taxTableIndex === -1) return;
  const taxTable = tables[taxTableIndex];
  for (let r = taxTable.getNumRows() - 1; r >= 0; r--) {
    const row = taxTable.getRow(r);
    if (igstTotal === 0) {
      if (row.getNumCells() > 5) row.removeCell(5);
      if (row.getNumCells() > 4) row.removeCell(4);
    } else {
      if (row.getNumCells() > 3) {
        for (let c = 3; c >= 0; c--) {
          if (row.getNumCells() > c) row.removeCell(c);
        }
      }
    }
  }
  Logger.log("[GST] Columns removed successfully");
}
function cloneTableRow(table, sourceRow) {
  const newRow = table.appendTableRow();
  for (let i = 0; i < sourceRow.getNumCells(); i++) {
    const sourceCell = sourceRow.getCell(i);
    let newCell;
    if (i < newRow.getNumCells()) {
      newCell = newRow.getCell(i);
    } else {
      newCell = newRow.appendTableCell();
    }
    const sourceText = sourceCell.editAsText();
    const newText = newCell.editAsText();
    const text = sourceText.getText();
    newText.setText(text);
    for (let charIndex = 0; charIndex < text.length; charIndex++) {
      try {
        const bold = sourceText.isBold(charIndex);
        const italic = sourceText.isItalic(charIndex);
        const underline = sourceText.isUnderline(charIndex);
        const fontSize = sourceText.getFontSize(charIndex);
        const fontFamily = sourceText.getFontFamily(charIndex);
        const fgColor = sourceText.getForegroundColor(charIndex);
        const bgColor = sourceText.getBackgroundColor(charIndex);
        if (bold !== null) newText.setBold(charIndex, charIndex, bold);
        if (italic !== null) newText.setItalic(charIndex, charIndex, italic);
        if (underline !== null) newText.setUnderline(charIndex, charIndex, underline);
        if (fontSize) newText.setFontSize(charIndex, charIndex, fontSize);
        if (fontFamily) newText.setFontFamily(charIndex, charIndex, fontFamily);
        if (fgColor) newText.setForegroundColor(charIndex, charIndex, fgColor);
        if (bgColor) newText.setBackgroundColor(charIndex, charIndex, bgColor);
      } catch (e) { }
    }
    try {
      const cellBgColor = sourceCell.getBackgroundColor();
      if (cellBgColor) newCell.setBackgroundColor(cellBgColor);
    } catch (e) { }
    try {
      const width = sourceCell.getWidth();
      if (width) newCell.setWidth(width);
    } catch (e) { }
    try {
      const vAlign = sourceCell.getVerticalAlignment();
      if (vAlign) newCell.setVerticalAlignment(vAlign);
    } catch (e) { }
    try {
      const paddingTop = sourceCell.getPaddingTop();
      const paddingBottom = sourceCell.getPaddingBottom();
      const paddingLeft = sourceCell.getPaddingLeft();
      const paddingRight = sourceCell.getPaddingRight();
      if (paddingTop !== null && paddingTop !== undefined) {
        newCell.setPaddingTop(paddingTop);
      }
      if (paddingBottom !== null && paddingBottom !== undefined) {
        newCell.setPaddingBottom(paddingBottom);
      }
      if (paddingLeft !== null && paddingLeft !== undefined) {
        newCell.setPaddingLeft(paddingLeft);
      }
      if (paddingRight !== null && paddingRight !== undefined) {
        newCell.setPaddingRight(paddingRight);
      }
    } catch (e) { }
    try {
      if (sourceCell.getNumChildren() > 0 && newCell.getNumChildren() > 0) {
        const sourcePara = sourceCell.getChild(0);
        const newPara = newCell.getChild(0);
        if (sourcePara.getType() === DocumentApp.ElementType.PARAGRAPH &&
          newPara.getType() === DocumentApp.ElementType.PARAGRAPH) {
          const alignment = sourcePara.getAlignment();
          if (alignment) newPara.setAlignment(alignment);
          try {
            const lineSpacing = sourcePara.getLineSpacing();
            if (lineSpacing) newPara.setLineSpacing(lineSpacing);
          } catch (e) { }
          try {
            const spacingBefore = sourcePara.getSpacingBefore();
            const spacingAfter = sourcePara.getSpacingAfter();
            if (spacingBefore !== null) newPara.setSpacingBefore(spacingBefore);
            if (spacingAfter !== null) newPara.setSpacingAfter(spacingAfter);
          } catch (e) { }
          try {
            const indentStart = sourcePara.getIndentStart();
            const indentEnd = sourcePara.getIndentEnd();
            const indentFirstLine = sourcePara.getIndentFirstLine();
            if (indentStart !== null && indentStart !== undefined) {
              newPara.setIndentStart(indentStart);
            }
            if (indentEnd !== null && indentEnd !== undefined) {
              newPara.setIndentEnd(indentEnd);
            }
            if (indentFirstLine !== null && indentFirstLine !== undefined) {
              newPara.setIndentFirstLine(indentFirstLine);
            }
          } catch (e) { }
        }
      }
    } catch (e) { }
  }
  try {
    const minHeight = sourceRow.getMinimumHeight();
    if (minHeight) newRow.setMinimumHeight(minHeight);
  } catch (e) { }
  return newRow;
}
function replacePlaceholdersInCell(cell, dataObject) {
  const cellText = cell.editAsText();
  let text = cellText.getText();
  const placeholderRegex = /\[([^,()\]]+)(?:[,(]([^)]+)\)?)?\]/g;
  let match;
  const replacements = [];
  while ((match = placeholderRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const key = match[1].trim();
    const format = match[2] ? match[2].trim() : null;
    if (dataObject.hasOwnProperty(key)) {
      const rawValue = dataObject[key];
      const transform = transformValue(rawValue, format, key)
      if (!(transform === '' && (format === 'IN2'||format === 'D'))) {
        const formattedValue = format ? transformValue(rawValue, format, key) : String(rawValue || "");
        replacements.push({
          placeholder: fullMatch,
          value: formattedValue,
          index: match.index
        });
      }
    }
  }
  // Apply replacements
  replacements.sort((a, b) => b.index - a.index);
  for (const replacement of replacements) {
    const startIndex = replacement.index;
    const endIndex = startIndex + replacement.placeholder.length - 1;
    cellText.deleteText(startIndex, endIndex);
    cellText.insertText(startIndex, replacement.value);
  }
}
/**
 * Safely removes all remaining placeholders using replaceText (preserves formatting)
 * Also removes preceding commas, spaces, newlines, and line breaks (Shift+Enter)
 */
function removeLeftoverPlaceholders(doc) {
  const body = doc.getBody();
  const header = doc.getHeader();
  const footer = doc.getFooter();
  // Pattern to match placeholders with optional preceding:
  // - comma (,)
  // - spaces (\s)
  // - newlines (\n, \r)
  // - line breaks/vertical tabs (\v, \u000B) - Google Docs Shift+Enter
  const pattern = "[,\\s\\n\\r\\v]*\\[[^\\]]+\\]";

  // Remove from body
  body.replaceText(pattern, "");

  // Remove from header
  if (header) {
    header.replaceText(pattern, "");
  }

  // Remove from footer
  if (footer) {
    footer.replaceText(pattern, "");
  }

  // Remove from tables
  const tables = body.getTables();
  for (let t = 0; t < tables.length; t++) {
    const table = tables[t];
    for (let r = 0; r < table.getNumRows(); r++) {
      const row = table.getRow(r);
      for (let c = 0; c < row.getNumCells(); c++) {
        const cell = row.getCell(c);
        cell.replaceText(pattern, "");
      }
    }
  }

  Logger.log("[CLEANUP] Leftover placeholders removed");
}
function extractDocId(url) {
  if (!url) return null;
  const cleanUrl = url.split('?')[0].split('#')[0];
  const match = cleanUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const docId = match ? match[1] : null;
  Logger.log("Extracted Doc ID: " + docId);
  return docId;
}
function extractFolderId(url) {
  if (!url) return null;
  const folderMatch = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);
  return folderMatch ? folderMatch[1] : null;
}
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/**
 * IMAGE REPLACEMENT FUNCTIONS
 */
function replaceImagesInDoc(doc, JSON_IMG_QR) {
  for (let i = 0; i < JSON_IMG_QR.length; i++) {
    const imgConfig = JSON_IMG_QR[i];
    const imageOccurrence = imgConfig.imageOccurrence;
    const replacementType = imgConfig.replacementType;
    const replacementValue = imgConfig.replacementValue;
    const replacementBlob = getReplacementImageBlob(replacementType, replacementValue);
    let imageCount = 0;
    if (doc.getHeader()) {
      imageCount = scanSectionForImage(doc.getHeader(), replacementBlob, imageCount, imageOccurrence);
    }
    if (imageCount < imageOccurrence) {
      imageCount = scanSectionForImage(doc.getBody(), replacementBlob, imageCount, imageOccurrence);
    }
    if (doc.getFooter() && imageCount < imageOccurrence) {
      imageCount = scanSectionForImage(doc.getFooter(), replacementBlob, imageCount, imageOccurrence);
    }
    if (imageCount < imageOccurrence) {
      Logger.log("[IMG] Warning: Image #" + imageOccurrence + " not found");
    }
  }
}
function getReplacementImageBlob(type, value) {
  if (type === 'QR') {
    const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(value);
    return UrlFetchApp.fetch(qrUrl).getBlob().setName('qr.png');
  }
  if (type === 'URL') {
    return UrlFetchApp.fetch(value).getBlob();
  }
  throw new Error('Invalid replacementType. Use QR or URL');
}
function scanSectionForImage(section, blob, imageCount, targetIndex) {
  for (let i = 0; i < section.getNumChildren(); i++) {
    const child = section.getChild(i);
    if (child.getType() === DocumentApp.ElementType.PARAGRAPH) {
      imageCount = scanParagraphForImage(child.asParagraph(), blob, imageCount, targetIndex);
    }
    if (child.getType() === DocumentApp.ElementType.TABLE) {
      const table = child.asTable();
      for (let r = 0; r < table.getNumRows(); r++) {
        for (let c = 0; c < table.getRow(r).getNumCells(); c++) {
          const cell = table.getRow(r).getCell(c);
          for (let k = 0; k < cell.getNumChildren(); k++) {
            if (cell.getChild(k).getType() === DocumentApp.ElementType.PARAGRAPH) {
              imageCount = scanParagraphForImage(cell.getChild(k).asParagraph(), blob, imageCount, targetIndex);
            }
          }
        }
      }
    }
    if (imageCount >= targetIndex) return imageCount;
  }
  return imageCount;
}
function scanParagraphForImage(paragraph, blob, imageCount, targetIndex) {
  for (let i = 0; i < paragraph.getNumChildren(); i++) {
    const el = paragraph.getChild(i);
    if (el.getType() === DocumentApp.ElementType.INLINE_IMAGE) {
      imageCount++;
      if (imageCount === targetIndex) {
        const oldImg = el.asInlineImage();
        const newImg = paragraph.insertInlineImage(i, blob);
        newImg.setWidth(oldImg.getWidth());
        newImg.setHeight(oldImg.getHeight());
        oldImg.removeFromParent();
        return imageCount;
      }
    }
  }
  return imageCount;
}
/**
 * FORMATTING UTILITIES
 */
function transformValue(value, format, fieldKey) {
  if (!format) return String(value || "");
  try {
    const formatUpper = format.toUpperCase();
    switch (formatUpper) {
      case "INRWORD":
        return convertToIndianWords(Number(value));
      case "INR":
        return formatCurrency(Number(value), 0);
      case "INR2":
        return formatCurrency(Number(value), 2);
      case "IN2":
        return formatCurrency(Number(value), 2, 0);
      case "ZERO":
        return (value === undefined || value === null || String(value).trim() === "") ? 0 : value;
      case "UPPER":
        return String(value).toUpperCase();
      case "LOWER":
        return String(value).toLowerCase();
      case "%":
        return parseFloat(value) * 100 + "%";
      case "DD_MMMM_YYYY":
        return formatDateIndian(new Date(value), "DD_MMMM_YYYY");
      case "EEEE_DD_MMMM_YYYY":
        return formatDateIndian(new Date(value), "EEEE_DD_MMMM_YYYY");
      case "DDD_DD_MMMM_YYYY":
        return formatDateIndian(new Date(value), "DDD_DD_MMMM_YYYY");
      case "PHONE_IN":
        var phone = String(value || "").trim();
        phone = phone.replace(/^'+/, "");
        phone = phone.replace(/[^\d+]/g, "");
        if (phone.startsWith("+91")) {
          phone = phone.slice(3);
        } else if (phone.startsWith("91") && phone.length > 10) {
          phone = phone.slice(2);
        }
        var last10 = phone.slice(-10);
        return last10.length === 10 ? last10 : phone;
      default:
        return String(value || "");
    }
  } catch (err) {
    Logger.log("[FORMAT ERROR] " + fieldKey + ": " + value + " (" + format + ") - " + err);
    return String(value || "");
  }
}
function convertToIndianWords(num) {
  if (typeof num !== 'number' || isNaN(num)) return "";
  var ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"];
  var tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function getWordsHelper(n) {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
  }
  num = Math.floor(num);
  var parts = [
    [Math.floor(num / 10000000), "Crore"],
    [Math.floor((num % 10000000) / 100000), "Lakh"],
    [Math.floor((num % 100000) / 1000), "Thousand"],
    [Math.floor((num % 1000) / 100), "Hundred"]
  ];
  var remaining = num % 100;
  var result = "";
  for (var i = 0; i < parts.length; i++) {
    if (parts[i][0] > 0) {
      result += (result ? " " : "") + getWordsHelper(parts[i][0]) + " " + parts[i][1];
    }
  }
  if (remaining > 0) {
    result += (result ? " " : "") + getWordsHelper(remaining);
  }
  return result.trim() + " Rupees Only";
}
function formatCurrency(amount, decimals, Zero_visible = 1) {
  if (amount === null || amount === undefined) return "";
  var num = Number(amount);
  // 2. Handle NaN
  if (isNaN(num)) return "";
  // 3. Handle Zero visibility logic
  if (num === 0 && Zero_visible === 0) {
    return "";
  }
  var fixed = num.toFixed(decimals);
  var parts = fixed.split('.');
  var integerPart = parts[0];
  var decimalPart = parts[1];
  var lastThree = integerPart.slice(-3);
  var otherNumbers = integerPart.slice(0, -3);
  var formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") +
    (otherNumbers ? "," : "") + lastThree;
  return "₹" + formattedInteger + (decimals > 0 ? "." + decimalPart : "");
}
function formatDateIndian(date, type) {
  var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var fullDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  if (!(date instanceof Date) || isNaN(date.getTime())) return "Invalid Date";
  var dd = String(date.getDate()).padStart(2, '0');
  var day = date.getDay();
  var yyyy = date.getFullYear();
  var mmmm = months[date.getMonth()];
  var ddd = days[day];
  var eeee = fullDays[day];
  switch (type) {
    case "DD_MMMM_YYYY":
      return dd + " " + mmmm + " " + yyyy;
    case "DDD_DD_MMMM_YYYY":
      return ddd + " " + dd + " " + mmmm + " " + yyyy;
    case "EEEE_DD_MMMM_YYYY":
      return eeee + " " + dd + " " + mmmm + " " + yyyy;
    default:
      return dd + " " + mmmm + " " + yyyy;
  }
}