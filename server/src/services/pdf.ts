import PDFDocument from 'pdfkit';
import { format } from 'date-fns';

interface ContractData {
    type: string;
    deal?: any;
    lead?: any;
    buyerName: string;
    buyerAddress?: string;
    buyerEmail?: string;
    buyerPhone?: string;
    purchasePrice: number;
    earnestMoney?: number;
    closingDate?: string;
    inspectionDays?: number;
    financingDays?: number;
    assignmentFee?: number;
    jvSplit?: number;
    additionalTerms?: string;
}

export const generateContractPDF = (data: ContractData): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const today = format(new Date(), 'MMMM dd, yyyy');
        const propertyAddress = data.deal ? `${data.deal.address}, ${data.deal.city || ''}, ${data.deal.state || ''} ${data.deal.zip || ''}` : 'TBD';
        const sellerName = data.lead ? `${data.lead.firstName} ${data.lead.lastName}` : 'Property Owner';

        switch (data.type) {
            case 'letter_of_intent':
                generateLOI(doc, data, today, propertyAddress, sellerName);
                break;
            case 'purchase_agreement':
                generatePurchaseAgreement(doc, data, today, propertyAddress, sellerName);
                break;
            case 'psa':
                generatePSA(doc, data, today, propertyAddress, sellerName);
                break;
            case 'assignment':
                generateAssignment(doc, data, today, propertyAddress, sellerName);
                break;
            case 'jv_agreement':
                generateJVAgreement(doc, data, today, propertyAddress, sellerName);
                break;
            default:
                generatePurchaseAgreement(doc, data, today, propertyAddress, sellerName);
        }

        doc.end();
    });
};

function generateLOI(doc: PDFKit.PDFDocument, data: ContractData, today: string, propertyAddress: string, sellerName: string) {
    doc.fontSize(18).font('Helvetica-Bold').text('LETTER OF INTENT', { align: 'center' });
    doc.moveDown(2);
    
    doc.fontSize(11).font('Helvetica').text(`Date: ${today}`);
    doc.moveDown();
    
    doc.text(`To: ${sellerName}`);
    doc.text(`Re: Property at ${propertyAddress}`);
    doc.moveDown(2);
    
    doc.text(`Dear ${sellerName},`);
    doc.moveDown();
    
    doc.text(`This Letter of Intent ("LOI") sets forth the basic terms upon which ${data.buyerName} ("Buyer") is prepared to acquire the property located at:`);
    doc.moveDown();
    doc.font('Helvetica-Bold').text(propertyAddress, { indent: 20 });
    doc.font('Helvetica');
    doc.moveDown(2);
    
    doc.font('Helvetica-Bold').text('PROPOSED TERMS:');
    doc.font('Helvetica');
    doc.moveDown();
    
    doc.text(`1. Purchase Price: $${data.purchasePrice.toLocaleString()}`);
    doc.text(`2. Earnest Money Deposit: $${(data.earnestMoney || 0).toLocaleString()}`);
    doc.text(`3. Inspection Period: ${data.inspectionDays || 10} business days`);
    doc.text(`4. Financing Contingency: ${data.financingDays || 21} days`);
    doc.text(`5. Proposed Closing Date: ${data.closingDate || 'To be determined'}`);
    doc.moveDown(2);
    
    doc.text('This LOI is non-binding and is intended only to outline the general terms of a potential transaction. A binding agreement will only be created upon execution of a definitive Purchase and Sale Agreement.');
    doc.moveDown(2);
    
    if (data.additionalTerms) {
        doc.font('Helvetica-Bold').text('ADDITIONAL TERMS:');
        doc.font('Helvetica').text(data.additionalTerms);
        doc.moveDown(2);
    }
    
    doc.text('This LOI shall expire if not accepted within 5 business days.');
    doc.moveDown(3);
    
    addSignatureBlock(doc, data.buyerName, sellerName);
}

function generatePurchaseAgreement(doc: PDFKit.PDFDocument, data: ContractData, today: string, propertyAddress: string, sellerName: string) {
    doc.fontSize(18).font('Helvetica-Bold').text('REAL ESTATE PURCHASE AGREEMENT', { align: 'center' });
    doc.moveDown(2);
    
    doc.fontSize(11).font('Helvetica').text(`This Real Estate Purchase Agreement ("Agreement") is made and entered into as of ${today}, by and between:`);
    doc.moveDown();
    
    doc.font('Helvetica-Bold').text('SELLER:');
    doc.font('Helvetica').text(sellerName);
    doc.moveDown();
    
    doc.font('Helvetica-Bold').text('BUYER:');
    doc.font('Helvetica').text(data.buyerName);
    if (data.buyerAddress) doc.text(data.buyerAddress);
    doc.moveDown(2);
    
    doc.font('Helvetica-Bold').text('1. PROPERTY');
    doc.font('Helvetica').text(`Seller agrees to sell and Buyer agrees to purchase the real property located at:`);
    doc.text(propertyAddress, { indent: 20 });
    doc.moveDown();
    
    doc.font('Helvetica-Bold').text('2. PURCHASE PRICE');
    doc.font('Helvetica').text(`The total purchase price for the Property shall be $${data.purchasePrice.toLocaleString()} payable as follows:`);
    doc.text(`   a) Earnest Money Deposit: $${(data.earnestMoney || 0).toLocaleString()}`);
    doc.text(`   b) Balance due at closing: $${(data.purchasePrice - (data.earnestMoney || 0)).toLocaleString()}`);
    doc.moveDown();
    
    doc.font('Helvetica-Bold').text('3. INSPECTION PERIOD');
    doc.font('Helvetica').text(`Buyer shall have ${data.inspectionDays || 10} days from the effective date to conduct inspections.`);
    doc.moveDown();
    
    doc.font('Helvetica-Bold').text('4. FINANCING');
    doc.font('Helvetica').text(`This Agreement is contingent upon Buyer obtaining financing within ${data.financingDays || 21} days.`);
    doc.moveDown();
    
    doc.font('Helvetica-Bold').text('5. CLOSING');
    doc.font('Helvetica').text(`Closing shall occur on or before ${data.closingDate || 'a date to be mutually agreed upon'}.`);
    doc.moveDown();
    
    doc.font('Helvetica-Bold').text('6. POSSESSION');
    doc.font('Helvetica').text('Seller shall deliver possession of the Property at closing.');
    doc.moveDown();
    
    doc.font('Helvetica-Bold').text('7. TITLE');
    doc.font('Helvetica').text('Seller shall convey marketable title to the Property by warranty deed.');
    doc.moveDown(2);
    
    if (data.additionalTerms) {
        doc.font('Helvetica-Bold').text('8. ADDITIONAL TERMS');
        doc.font('Helvetica').text(data.additionalTerms);
        doc.moveDown(2);
    }
    
    addSignatureBlock(doc, data.buyerName, sellerName);
}

function generatePSA(doc: PDFKit.PDFDocument, data: ContractData, today: string, propertyAddress: string, sellerName: string) {
    doc.fontSize(18).font('Helvetica-Bold').text('PURCHASE AND SALE AGREEMENT', { align: 'center' });
    doc.moveDown(2);
    
    doc.fontSize(11).font('Helvetica').text(`AGREEMENT made as of ${today}`);
    doc.moveDown();
    
    doc.text(`BETWEEN: ${sellerName} ("Seller")`);
    doc.text(`AND: ${data.buyerName} and/or assigns ("Buyer")`);
    doc.moveDown(2);
    
    doc.font('Helvetica-Bold').text('RECITALS');
    doc.font('Helvetica').text('Seller desires to sell and Buyer desires to purchase the following described property:');
    doc.moveDown();
    doc.text(propertyAddress, { indent: 20 });
    doc.moveDown(2);
    
    doc.font('Helvetica-Bold').text('TERMS AND CONDITIONS');
    doc.moveDown();
    
    doc.text(`1. PURCHASE PRICE: $${data.purchasePrice.toLocaleString()}`);
    doc.text(`2. EARNEST MONEY: $${(data.earnestMoney || 0).toLocaleString()} to be deposited within 3 business days`);
    doc.text(`3. DUE DILIGENCE PERIOD: ${data.inspectionDays || 10} days`);
    doc.text(`4. FINANCING CONTINGENCY: ${data.financingDays || 21} days`);
    doc.text(`5. CLOSING DATE: ${data.closingDate || 'Per mutual agreement'}`);
    doc.text('6. TITLE: Seller to provide clear and marketable title');
    doc.text('7. CLOSING COSTS: To be split per local custom');
    doc.text('8. ASSIGNABILITY: This agreement is fully assignable by Buyer');
    doc.moveDown(2);
    
    doc.font('Helvetica-Bold').text('CONTINGENCIES');
    doc.font('Helvetica');
    doc.text('- Satisfactory property inspection');
    doc.text('- Clear title insurance commitment');
    doc.text('- Financing approval (if applicable)');
    doc.moveDown(2);
    
    if (data.additionalTerms) {
        doc.font('Helvetica-Bold').text('SPECIAL PROVISIONS:');
        doc.font('Helvetica').text(data.additionalTerms);
        doc.moveDown(2);
    }
    
    addSignatureBlock(doc, data.buyerName, sellerName);
}

function generateAssignment(doc: PDFKit.PDFDocument, data: ContractData, today: string, propertyAddress: string, sellerName: string) {
    doc.fontSize(18).font('Helvetica-Bold').text('ASSIGNMENT OF CONTRACT', { align: 'center' });
    doc.moveDown(2);
    
    doc.fontSize(11).font('Helvetica').text(`This Assignment of Contract ("Assignment") is made on ${today}, by and between:`);
    doc.moveDown();
    
    doc.font('Helvetica-Bold').text('ASSIGNOR: ');
    doc.font('Helvetica').text('DealExpress LLC (or its designated entity)');
    doc.moveDown();
    
    doc.font('Helvetica-Bold').text('ASSIGNEE: ');
    doc.font('Helvetica').text(data.buyerName);
    if (data.buyerAddress) doc.text(data.buyerAddress);
    doc.moveDown(2);
    
    doc.font('Helvetica-Bold').text('RECITALS');
    doc.font('Helvetica');
    doc.moveDown();
    
    doc.text(`WHEREAS, Assignor entered into a Purchase and Sale Agreement with ${sellerName} ("Seller") for the purchase of the property located at:`);
    doc.moveDown();
    doc.font('Helvetica-Bold').text(propertyAddress, { indent: 20 });
    doc.font('Helvetica');
    doc.moveDown();
    
    doc.text('WHEREAS, Assignor desires to assign all rights, title, and interest in said Agreement to Assignee, and Assignee desires to accept such assignment.');
    doc.moveDown(2);
    
    doc.font('Helvetica-Bold').text('TERMS OF ASSIGNMENT');
    doc.font('Helvetica');
    doc.moveDown();
    
    doc.text(`1. ASSIGNMENT FEE: $${(data.assignmentFee || 0).toLocaleString()}`);
    doc.text('2. Assignor assigns all rights and obligations under the original Purchase Agreement to Assignee.');
    doc.text('3. Assignee accepts the assignment and agrees to perform all obligations under the original Agreement.');
    doc.text(`4. Original Purchase Price: $${data.purchasePrice.toLocaleString()}`);
    doc.text(`5. Closing to occur on or before: ${data.closingDate || 'Per original agreement'}`);
    doc.moveDown(2);
    
    doc.text('The Assignment Fee shall be due and payable at closing.');
    doc.moveDown(2);
    
    if (data.additionalTerms) {
        doc.font('Helvetica-Bold').text('ADDITIONAL TERMS:');
        doc.font('Helvetica').text(data.additionalTerms);
        doc.moveDown(2);
    }
    
    addSignatureBlock(doc, data.buyerName, 'Assignor');
}

function generateJVAgreement(doc: PDFKit.PDFDocument, data: ContractData, today: string, propertyAddress: string, sellerName: string) {
    doc.fontSize(18).font('Helvetica-Bold').text('JOINT VENTURE AGREEMENT', { align: 'center' });
    doc.moveDown(2);
    
    doc.fontSize(11).font('Helvetica').text(`This Joint Venture Agreement ("Agreement") is entered into as of ${today}, by and between:`);
    doc.moveDown();
    
    doc.font('Helvetica-Bold').text('PARTY A: ');
    doc.font('Helvetica').text('DealExpress LLC');
    doc.moveDown();
    
    doc.font('Helvetica-Bold').text('PARTY B: ');
    doc.font('Helvetica').text(data.buyerName);
    if (data.buyerAddress) doc.text(data.buyerAddress);
    doc.moveDown(2);
    
    doc.font('Helvetica-Bold').text('PURPOSE');
    doc.font('Helvetica').text('The parties agree to form a joint venture for the purpose of acquiring, wholesaling, and/or developing the following property:');
    doc.moveDown();
    doc.text(propertyAddress, { indent: 20 });
    doc.moveDown(2);
    
    doc.font('Helvetica-Bold').text('TERMS AND CONDITIONS');
    doc.font('Helvetica');
    doc.moveDown();
    
    const partyASplit = data.jvSplit || 50;
    const partyBSplit = 100 - partyASplit;
    
    doc.text(`1. PROFIT SPLIT: Party A: ${partyASplit}% / Party B: ${partyBSplit}%`);
    doc.text('2. RESPONSIBILITIES:');
    doc.text('   - Party A: Deal sourcing, negotiations, contract management', { indent: 20 });
    doc.text('   - Party B: Funding, buyer acquisition, due diligence', { indent: 20 });
    doc.text(`3. TARGET PURCHASE PRICE: $${data.purchasePrice.toLocaleString()}`);
    doc.text(`4. ESTIMATED ASSIGNMENT/PROFIT: $${(data.assignmentFee || 0).toLocaleString()}`);
    doc.text('5. DECISION MAKING: Major decisions require mutual consent');
    doc.text('6. TERM: This agreement terminates upon closing or termination of the underlying contract');
    doc.moveDown(2);
    
    doc.font('Helvetica-Bold').text('DISPUTE RESOLUTION');
    doc.font('Helvetica').text('Any disputes shall be resolved through binding arbitration.');
    doc.moveDown(2);
    
    if (data.additionalTerms) {
        doc.font('Helvetica-Bold').text('ADDITIONAL TERMS:');
        doc.font('Helvetica').text(data.additionalTerms);
        doc.moveDown(2);
    }
    
    addSignatureBlock(doc, 'Party A', 'Party B');
}

function addSignatureBlock(doc: PDFKit.PDFDocument, party1: string, party2: string) {
    doc.moveDown(3);
    doc.text('IN WITNESS WHEREOF, the parties have executed this agreement as of the date first written above.');
    doc.moveDown(3);
    
    doc.text('_________________________________          _________________________________');
    doc.text(`${party1}                                      ${party2}`);
    doc.moveDown();
    doc.text('Date: _______________                       Date: _______________');
}

export const generateAssignmentContract = (data: { property: any, lead: any, assignmentFee: number, assigneeName: string }): Promise<Buffer> => {
    return generateContractPDF({
        type: 'assignment',
        deal: data.property,
        lead: data.lead,
        buyerName: data.assigneeName,
        purchasePrice: data.property?.purchasePrice || 0,
        assignmentFee: data.assignmentFee
    });
};
