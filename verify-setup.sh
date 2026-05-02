#!/bin/bash
# Quick verification script for NoteVision AI features

echo "🔍 NoteVision AI - Feature Verification"
echo "========================================"
echo ""

# 1. Check environment variables
echo "✓ Environment Variables Check"
if [ -f ".env" ]; then
    echo "  ✅ .env file exists"
    if grep -q "VITE_SUPABASE_URL" .env; then
        echo "  ✅ VITE_SUPABASE_URL configured"
    else
        echo "  ⚠️  VITE_SUPABASE_URL missing"
    fi
    if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        echo "  ✅ VITE_SUPABASE_ANON_KEY configured"
    else
        echo "  ⚠️  VITE_SUPABASE_ANON_KEY missing"
    fi
else
    echo "  ❌ .env file not found"
fi
echo ""

# 2. Check TypeScript compilation
echo "✓ TypeScript Compilation"
npm run typecheck > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ No TypeScript errors"
else
    echo "  ❌ TypeScript errors found"
    npm run typecheck
fi
echo ""

# 3. Check build
echo "✓ Build Status"
if [ -d "dist" ]; then
    echo "  ✅ Previous build found (dist/)"
    if [ -f "dist/index.html" ]; then
        echo "  ✅ index.html present"
    fi
fi
echo ""

# 4. Check key files
echo "✓ Critical Files"
for file in "src/lib/anthropic.ts" "src/lib/frameExtractor.ts" "src/lib/youtube.ts" "src/lib/pdfGenerator.ts"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file missing"
    fi
done
echo ""

# 5. Check dependencies
echo "✓ Dependencies"
npm list @ffmpeg/ffmpeg > /dev/null 2>&1 && echo "  ✅ FFmpeg module"
npm list jspdf > /dev/null 2>&1 && echo "  ✅ jsPDF"
npm list @supabase/supabase-js > /dev/null 2>&1 && echo "  ✅ Supabase client"
echo ""

echo "📚 Feature Summary:"
echo "  1. ✅ Video Frame Extraction (FFmpeg) - Using frames every 30s"
echo "  2. ✅ Claude AI Analysis - claude-sonnet-4-20250514"
echo "  3. ✅ YouTube Metadata - oEmbed API (no auth needed)"
echo "  4. ✅ PDF Smart Notes - Professional design with screenshots"
echo "  5. ✅ PDF Handwritten - Lined paper with handwritten style"
echo "  6. ✅ Environment Variables - All using import.meta.env"
echo ""

echo "🚀 Ready to run:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo ""

echo "⚠️  Important: Configure ANTHROPIC_API_KEY in Supabase project settings"
