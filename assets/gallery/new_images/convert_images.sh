#!/bin/bash

# Simple Batch Image Converter
# Quick script for basic web conversion with fixed width

# Configuration - Edit these values as needed
WIDTH=2400              # Target width in pixels
QUALITY=85              # JPEG quality (1-100)
OUTPUT_DIR="converted" # Output directory

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "Converting images to width: ${WIDTH}px"
echo "Output directory: $OUTPUT_DIR"
echo ""

# Process all images in current directory
for img in *.{jpg,jpeg,JPG,JPEG,png,PNG,gif,GIF,bmp,BMP}; do
    # Skip if no matching files
    [ -f "$img" ] || continue
    
    # Get filename without extension
    filename="${img%.*}"
    
    echo "Processing: $img"
    
    # Convert to JPEG with fixed width
    # -resize ${WIDTH}x\> means: resize to WIDTH pixels wide, maintaining aspect ratio
    # The \> means only shrink larger images, don't enlarge smaller ones
    magick convert "$img" \
        -resize ${WIDTH}x\> \
        -quality $QUALITY \
        -strip \
        -interlace Plane \
        -colorspace sRGB \
        -auto-orient \
        "${OUTPUT_DIR}/${filename}.jpg"
done

echo ""
echo "Conversion complete! Check $OUTPUT_DIR directory"

# Show file count
count=$(ls -1 "$OUTPUT_DIR"/*.jpg 2>/dev/null | wc -l)
echo "Converted $count images"
