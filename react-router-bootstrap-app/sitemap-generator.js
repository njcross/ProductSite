// generate-sitemap.js
const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');

(async () => {
  const sitemap = new SitemapStream({ hostname: 'https://www.myplaytray.com' });

  const links = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/about' },
    { url: '/cards' },
    { url: '/register' },
    { url: '/login' },
    { url: '/cart' },
    { url: '/settings' },
    { url: '/favorites' },
    { url: '/newsletter' },
    { url: '/orders' },
    // Add dynamic routes here if needed
  ];

  const writeStream = createWriteStream('./public/sitemap.xml');
  for (const link of links) sitemap.write(link);
  sitemap.end();

  await streamToPromise(sitemap).then(data => writeStream.write(data));
})();
