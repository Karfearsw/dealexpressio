import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import * as XLSX from 'xlsx';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Validation schemas
const validateLeadData = (data: any) => {
  const errors: string[] = [];
  
  if (!data.address) errors.push('Address is required');
  if (!data.city) errors.push('City is required');
  if (!data.state) errors.push('State is required');
  if (!data.zip_code) errors.push('ZIP code is required');
  if (data.owner_phone && !/^\+?[1-9]\d{1,14}$/.test(data.owner_phone)) {
    errors.push('Invalid phone number format');
  }
  if (data.owner_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.owner_email)) {
    errors.push('Invalid email format');
  }
  
  return { valid: errors.length === 0, errors };
};

// Export leads to CSV/Excel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST' && req.url?.includes('/import')) {
    return handleImport(req, res);
  } else if (req.method === 'GET' && req.url?.includes('/export')) {
    return handleExport(req, res);
  }
  
  return res.status(404).json({ error: 'Not found' });
}

async function handleExport(req: VercelRequest, res: VercelResponse) {
  try {
    const { format = 'csv', userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM leads WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      const leads = result.rows;

      if (format === 'csv') {
        const csv = stringify(leads, {
          header: true,
          columns: [
            'id', 'address', 'city', 'state', 'zip_code', 'county',
            'owner_name', 'owner_phone', 'owner_email', 'property_type',
            'bedrooms', 'bathrooms', 'square_feet', 'year_built',
            'estimated_value', 'estimated_equity', 'mortgage_balance',
            'last_sale_date', 'last_sale_price', 'status', 'notes',
            'created_at', 'updated_at'
          ]
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="leads_export_${Date.now()}.csv"`);
        return res.status(200).send(csv);
      } else if (format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(leads);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
        
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="leads_export_${Date.now()}.xlsx"`);
        return res.status(200).send(buffer);
      }

      return res.status(400).json({ error: 'Invalid format. Use csv or excel' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ error: 'Failed to export data' });
  }
}

async function handleImport(req: VercelRequest, res: VercelResponse) {
  try {
    const { file, format = 'csv', userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!file) {
      return res.status(400).json({ error: 'File data is required' });
    }

    let records: any[] = [];

    // Parse file based on format
    if (format === 'csv') {
      records = parse(file, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } else if (format === 'excel') {
      const workbook = XLSX.read(file, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      records = XLSX.utils.sheet_to_json(sheet);
    } else {
      return res.status(400).json({ error: 'Invalid format. Use csv or excel' });
    }

    // Validate and transform records
    const validRecords: any[] = [];
    const errors: any[] = [];

    records.forEach((record, index) => {
      const validation = validateLeadData(record);
      
      if (validation.valid) {
        validRecords.push({
          user_id: userId,
          address: record.address,
          city: record.city,
          state: record.state,
          zip_code: record.zip_code,
          county: record.county || null,
          owner_name: record.owner_name || record.ownerName || null,
          owner_phone: record.owner_phone || record.ownerPhone || null,
          owner_email: record.owner_email || record.ownerEmail || null,
          property_type: record.property_type || record.propertyType || 'Unknown',
          bedrooms: parseInt(record.bedrooms) || null,
          bathrooms: parseFloat(record.bathrooms) || null,
          square_feet: parseInt(record.square_feet || record.squareFeet) || null,
          year_built: parseInt(record.year_built || record.yearBuilt) || null,
          estimated_value: parseFloat(record.estimated_value || record.estimatedValue) || null,
          estimated_equity: parseFloat(record.estimated_equity || record.estimatedEquity) || null,
          mortgage_balance: parseFloat(record.mortgage_balance || record.mortgageBalance) || null,
          last_sale_date: record.last_sale_date || record.lastSaleDate || null,
          last_sale_price: parseFloat(record.last_sale_price || record.lastSalePrice) || null,
          status: record.status || 'New',
          notes: record.notes || null
        });
      } else {
        errors.push({
          row: index + 1,
          data: record,
          errors: validation.errors
        });
      }
    });

    // Insert valid records into database
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const insertedIds: number[] = [];
      
      for (const record of validRecords) {
        const result = await client.query(
          `INSERT INTO leads (
            user_id, address, city, state, zip_code, county,
            owner_name, owner_phone, owner_email, property_type,
            bedrooms, bathrooms, square_feet, year_built,
            estimated_value, estimated_equity, mortgage_balance,
            last_sale_date, last_sale_price, status, notes
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
          ) RETURNING id`,
          [
            record.user_id, record.address, record.city, record.state,
            record.zip_code, record.county, record.owner_name, record.owner_phone,
            record.owner_email, record.property_type, record.bedrooms,
            record.bathrooms, record.square_feet, record.year_built,
            record.estimated_value, record.estimated_equity, record.mortgage_balance,
            record.last_sale_date, record.last_sale_price, record.status, record.notes
          ]
        );
        
        insertedIds.push(result.rows[0].id);
      }

      await client.query('COMMIT');

      return res.status(200).json({
        success: true,
        imported: validRecords.length,
        failed: errors.length,
        insertedIds,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (dbError) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Import error:', error);
    return res.status(500).json({ error: 'Failed to import data', details: error });
  }
}
