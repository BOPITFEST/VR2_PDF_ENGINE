function testPdfGeneration_warranty() {
  const JSON_PARAMETER = {
    "DOC_template_url": "https://docs.google.com/document/d/1jh8_hc8VmDR7OCXXsT_Q7X8lvU-RVYK9fHwTQXvWC50/edit?usp=sharing",
    "DOC_folder_save_url": "https://drive.google.com/drive/folders/1CXpsg5WnZMcDO2W_MGMjgBLek7YozHdn?usp=sharing",
    "DOC_file_save_name": "042-3WE-67-AKA",
    "Google_generate": 1,
    "Cloudinary_generate": 0,
    "Cloudinary_name": "no_name"
  }; // <--- CHECK THIS LINE. Is the } and ; there?



  const JSON_1to1 = {
  
    "Customer_Name": "JOY CHACKO",
    "Customer_Address": "MOONNUPEEDIKAL HOUSE, \n THOTTAKAM,MATTOOR, \n YORDHANAPURAM,ALUVA,ERNAKULAM,\n KERALA-683574",
    // "Manufacturer_Name": "Ningbo Deye ESS International Trade Co., Ltd",
    // "Factory_Address": "at No.18 th Zhenlong Road Longshan CIXI Ningbo, China",
    "Warranty_Years": 10,
    "SN": "02203000D6070221",
    "DESCRIPTION_OFFICIAL": "LV SE F5 PLUS Battery",
    "Dealer_Name": "ENERGY LABZ",
    "Invoice_Date": "2026-01-24 18:27:42.381000" //format date
    // "Invoice_Number": "042-3WE-67-AKA"

}; // <--- AND THIS ONE.

// Line 12 should be fine now
const JSON_list = [{ r: 1, price: 13432 }];
const result = engine_pdf_vr2(JSON_1to1, JSON_list, JSON_PARAMETER);
Logger.log(result);
}