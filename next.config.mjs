/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  output: isGithubPages ? "export" : undefined,
  basePath: isGithubPages ? "/shoppingdogam" : undefined,
  assetPrefix: isGithubPages ? "/shoppingdogam/" : undefined,
  trailingSlash: isGithubPages,
  images: {
    unoptimized: isGithubPages,
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  }
};

export default nextConfig;
