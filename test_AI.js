/**
 * 
 * IMPORTANT REMOVE HEADER and add [r] on table items 
 * 
 * call defaultdb.PDF_DOC_1to1('042-3WE-67-AKA');
 * call defaultdb.PDF_Order_detail('042-3WE-67-AKA');
 * call bop_SETUP.p_EPDF_format('quaici','%','%');
 */
function testPdfGeneration2() {
  const JSON_PARAMETER = {
    "DOC_template_url": "https://docs.google.com/document/d/1jTnk6d_lqTIW3TjWeg1m-lngxvJnZwtxhg9lvDVafKQ/edit?usp=sharing",
    "DOC_folder_save_url": "https://drive.google.com/drive/folders/1_iz8xZEMPcnyGr4KB4cwdzmKFzTWCOUt",
    "DOC_file_save_name": "042-6SA-20-ALB",//"042-3WE-67-AKA", //"042-6SA-20-ALB"
    "Google_generate": 1,
    "Cloudinary_generate": 1,
    "Cloudinary_name": "2e291t2h350x1a2g1u2e201e1k05",
    "quaici_gstin_table_remove_all_columns":1
  };
// call bop_SETUP.p_EPDF_format('quaici','%','%');
  // call defaultdb.PDF_DOC_1to1('042-3WE-67-AKA');
  const JSON_1to1 = {"Hub": null, "Status": 28, "SO_type": "AI", "ABT_city": "ERODE  TAMILNADU", "AST_city": "MADURAI  TAMILNADU", "AST_name": "SAFFRON TECHNOLOGY", "Incoterm": "EXW_PICKUP", "Revision": 0, "T_CGST_9": 1006.1999999999999, "T_CGST_T": 5826.4, "T_IGST_5": 0.0, "T_IGST_T": 0.0, "T_SGST_9": 1006.1999999999999, "T_SGST_T": 5826.4, "ABT_email": "", "ABT_gstin": "33FJXPS9189D2Z6", "ABT_line1": "94, KANAGAPURAM MAIN ROAD,", "ABT_line2": "LAKKAPURAM NALL ROAD, LAKKAPURAM PO", "ABT_phone": " 88074 21185", "AST_email": "", "AST_gstin": "33FJXPS9189D2Z6", "AST_line1": "Selvaraj nagr 3 street Kalmedu nagar", "AST_line2": "ilanamaur via Sakkimangalam", "AST_phone": " 88074 21185", "Price_ref": "* Equivalent per-Watt price is shown for reference purposes only.", "SO_Seller": "A", "T_IGST_18": 0.0, "Warehouse": "Madurai", "Qu_ai_date": null, "SO_orderNo": "042-6SA-20-ALB", "SO_saleman": "PKI", "T_CGST_2_5": 4820.2, "T_SGST_2_5": 4820.2, "orderNoOld": null, "ABT_pincode": "638002", "AST_pincode": "625201", "SO_PUT_ZERO": -0.40, "SO_createdAt": "2026-01-24 11:52:21.625000", "SO_gst_total": 0.0, "SO_orderDate": "2026-01-24 18:27:42.381000", "SO_type_name": "ADVANCE INVOICE", "ABT_stateCode": "TN", "ABT_stateName": "Tamil Nadu", "AST_stateCode": "TN", "AST_stateName": "Tamil Nadu", "SO_numberitem": 8, "SO_Taxed_total": 107820.0, "Transport_Type": "LB", "Mode_Of_Booking": "Customer Booking", "ABT_company_name": "SAFFRON TECHNOLOGY", "SO_Taxable_total": 107820.4, "SO_Taxed_total_bis": 107820.0, "Billing_Contact_Name": "Mr.PRASHANTH", "Shipping_Contact_Name": "Mr.SATHISH KUMAR"}
// call defaultdb.Vcard_list_component('042-3WE-67-AKA');
  const JSON_list = [{"r": 1, "MN": "ASB-M10-144-545", "HSN": "85414300", "Unit": "watt", "Quantity": 6, "Rate_unit": 13734.0, "DESC_OFFICIAL": "ADANI Bifacial 545Wp DCR Module | 12 Years Warranty", "Taxable_amount": 82404.0}, {"r": 2, "MN": "SUN-3K-G03P1", "HSN": "85044090", "Unit": "pc", "Quantity": 1, "Rate_unit": 14000.0, "DESC_OFFICIAL": "DEYE 3Kw 1Ph Ongrid Inverter  | 10 Years Warranty", "Taxable_amount": 14000.0}, {"r": 3, "MN": "SO-DC-006M01", "HSN": "85362010", "Unit": "pc", "Quantity": 1, "Rate_unit": 1450.0, "DESC_OFFICIAL": "SUBSIDY - DCDB 1-6kW - 1 IN 1 OUT - 500V - 1 MCB & 1 SPD", "Taxable_amount": 1450.0}, {"r": 4, "MN": "SO-A1-006M01", "HSN": "85362010", "Unit": "pc", "Quantity": 1, "Rate_unit": 1200.0, "DESC_OFFICIAL": "SUBSIDY - ACDB 1-6kW 1P.", "Taxable_amount": 1200.0}, {"r": 5, "MN": "EXC-LAR1", "HSN": "39189090", "Unit": "pc", "Quantity": 1, "Rate_unit": 1200.0, "DESC_OFFICIAL": "EXCEL E. Lighting Arrestor 20x1000mm Muli Spike (1Mtrs)", "Taxable_amount": 1200.0}, {"r": 6, "MN": "EXC-ROD1", "HSN": "39189090", "Unit": "pc", "Quantity": 2, "Rate_unit": 430.0, "DESC_OFFICIAL": "EXCEL E. Copper Bonded Rod 17.2x1220mm 100µ (1.2Mtrs)", "Taxable_amount": 860.0}, {"r": 7, "MN": "EPC18X18", "HSN": "39189090", "Unit": "pc", "Quantity": 2, "Rate_unit": 330.0, "DESC_OFFICIAL": "EXCEL E. Earth Pit Chamber 18x18cm", "Taxable_amount": 660.0}, {"r": 8, "MN": "EC10KG", "HSN": "38249917", "Unit": "pc", "Quantity": 1, "Rate_unit": 220.0, "DESC_OFFICIAL": "EXCEL E. Excel Earthing Compound 10Kgs", "Taxable_amount": 220.0}];
  const result = engine_pdf_vr2(JSON_1to1, JSON_list, JSON_PARAMETER);
  Logger.log(result);
}