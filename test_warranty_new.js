

function testPdfGeneration_warranty_new() {
  const JSON_PARAMETER = {
    "DOC_template_url": "https://docs.google.com/document/d/1jh8_hc8VmDR7OCXXsT_Q7X8lvU-RVYK9fHwTQXvWC50/edit?usp=sharing",
    "DOC_folder_save_url": "https://drive.google.com/drive/folders/1CXpsg5WnZMcDO2W_MGMjgBLek7YozHdn?usp=sharing",
    "DOC_file_save_name": "042-3WE-67-AKAbyGAEWARRANTY ",
    "Google_generate": 1,
    "Cloudinary_generate": 1,
    "Cloudinary_name": "no_name"
  }; // <--- CHECK THIS LINE. Is the } and ; there?

  const JSON_1to1 = {
    "CLIENT_5_LINES":"JOY CHACKO MOONNUPEEDIKAL HOUSE, THOTTAKAM,MATTOOR, YORDHANAPURAM,ALUVA,ERNAKULAM,KERALA-683574","Manufacturer_Name" : "Ningbo Deye ESS International Trade Co., Ltd","Factory_Address":"at No.18 th Zhenlong Road Longshan CIXI Ningbo, China","Warranty" : 10,"SN":"02203000D6070221" ,"DESCRIPTION_OFFICIAL" :"LV SE F5 PLUS Battery", "BUYER":"ENERGY LABZ", "Date_start":"2026-01-24 18:27:42.381000", "OrderNu" : "042-3WE-67-AKA"
  }; // <--- AND THIS ONE.

  const JSON_list = [{"r": 1, "MODEL NUMBER": "ASB-M10-144-545", "HSN": "85414300", "Unit": "watt", "Quantity": 6, "Rate_unit": 13734.0, "DESC_OFFICIAL": "ADANI Bifacial 545Wp DCR Module | 12 Years Warranty", "Taxable_amount": 82404.0}, {"r": 2, "MODEL NUMBER": "SUN-3K-G03P1", "HSN": "85044090", "Unit": "pc", "Quantity": 1, "Rate_unit": 14000.0, "DESC_OFFICIAL": "DEYE 3Kw 1Ph Ongrid Inverter  | 10 Years Warranty", "Taxable_amount": 14000.0}, {"r": 3, "MODEL NUMBER": "SO-DC-006M01", "HSN": "85362010", "Unit": "pc", "Quantity": 1, "Rate_unit": 1450.0, "DESC_OFFICIAL": "SUBSIDY - DCDB 1-6kW - 1 IN 1 OUT - 500V - 1 MCB & 1 SPD", "Taxable_amount": 1450.0}, {"r": 4, "MODEL NUMBER": "SO-A1-006M01", "HSN": "85362010", "Unit": "pc", "Quantity": 1, "Rate_unit": 1200.0, "DESC_OFFICIAL": "SUBSIDY - ACDB 1-6kW 1P.", "Taxable_amount": 1200.0}, {"r": 5, "MODEL NUMBER": "EXC-LAR1", "HSN": "39189090", "Unit": "pc", "Quantity": 1, "Rate_unit": 1200.0, "DESC_OFFICIAL": "EXCEL E. Lighting Arrestor 20x1000mm Muli Spike (1Mtrs)", "Taxable_amount": 1200.0}, {"r": 6, "MODEL NUMBER": "EXC-ROD1", "HSN": "39189090", "Unit": "pc", "Quantity": 2, "Rate_unit": 430.0, "DESC_OFFICIAL": "EXCEL E. Copper Bonded Rod 17.2x1220mm 100µ (1.2Mtrs)", "Taxable_amount": 860.0}, {"r": 7, "MODEL NUMBER": "EPC18X18", "HSN": "39189090", "Unit": "pc", "Quantity": 2, "Rate_unit": 330.0, "DESC_OFFICIAL": "EXCEL E. Earth Pit Chamber 18x18cm", "Taxable_amount": 660.0}, {"r": 8, "MODEL NUMBER": "EC10KG", "HSN": "38249917", "Unit": "pc", "Quantity": 1, "Rate_unit": 220.0, "DESC_OFFICIAL": "EXCEL E. Excel Earthing Compound 10Kgs", "Taxable_amount": 220.0}];


  const result = engine_pdf_vr2(JSON_1to1, JSON_list, JSON_PARAMETER);
  Logger.log(result);
}