function testPdfGeneration_Sticker() {
  const JSON_PARAMETER = {
    "DOC_template_url": "https://docs.google.com/document/d/1aHqvDsQrseCGiZpPh8vh5k5i5_krVrPb9ThD3XzL3VI/edit?usp=sharing",
    "DOC_folder_save_url": "https://drive.google.com/drive/folders/1sVu6HsXgS43KGYpTxvlHhQyVQr4--Dic?usp=sharing",
    "DOC_file_save_name": "042-6SA-20-ALB",
    "Google_generate": 1,
    "Cloudinary_generate": 1,
    "Cloudinary_name": "2e291t2h350x1a2g1u2e201e1k05"
  }; // <--- CHECK THIS LINE. Is the } and ; there?

  const JSON_1to1 = {
   "SO_orderNo": "042-6SA-20-ALB", "SO_saleman": "PKI", "SO_orderDate": "2026-01-24 18:27:42.381000", "AST_gstin": "33FJXPS9189D2Z6","AST_company_name": "SAFFRON TECHNOLOGY", "AST_line1": "Selvaraj nagr 3 street Kalmedu nagar", "AST_line2": "ilanamaur via Sakkimangalam", "AST_city": "MADURAI", "AST_pincode": "625201","AST_stateName": "Tamil Nadu","Shipping_Contact_Name": "Mr.SATHISH KUMAR", "AST_phone": " 88074 21185", "Mode_Of_Booking": "Customer Booking", "Hub": "FESTA","Warehouse": "Madurai"
  }; // <--- AND THIS ONE.

  // Line 12 should be fine now
  const JSON_list = [{r: 1, price: 13432}];
  const result = engine_pdf_vr2(JSON_1to1, JSON_list, JSON_PARAMETER);
  Logger.log(result);
}