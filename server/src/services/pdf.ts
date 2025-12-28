import PDFDocument from 'pdfkit';
import { Property, Lead } from '../db/schema';
import { format } from 'date-fns';

export const generateAssignmentContract = (data: { property: any, lead: any, assignmentFee: number, assigneeName: string }): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Title
        doc.fontSize(20).text('ASSIGNMENT OF CONTRACT', { align: 'center' });
        doc.moveDown();

        // Body
        doc.fontSize(12).text(`This Assignment of Contract ("Assignment") is made on ${format(new Date(), 'MMMM dd, yyyy')}, by and between ExpressDeal ("Assignor") and ${data.assigneeName} ("Assignee").`);
        doc.moveDown();

        doc.text(`WHEREAS, Assignor entered into a Purchase and Sale Agreement with ${data.lead.firstName} ${data.lead.lastName} ("Seller") for the purchase of the property located at:`);
        doc.moveDown();

        doc.font('Helvetica-Bold').text(`${data.property.address}, ${data.property.city}, ${data.property.state} ${data.property.zip}`);
        doc.font('Helvetica');
        doc.moveDown();

        doc.text(`WHEREAS, Assignor desires to assign all rights, title, and interest in said Agreement to Assignee, and Assignee desires to accept such assignment.`);
        doc.moveDown();

        doc.text(`NOW, THEREFORE, for and in consideration of the sum of $${data.assignmentFee.toLocaleString()} ("Assignment Fee"), receipt of which is acknowledged...`);
        doc.moveDown();

        // Signatures
        doc.moveDown(4);
        doc.text('__________________________                __________________________');
        doc.text('Assignor Signature                        Assignee Signature');

        doc.end();
    });
};
