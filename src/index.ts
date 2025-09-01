#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument } from 'pdf-lib';

interface CliArgs {
  inputFiles: string[];
  outputFile: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  
  if (args.length < 3 || args.includes('--help') || args.includes('-h')) {
    console.log('PDF Merger v1.0.0');
    console.log('A simple tool to merge multiple PDF files');
    console.log('');
    console.log('Usage:');
    console.log('  npm start <input1.pdf> <input2.pdf> ... --output <output.pdf>');
    console.log('');
    console.log('Example:');
    console.log('  npm start doc1.pdf doc2.pdf doc3.pdf --output merged.pdf');
    console.log('');
    console.log('Options:');
    console.log('  --output <file>  Output PDF file (required)');
    console.log('  --help, -h       Show this help message');
    process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
  }
  
  const outputIndex = args.indexOf('--output');
  if (outputIndex === -1 || outputIndex === args.length - 1) {
    console.error('Error: --output flag and filename required');
    process.exit(1);
  }
  
  const inputFiles = args.slice(0, outputIndex);
  const outputFile = args[outputIndex + 1];
  
  // Validate input files exist and are PDFs
  for (const file of inputFiles) {
    if (!fs.existsSync(file)) {
      console.error(`Error: Input file does not exist: ${file}`);
      process.exit(1);
    }
    if (!file.toLowerCase().endsWith('.pdf')) {
      console.error(`Error: File must be a PDF: ${file}`);
      process.exit(1);
    }
    
    // Check file size (warn if very large)
    const stats = fs.statSync(file);
    const fileSizeMB = stats.size / (1024 * 1024);
    if (fileSizeMB > 100) {
      console.warn(`Warning: Large file detected (${fileSizeMB.toFixed(1)}MB): ${file}`);
    }
  }
  
  // Validate output file extension
  if (!outputFile.toLowerCase().endsWith('.pdf')) {
    console.error('Error: Output file must have .pdf extension');
    process.exit(1);
  }
  
  // Check if output file already exists
  if (fs.existsSync(outputFile)) {
    console.warn(`Warning: Output file already exists and will be overwritten: ${outputFile}`);
  }
  
  // Validate output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    console.error(`Error: Output directory does not exist: ${outputDir}`);
    process.exit(1);
  }
  
  return { inputFiles, outputFile };
}

async function mergePdfs(inputFiles: string[], outputFile: string): Promise<void> {
  const mergedPdf = await PDFDocument.create();
  let totalPages = 0;
  
  for (let i = 0; i < inputFiles.length; i++) {
    const inputFile = inputFiles[i];
    const progress = `(${i + 1}/${inputFiles.length})`;
    console.log(`Processing ${progress}: ${inputFile}`);
    
    try {
      const pdfBytes = fs.readFileSync(inputFile);
      const pdf = await PDFDocument.load(pdfBytes);
      const pageCount = pdf.getPageCount();
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      copiedPages.forEach((page) => mergedPdf.addPage(page));
      totalPages += pageCount;
      console.log(`  Added ${pageCount} pages`);
    } catch (error) {
      console.error(`  ❌ Failed to process ${inputFile}: ${error}`);
      process.exit(1);
    }
  }
  
  console.log('Saving merged PDF...');
  const pdfBytes = await mergedPdf.save();
  fs.writeFileSync(outputFile, pdfBytes);
  console.log(`✅ Successfully merged ${inputFiles.length} PDFs (${totalPages} pages) into ${outputFile}`);
}

async function main() {
  try {
    const { inputFiles, outputFile } = parseArgs();
    console.log(`Merging ${inputFiles.length} PDF files...`);
    console.log('Input files:', inputFiles.join(', '));
    console.log('Output file:', outputFile);
    
    await mergePdfs(inputFiles, outputFile);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();