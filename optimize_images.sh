#!/bin/bash
# Image optimization script for Jekyll site

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting image optimization...${NC}"

# Check if required tools are installed
check_tools() {
    if ! command -v cwebp &> /dev/null; then
        echo -e "${RED}Error: cwebp not found. Install with: brew install webp${NC}"
        exit 1
    fi

    if ! command -v jpegoptim &> /dev/null; then
        echo -e "${YELLOW}Warning: jpegoptim not found. Install with: brew install jpegoptim${NC}"
    fi

    if ! command -v optipng &> /dev/null; then
        echo -e "${YELLOW}Warning: optipng not found. Install with: brew install optipng${NC}"
    fi
}

# Function to optimize a single image
optimize_image() {
    local file="$1"
    local dir=$(dirname "$file")
    local filename=$(basename "$file")
    local name="${filename%.*}"
    local ext="${filename##*.}"

    echo -e "Processing: ${YELLOW}$file${NC}"

    # Convert to WebP (60-80% smaller)
    if [[ ! -f "$dir/$name.webp" ]]; then
        cwebp -q 85 "$file" -o "$dir/$name.webp"
        echo -e "  ${GREEN}✓${NC} Created WebP version"
    else
        echo -e "  ${YELLOW}⚠${NC} WebP already exists"
    fi

    # Optimize original JPEG
    if [[ "$ext" == "jpg" || "$ext" == "jpeg" ]] && command -v jpegoptim &> /dev/null; then
        original_size=$(stat -f%z "$file")
        jpegoptim --size=150k --strip-all "$file"
        new_size=$(stat -f%z "$file")
        savings=$((original_size - new_size))
        if [ $savings -gt 0 ]; then
            echo -e "  ${GREEN}✓${NC} Optimized JPEG (saved ${savings} bytes)"
        fi
    fi

    # Optimize PNG
    if [[ "$ext" == "png" ]] && command -v optipng &> /dev/null; then
        optipng -o2 "$file"
        echo -e "  ${GREEN}✓${NC} Optimized PNG"
    fi
}

# Function to create responsive versions
create_responsive() {
    local file="$1"
    local dir=$(dirname "$file")
    local filename=$(basename "$file")
    local name="${filename%.*}"
    local ext="${filename##*.}"

    # Create smaller versions for thumbnails
    if [[ ! -f "$dir/${name}_thumb.webp" ]]; then
        cwebp -resize 400 0 -q 80 "$file" -o "$dir/${name}_thumb.webp"
        echo -e "  ${GREEN}✓${NC} Created thumbnail WebP"
    fi

    # Create medium version
    if [[ ! -f "$dir/${name}_medium.webp" ]]; then
        cwebp -resize 800 0 -q 85 "$file" -o "$dir/${name}_medium.webp"
        echo -e "  ${GREEN}✓${NC} Created medium WebP"
    fi
}

# Main execution
main() {
    check_tools

    echo -e "${GREEN}Optimizing images in content/ directory...${NC}"

    # Process specific directory or all images
    if [ "$1" ]; then
        # Process specific directory if provided
        search_path="$1"
        echo -e "${GREEN}Processing images in: $search_path${NC}"
    else
        # Process all images
        search_path="content/"
        echo -e "${GREEN}Processing all images in content/${NC}"
    fi

    find "$search_path" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read -r file; do
        optimize_image "$file"

        # Create responsive versions for cover photos and large images
        if [[ "$file" == *"cover_photo"* ]] || [[ $(stat -f%z "$file") -gt 200000 ]]; then
            create_responsive "$file"
        fi

        echo ""
    done

    echo -e "${GREEN}Image optimization complete!${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Update your photo includes to use WebP versions"
    echo "2. Consider using responsive image sizes for better performance"
    echo "3. Test loading speed improvements"
}

main "$@"