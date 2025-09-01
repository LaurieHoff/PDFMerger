#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument } from 'pdf-lib';

const packageJson = require('../package.json');

interface CliArgs {
  inputFiles: string[];
  outputFile: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  
  // Handle version flag
  if (args.includes('--version') || args.includes('-v')) {
    console.log(packageJson.version);
    process.exit(0);
  }
  
  if (args.length < 3 || args.includes('--help') || args.includes('-h')) {
    console.log(`PDF Merger v${packageJson.version}`);
    console.log('A simple tool to merge multiple PDF files');
    console.log('');
    console.log('Usage:');
    console.log('  npm start <input1.pdf> <input2.pdf> ... --output <output.pdf>');
    console.log('');
    console.log('Example:');
    console.log('  npm start doc1.pdf doc2.pdf doc3.pdf --output merged.pdf');
    console.log('');
    console.log('Options:');
    console.log('  --output <file>   Output PDF file (required)');
    console.log('  --help, -h        Show this help message');
    console.log('  --version, -v     Show version number');
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

async function main(): Promise<void> {
  try {
    const { inputFiles, outputFile } = parseArgs();
    
    console.log(`\n📄 PDF Merger v${packageJson.version}`);
    console.log(`📁 Input files (${inputFiles.length}):`);
    inputFiles.forEach((file, i) => console.log(`  ${i + 1}. ${file}`));
    console.log(`📝 Output file: ${outputFile}\n`);
    
    const startTime = Date.now();
    await mergePdfs(inputFiles, outputFile);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`⏱️  Completed in ${duration}s\n`);
  } catch (error) {
    console.error(`\n❌ Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main();