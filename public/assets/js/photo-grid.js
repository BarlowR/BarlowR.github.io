/**
 * Port of the script from `_includes/photo_grid.html`. The Jekyll include
 * baked the image list into the page with Liquid; here the build embeds it as
 * JSON in the gallery's `data-images` attribute.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const kSpanMultiplier = 10;

    const gallery = document.getElementById('gallery');
    if (!gallery) return;
    const imageFiles = JSON.parse(gallery.dataset.images || '[]');

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    let currentImageIndex = 0;
    let loadedImages = new Set();
    let intersectionObserver;

    // Grid cells use the 640px webp the build generates next to each gallery
    // image (naming convention shared with src/lib/optimize-images.ts); the
    // lightbox keeps the full-size original.
    function thumbUrl(src) {
        return src.replace(/\.(jpe?g|png)$/i, '_thumb.webp');
    }

    // Performance optimizations
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // Preload first few images for faster initial display
    function preloadCriticalImages() {
        const criticalCount = Math.min(6, imageFiles.length);
        for (let i = 0; i < criticalCount; i++) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = thumbUrl(imageFiles[i]);
            document.head.appendChild(link);
        }
    }

    // Setup intersection observer for lazy loading
    function setupIntersectionObserver() {
        intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadImage(entry.target);
                    intersectionObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px',
            threshold: 0.1
        });
    }

    // Load individual image with optimization
    function loadImage(item) {
        const img = item.querySelector('img');
        const index = parseInt(item.dataset.index);

        if (loadedImages.has(index)) return;

        img.onload = function() {
            // Calculate layout efficiently
            const height = this.naturalHeight;
            const width = this.naturalWidth;
            const rowSpan = Math.ceil((height * kSpanMultiplier / width));

            // Use requestAnimationFrame for smooth layout updates
            requestAnimationFrame(() => {
                item.style.gridRowEnd = `span ${rowSpan}`;
                item.classList.remove('loading-placeholder');
                item.classList.add('loaded');
            });

            loadedImages.add(index);
        };

        img.onerror = function() {
            // Fall back to the original if the thumb is missing.
            if (this.src.endsWith('_thumb.webp')) {
                this.src = imageFiles[index];
                return;
            }
            console.warn(`Failed to load image: ${imageFiles[index]}`);
            item.style.display = 'none';
        };

        // Load the actual image
        img.src = thumbUrl(imageFiles[index]);
    }

    // Create gallery items with placeholders
    function createGalleryItems() {
        const fragment = document.createDocumentFragment();

        imageFiles.forEach((src, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item loading-placeholder';
            item.dataset.index = index;

            const img = document.createElement('img');
            img.alt = `Gallery image ${index + 1}`;
            img.loading = 'lazy'; // Native lazy loading as fallback

            // Set initial placeholder dimensions to prevent layout shift
            const aspectRatio = 1.2; // Default aspect ratio assumption
            const rowSpan = Math.ceil(kSpanMultiplier / aspectRatio);
            item.style.gridRowEnd = `span ${rowSpan}`;

            item.appendChild(img);
            fragment.appendChild(item);

            // Open lightbox on click
            item.addEventListener('click', function(e) {
                if (item.classList.contains('loaded')) {
                    openLightbox(index);
                }
            });

            // Observe for lazy loading (except first few images)
            if (index >= 6) {
                intersectionObserver.observe(item);
            } else {
                // Load first few images immediately
                setTimeout(() => loadImage(item), index * 50);
            }
        });

        gallery.appendChild(fragment);
    }

    // Optimized lightbox functions
    function openLightbox(index) {
        currentImageIndex = index;

        // Preload current and adjacent images for smoother navigation
        const preloadIndexes = [
            (index - 1 + imageFiles.length) % imageFiles.length,
            index,
            (index + 1) % imageFiles.length
        ];

        preloadIndexes.forEach(i => {
            if (!lightboxImg.src.includes(imageFiles[i])) {
                const preloadImg = new Image();
                preloadImg.src = imageFiles[i];
            }
        });

        lightboxImg.src = imageFiles[index];
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + imageFiles.length) % imageFiles.length;
        lightboxImg.src = imageFiles[currentImageIndex];
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % imageFiles.length;
        lightboxImg.src = imageFiles[currentImageIndex];
    }

    // Optimized resize handler
    const handleResize = debounce(() => {
        const items = document.querySelectorAll('.gallery-item.loaded');
        items.forEach(item => {
            const img = item.querySelector('img');
            if (img.complete && img.naturalWidth > 0) {
                const height = img.naturalHeight;
                const width = img.naturalWidth;
                const rowSpan = Math.ceil((kSpanMultiplier * height / width));
                item.style.gridRowEnd = `span ${rowSpan}`;
            }
        });
    }, 150);

    // Event listeners
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', showPrevImage);
    lightboxNext.addEventListener('click', showNextImage);

    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation with performance optimization
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    });

    window.addEventListener('resize', handleResize);

    // Initialize gallery with optimizations
    setupIntersectionObserver();
    preloadCriticalImages();
    createGalleryItems();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (intersectionObserver) {
            intersectionObserver.disconnect();
        }
    });
});
