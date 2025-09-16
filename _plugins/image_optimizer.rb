# Jekyll plugin to auto-optimize images during build
# Place in _plugins/ directory

Jekyll::Hooks.register :site, :post_write do |site|
  # Only run in production builds
  next unless Jekyll.env == 'production'

  puts "Optimizing images..."
  system("./optimize_images.sh")
end