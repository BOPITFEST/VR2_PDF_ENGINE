function testPdfGeneration_warranty_new() {
  const JSON_PARAMETER = {
    "DOC_template_url": "https://docs.google.com/document/d/1jh8_hc8VmDR7OCXXsT_Q7X8lvU-RVYK9fHwTQXvWC50/edit?usp=sharing",
    "DOC_folder_save_url": "https://drive.google.com/drive/folders/1CXpsg5WnZMcDO2W_MGMjgBLek7YozHdn?usp=sharing",
    "DOC_file_save_name": "044-2TU-02-ALB-WARRANTY",
    "Google_generate": 1,
    "Cloudinary_generate": 1,
    "Cloudinary_name": "2e291t2h350x1a2g1u2e201e1k05"
  }; // <--- CHECK THIS LINE. Is the } and ; there?

  const JSON_1to1 = {
  "CLIENT_5_LINES": "JOY CHACKO MOONNUPEEDIKAL HOUSE, \n THOTTAKAM,MATTOOR, YORDHANAPURAM,ALUVA, \n ERNAKULAM,KERALA-683574",
  "Warranty": 10,
  "SN": "02203000D6070221",
  "MODEL NUMBER":"SF-A10-1339",
  "DESCRIPTION_OFFICIAL": "LV SE F5 PLUS Battery",
  "BUYER": "ENERGY LABZ \n Ground, 1st and 2nd Floor, 97/80,\n Vanagaram Ambattur Road, Multi Infotech,\n Chennai - 600058",
  "Date_start": "2026-01-24 18:27:42.381000",
  "OrderNu": "042-3WE-67-AKA"
} // <--- AND THIS ONE.


  const result = engine_pdf_vr2(JSON_1to1,[] ,JSON_PARAMETER);
  Logger.log(result);
}