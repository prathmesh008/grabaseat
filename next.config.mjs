/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      dangerouslyAllowSVG: true,
        domains: ['placehold.co', 'img.freepik.com'], // Add 'placehold.jp' to the list of allowed domains
      },
};

export default nextConfig;
