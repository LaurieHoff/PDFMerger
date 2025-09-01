# PDFMerger

A simple and efficient command-line tool to merge multiple PDF files into a single document.

## Features

- ✅ Merge multiple PDF files in order
- 📄 Preserve all pages from input files  
- 🚀 Progress tracking with page count
- 🔍 File validation and comprehensive error handling
- ⚠️  Large file size warnings
- 🎯 Cross-platform support

## Installation

### Local Development
```bash
git clone https://github.com/LaurieHoff/PDFMerger.git
cd PDFMerger
npm install
npm run build
```

### Global Installation (after npm publish)
```bash
npm install -g pdf-merger
```

## Usage

### Development Mode
```bash
npm start file1.pdf file2.pdf file3.pdf --output merged.pdf
```

### After Global Installation
```bash
pdf-merger file1.pdf file2.pdf file3.pdf --output merged.pdf
```

### Examples
```bash
# Merge three PDFs
npm start doc1.pdf doc2.pdf doc3.pdf --output combined.pdf

# Show help
npm start --help

# Show version
npm start --version
```

## CLI Options

- `--output <file>` - Output PDF file (required)
- `--help, -h` - Show help message
- `--version, -v` - Show version number

## Requirements

- Node.js 14+
- TypeScript (for development)

## Scripts

```bash
npm run build    # Compile TypeScript to JavaScript
npm start        # Run the merger tool
npm run dev      # Run in development mode
```

## License

MIT © LaurieHoff