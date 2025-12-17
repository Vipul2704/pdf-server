const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Server is running!',
    message: 'PDF Generation Server for Flutter Billing App',
    timestamp: new Date().toISOString()
  });
});

// PDF Generation endpoint
app.post('/generate-pdf', async (req, res) => {
  console.log('📄 PDF generation request received');
  
  try {
    const billData = req.body;
    
    // Validate data
    if (!billData || Object.keys(billData).length === 0) {
      return res.status(400).json({ error: 'No bill data provided' });
    }

    console.log('📋 Generating HTML template...');
    const htmlContent = generateHTMLTemplate(billData);

    console.log('🚀 Launching browser...');
    const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-dev-tools',
    '--no-zygote',
    '--single-process'
  ],
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser'
});

    const page = await browser.newPage();
    
    console.log('📝 Setting HTML content...');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    console.log('🖨️ Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    });

    await browser.close();
    console.log('✅ PDF generated successfully!');

    // Send PDF back to Flutter app
    res.contentType('application/pdf');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
  console.log(`📄 PDF endpoint: http://localhost:${PORT}/generate-pdf`);
});

// ===== HTML TEMPLATE GENERATOR FUNCTION =====
function generateHTMLTemplate(data) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tax Invoice</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Calibri, sans-serif;
            font-size: 11pt;
            background: #f5f5f5;
            padding: 20px;
        }

        .page-container {
            width: 210mm;
            min-height: 297mm;
            background: white;
            margin: 0 auto;
            padding: 8mm;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
        }

        td {
            padding: 2px 4px;
            color: black;
            font-size: 11pt;
            vertical-align: bottom;
            white-space: nowrap;
            line-height: 1.2;
        }

        /* Column widths */
        .col1 { width: 5%; }
        .col2 { width: 34%; }
        .col3 { width: 10%; }
        .col4 { width: 10%; }
        .col5 { width: 9%; }
        .col6 { width: 5%; }
        .col7 { width: 11%; }

        /* Border styles */
        .border-all { border: 0.5pt solid black; }
        .border-top { border-top: 0.5pt solid black; }
        .border-right { border-right: 0.5pt solid black; }
        .border-bottom { border-bottom: 0.5pt solid black; }
        .border-left { border-left: 0.5pt solid black; }
        
        .border-lr { border-left: 0.5pt solid black; border-right: 0.5pt solid black; }
        .border-tb { border-top: 0.5pt solid black; border-bottom: 0.5pt solid black; }
        .border-tlr { border-top: 0.5pt solid black; border-left: 0.5pt solid black; border-right: 0.5pt solid black; }
        .border-lrb { border-left: 0.5pt solid black; border-right: 0.5pt solid black; border-bottom: 0.5pt solid black; }

        /* Text alignment */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }

        /* Font styles */
        .bold { font-weight: 700; }
        .font-12 { font-size: 12pt; }
        .font-11 { font-size: 11pt; }
        .font-10 { font-size: 10pt; }
        .font-9 { font-size: 9pt; }
        .font-8 { font-size: 8pt; }
        .font-7 { font-size: 7pt; }
        .font-6 { font-size: 6pt; }
        .italic { font-style: italic; }
        .underline { text-decoration: underline; }

        /* Background */
        .bg-gray { background: #D9D9D9; }

        /* Specific styles */
        .company-name {
            font-weight: 700;
            border-top: 0.5pt solid black;
            border-left: 0.5pt solid black;
        }

        .header-row {
            height: 16pt;
        }
        .compact-row {
    height: 12pt;  /* Smaller height for GST table */
}

        @media print {
    body {
        background: white;
        padding: 0;
    }

    .page-container {
        width: 210mm;
        height: 297mm;
        margin: 0;
        padding: 8mm;
        box-shadow: none;
    }

    

    table {
        page-break-inside: avoid;
    }

    /* ADD THIS TO PRINT BACKGROUND COLORS */
* {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
}

    @page {
        size: A4;
        margin: 0;
    }
}
    </style>
</head>
<body>
    <div class="page-container" style="position: relative;">
        <table>
            <colgroup>
                <col class="col1">
                <col class="col2">
                <col class="col3">
                <col class="col4">
                <col class="col5">
                <col class="col6">
                <col class="col7">
            </colgroup>

            <!-- Title Row -->
            <tr class="header-row">
                <td colspan="4" class="text-center bold font-12" style="padding-left: 150px;">Tax Invoice</td>
                <td colspan="3" class="text-right font-9 italic">(ORIGINAL FOR RECIPIENT)</td>
            </tr>

            <!-- Company Name & Invoice No -->
            <tr class="header-row">
                <td colspan="2" class="bold border-top border-left border-right">${data.m_company_name}</td>
                <td colspan="2" class="border-top border-left border-right">Invoice No.</td>
                <td colspan="2" class="border-top border-left">Invoice Date</td>
                <td class="border-top border-right">&nbsp;</td>
            </tr>

            <!-- Address & Invoice Details -->
            <tr class="header-row">
                <td colspan="2" class="border-left border-right">${data.m_company_address1}</td>
                <td colspan="2" class="bold border-left border-right border-bottom">${data.b_invoice_no}</td>
                <td colspan="2" class="bold text-left border-bottom">${data.b_invoice_date}</td>
                <td class="border-right border-bottom">&nbsp;</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="border-left border-right">${data.m_company_address2}</td>
                <td colspan="2" class="border-top border-left border-right">Challan Number</td>
                <td colspan="2" class="border-top border-left">Challan Date</td>
                <td class="border-top border-right">&nbsp;</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="border-left border-right">${data.m_company_gstin}</td>
                <td class="bold border-left">${data.b_challan_no}</td>
                <td class="border-right border-bottom">&nbsp;</td>
                <td colspan="2" class="bold">${data.b_challan_date}</td>
                <td class="border-right border-bottom">&nbsp;</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="border-left border-right">${data.m_company_state}</td>
                <td colspan="2" class="border-top border-left border-right">P.O. Number</td>
                <td class="border-top border-left">P.O. Date</td>
                <td class="border-top">&nbsp;</td>
                <td class="border-top border-right">&nbsp;</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="border-left border-right">${data.m_company_contact}</td>
                <td class="bold border-left">${data.b_po_no}</td>
                <td class="border-right border-bottom">&nbsp;</td>
                <td colspan="2" class="bold">${data.b_po_date}</td>
                <td class="border-right border-bottom">&nbsp;</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="border-left border-right border-bottom">${data.m_company_email}</td>
                <td colspan="2" class="border-top border-left border-right">Vehicle Number</td>
                <td colspan="3" class="border-top border-left border-right">Eway Bill Number</td>
            </tr>

            <!-- Buyer Info -->
            <tr class="header-row">
                <td colspan="2" class="border-top border-left border-right">buyer(Bill to)</td>
                <td colspan="2" class="bold border-left border-right">${data.b_vehicle_no}</td>
                <td colspan="2" class="bold">${data.b_eway_no}</td>
                <td class="border-right border-bottom">&nbsp;</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="bold border-left border-right">${data.b_company_name}</td>
                <td colspan="2" class="border-top border-left border-right">Dispatched Through</td>
                <td colspan="2" class="border-top border-left">Destination</td>
                <td class="border-top border-right">&nbsp;</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="border-left border-right">${data.b_company_address1}</td>
                <td colspan="2" class="bold border-left border-right border-bottom">${data.b_dispatched_through}</td>
                <td class="bold border-left border-bottom">${data.b_destination}</td>
                <td class="border-bottom">&nbsp;</td>
                <td class="border-right border-bottom">&nbsp;</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="border-left border-right">${data.b_company_address2}</td>
                <td colspan="2" class="border-top border-left border-right">LR Number</td>
                <td colspan="3" class="border-top border-left border-right">Mode/Terms of Payment</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="border-left border-right">${data.b_company_gstin}</td>
                <td class="bold border-left">${data.b_lr_no}</td>
                <td class="border-right">&nbsp;</td>
                <td colspan="2" class="bold border-bottom">${data.b_mode}</td>
                <td class="border-right border-bottom">&nbsp;</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="border-left border-right">${data.b_company_state}</td>
                <td class="border-left border-top">Terms Delivery</td>
                <td class="border-top">&nbsp;</td>
                <td class="border-top">&nbsp;</td>
                <td class="border-top">&nbsp;</td>
                <td class="border-right border-top">&nbsp;</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="border-left border-right">${data.b_company_contact}</td>
                <td class="border-left">&nbsp;${data.b_terms}</td> 
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td class="border-right">&nbsp;</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="border-left border-right border-bottom">${data.b_company_email}</td>
                <td class="border-left border-bottom">&nbsp;</td>
                <td class="border-bottom">&nbsp;</td>
                <td class="border-bottom">&nbsp;</td>
                <td class="border-bottom">&nbsp;</td>
                <td class="border-right border-bottom">&nbsp;</td>
            </tr>

            <!-- Items Table Header -->
            <!-- Items Table Header -->
            <tr class="header-row">
            <td class="text-center bg-gray border-all font-11">No.</td>
            <td class="text-center bg-gray border-all font-11">Description Of Goods</td>
            <td class="text-center bg-gray border-all font-11">HSN/SAC</td>
            <td class="text-center bg-gray border-all font-11">Quantity</td>
            <td class="text-center bg-gray border-all font-11">Rate</td>
            <td class="text-center bg-gray border-all font-11">Per</td>
            <td class="text-center bg-gray border-all font-11">Amount</td>
            </tr>

            <!-- Item 1 -->
            <tr class="header-row">
                <td class="text-center bold border-tlr">${data.b_item_1}</td>
                <td class="bold border-tlr">${data.b_item_name_1}</td>
                <td class="text-center border-tlr">${data.b_item_hsn_1}</td>
                <td class="text-center border-tlr">${data.b_item_quantity_1}</td>
                <td class="text-center border-tlr">${data.b_item_rate_1}</td>
                <td class="text-center border-tlr">${data.b_item_per_1}</td>
                <td class="text-right border-tlr">${data.b_item_amount_1}</td>
            </tr>
            <tr class="header-row">
                <td class="border-lr">&nbsp;</td>
                <td class="font-10 border-lr">${data.b_item_dis_1}</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
            </tr>

            <!-- Item 2 -->
            <tr class="header-row">
                <td class="text-center bold border-lr">${data.b_item_2}</td>
                <td class="bold border-lr">${data.b_item_name_2}</td>
                <td class="text-center border-lr">${data.b_item_hsn_2}</td>
                <td class="text-center border-lr">${data.b_item_quantity_2}</td>
                <td class="text-center border-lr">${data.b_item_rate_2}</td>
                <td class="text-center border-lr">${data.b_item_per_2}</td>
                <td class="text-right border-lr">${data.b_item_amount_2}</td>
            </tr>
            <tr class="header-row">
                <td class="border-lr">&nbsp;</td>
                <td class="font-10 border-lr">${data.b_item_dis_2}</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
            </tr>

            <!-- Item 3 -->
            <tr class="header-row">
                <td class="text-center bold border-lr">${data.b_item_3}</td>
                <td class="bold border-lr">${data.b_item_name_3}</td>
                <td class="text-center border-lr">${data.b_item_hsn_3}</td>
                <td class="text-center border-lr">${data.b_item_quantity_3}</td>
                <td class="text-center border-lr">${data.b_item_rate_3}</td>
                <td class="text-center border-lr">${data.b_item_per_3}</td>
                <td class="text-right border-lr">${data.b_item_amount_3}</td>
            </tr>
            <tr class="header-row">
                <td class="border-lr">&nbsp;</td>
                <td class="font-10 border-lr">${data.b_item_dis_3}</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
            </tr>

            <!-- Item 4 -->
            <tr class="header-row">
                <td class="text-center bold border-lr">${data.b_item_4}</td>
                <td class="bold border-lr">${data.b_item_name_4}</td>
                <td class="text-center border-lr">${data.b_item_hsn_4}</td>
                <td class="text-center border-lr">${data.b_item_quantity_4}</td>
                <td class="text-center border-lr">${data.b_item_rate_4}</td>
                <td class="text-center border-lr">${data.b_item_per_4}</td>
                <td class="text-right border-lr">${data.b_item_amount_4}</td>
            </tr>
            <tr class="header-row">
                <td class="border-lr">&nbsp;</td>
                <td class="font-10 border-lr">${data.b_item_dis_4}</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
            </tr>

            <!-- Item 5 -->
            <tr class="header-row">
                <td class="text-center bold border-lr">${data.b_item_5}</td>
                <td class="bold border-lr">${data.b_item_name_5}</td>
                <td class="text-center border-lr">${data.b_item_hsn_5}</td>
                <td class="text-center border-lr">${data.b_item_quantity_5}</td>
                <td class="text-center border-lr">${data.b_item_rate_5}</td>
                <td class="text-center border-lr">${data.b_item_per_5}</td>
                <td class="text-right border-lr">${data.b_item_amount_5}</td>
            </tr>
            <tr class="header-row">
                <td class="border-lr">&nbsp;</td>
                <td class="font-10 border-lr">${data.b_item_dis_5}</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
            </tr>

            <!-- Item 6 -->
            <tr class="header-row">
                <td class="text-center bold border-lr">${data.b_item_6}</td>
                <td class="bold border-lr">${data.b_item_name_6}</td>
                <td class="text-center border-lr">${data.b_item_hsn_6}</td>
                <td class="text-center border-lr">${data.b_item_quantity_6}</td>
                <td class="text-center border-lr">${data.b_item_rate_6}</td>
                <td class="text-center border-lr">${data.b_item_per_6}</td>
                <td class="text-right border-lr">${data.b_item_amount_6}</td>
            </tr>
            <tr class="header-row">
                <td class="border-lr">&nbsp;</td>
                <td class="font-10 border-lr">${data.b_item_dis_6}</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
                <td class="border-lr">&nbsp;</td>
            </tr>

            <!-- Total Row -->
            <tr class="header-row">
                <td class="border-all">&nbsp;</td>
                <td class="text-right border-all">Total</td>
                <td class="border-all">&nbsp;</td>
                <td class="text-center border-all">${data.b_qty_total}</td>
                <td class="border-all">&nbsp;</td>
                <td class="border-all">&nbsp;</td>
                <td class="bold border-all">&nbsp;</td>
            </tr>

            <!-- Bank Details & Calculations -->
            <tr class="header-row">
                <td colspan="2" class="border-top border-left border-right">GSTIN/UIN : <b>${data.m_company_gstin}</b></td>
                <td class="border-top border-left">&nbsp;</td>
                <td>&nbsp;</td>
                <td class="border-top border-left">Sub Total</td>
                <td class="border-right">&nbsp;</td>
            <td class="text-right border-top border-right">${data.b_subtotal}</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="border-left border-right">PAN Number : <b>${data.m_pan_no}</b></td>
                <td class="border-left">&nbsp;</td>
                <td>&nbsp;</td>
                <td class="border-left">Freight</td>
            <td class="border-right">&nbsp;</td>
            <td class="text-right border-right">${data.b_freight }</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="border-left border-right">A/C Holder's Name : <b>${data.m_ac_name}</b></td>
                <td class="border-left">&nbsp;</td>
                <td>&nbsp;</td>
                <td colspan="2" class="bg-gray border-top border-left border-bottom">Taxable Amount</td>
                <td class="bold bg-gray border-all text-right">₹ ${data.b_taxable_amount}</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="border-left border-right">Bank Name : <b>${data.m_bank_name}</b></td>
                <td class="border-left">&nbsp;</td>
                <td>&nbsp;</td>
                <td class="border-left">CGST</td>
            <td class="text-right border-right">${data.b_cgst_perce}</td>
            <td class="text-right border-right">${data.b_cgst_perce}</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="border-left border-right">Account Number : <b>${data.m_ac_no}</b></td>
                <td class="border-left">&nbsp;</td>
                <td>&nbsp;</td>
                <td class="border-left">SGST</td>
                <td class="text-right border-right">${data.b_sgst_percen}</td>
                <td class="text-right border-right">${data.b_sgst_rate}</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="border-left border-right">Branch & IFSC Code : <b>${data.m_branch_name}</b></td>
                <td class="border-left">&nbsp;</td>
                <td>&nbsp;</td>
                <td class="border-left">IGST</td>
                <td class="text-right border-right">${data.b_igst_percen}</td>
                <td class="text-right border-right">${data.b_igst_rate }</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="border-left border-right">UDYAM : <b>${data.m_udyam_no}</b></td>
                <td class="border-left">&nbsp;</td>
                <td>&nbsp;</td>
                <td colspan="2" class="border-left border-right">Round off</td>
            <td class="text-right border-right">${data.b_roundoff}</td>
            </tr>

            <!-- Amount in Words & Grand Total -->
            <tr class="header-row">
                <td colspan="4" class="font-11 border-top border-left border-right border-bottom">Amount: <b>${data.b_amount_word}</b></td>
                <td colspan="2" class="bg-gray border-all">Grand Total</td>
                <td class="bold bg-gray border-all text-right">₹${data.b_grand_total}</td>
            </tr>

            <!-- Declaration & Narration -->
            <tr class="header-row">
                <td colspan="4" class="font-9 underline text-left border-top border-left border-right">Declaration</td>
                <td colspan="2" class="border-top border-left">Narration:</td>
                <td class="border-top border-right">&nbsp;</td>
            </tr>

            <tr class="header-row">
                <td colspan="3" class="font-9 border-left">${data.m_declaration_1}</td>
                <td class="border-right">&nbsp;</td>
                <td colspan="2" class="border-left">Previous Balance</td>
                <td class="text-right border-right">${data.b_previous_balance}</td>
            </tr>

            <tr class="header-row">
                <td colspan="3" class="font-9 border-left">${data.m_declaration_2}</td>
                <td class="border-right">&nbsp;</td>
                <td colspan="2" class="border-left">Current Balance:</td>
                <td class="text-right border-right">${data.b_current_balance}</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="font-9 border-left border-bottom">${data.m_declaration_3}</td>
                <td class="border-bottom">&nbsp;</td>
                <td class="border-right border-bottom">&nbsp;</td>
                <td colspan="2" class="border-left border-bottom">Total Balance:</td>
                <td class="text-right border-right border-bottom">${data.b_total_balance}</td>
            </tr>

            <!-- Terms & Conditions -->
            <tr class="header-row">
                <td colspan="2" class="font-9 underline border-top border-left">Terms & Conditions :</td>
                <td class="border-top">&nbsp;</td>
                <td class="border-top border-right">&nbsp;</td>
                <td colspan="3" class="border-top border-left border-right">for, <b>${data.m_for_name}</b></td>
                
            </tr>
            

            <tr class="header-row">
                <td colspan="3" class="font-9 border-left">${data.m_terms_1}</td>
                <td class="border-right">&nbsp;</td>
                <td class="border-left">&nbsp;</td>
                <td>&nbsp;</td>
                <td class="border-right">&nbsp;</td>
            </tr>


            <tr class="header-row">
                <td colspan="4" class="font-9 border-left border-right">${data.m_terms_2}</td>
                <td class="border-left">&nbsp;</td>
                <td>&nbsp;</td>
                <td class="border-right">&nbsp;</td>
            </tr>

            <tr class="header-row">
                <td colspan="4" class="font-9 border-left border-right">${data.m_terms_3}</td>
                <td class="border-left">&nbsp;</td>
                <td>&nbsp;</td>
                <td class="border-right">&nbsp;</td>
            </tr>

            <tr class="header-row">
                <td colspan="3" class="font-9 border-left">${data.m_terms_4}</td>
                <td class="border-right">&nbsp;</td>
                <td class="border-left">&nbsp;</td>
                <td>&nbsp;</td>
                <td class="border-right">&nbsp;</td>
            </tr>

            <tr class="header-row">
                <td colspan="2" class="font-9 border-left border-bottom">${data.m_terms_5}</td>
                <td class="border-bottom">&nbsp;</td>
                <td class="border-right border-bottom">&nbsp;</td>
                <td class="border-left border-bottom">&nbsp;</td>
                <td colspan="2" class="border-right border-bottom">Authorised Signatory</td>
            </tr>
        </table>
        <!-- QR Code of UPI -->
     <img src="qr code based on grand total so user pay via upi"
     style="
         position: absolute;
         left: 395px;     /* adjust for position */
         bottom: 305px;   /* adjust for position */
         width: 120px;   /* size of QR */
         height: auto;
        ">
        <div style="
        position: absolute;
        left: 430px;          /* SAME as QR code left */
        bottom: 290px;        /* QR bottom - some px */
        font-size: 7pt;
        font-weight: bold;
        ">
        SCAN & PAY
        </div>
        <!-- Sign With LOGO -->
        <img src="fetch from the database base64 code"    
        style="
         position: absolute;
         right: 90px;      /* move left-right */
         bottom: 68px;     /* move up-down */
         width: 100px;
         opacity: 1;
     ">
     <div style="
        position: absolute;
        left: 320px;          /* SAME as QR code left */
        bottom: 28px;        /* QR bottom - some px */
        font-size: 8pt;
        ">
        This is a Computer Generated Invoice
        </div>
    </div>
</body>
</html>
  `;
}


