import {
  type SimpleIcon,
  siBetterauth,
  siCloudflare,
  siCloudflareworkers,
  siCplusplus,
  siCss,
  siDocker,
  siDrizzle,
  siEthers,
  siExpo,
  siExpress,
  siGnubash,
  siHono,
  siHtml5,
  siIpfs,
  siJavascript,
  siMongodb,
  siMysql,
  siNeon,
  siNestjs,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPrisma,
  siReact,
  siShadcnui,
  siSocketdotio,
  siSolidity,
  siSqlite,
  siTailwindcss,
  siTanstack,
  siTypescript,
  siWeb3dotjs,
  siZod,
} from "simple-icons";

/**
 * Turns a technology label into a lookup key: lower-case, letters and digits only, with a
 * trailing "js" dropped. "Next.js", "Next JS" and "next" all become `next`, so the same
 * logo is found however a label is written in skills, experience or project data.
 *
 * @param name - Technology label as written in the content.
 */
export function techKey(name: string): string {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return key.length > 4 && key.endsWith("js") ? key.slice(0, -2) : key;
}

/** Brand logos keyed by `techKey`. Technologies without a brand logo are simply absent. */
const ICONS_BY_KEY: Record<string, SimpleIcon> = {
  javascript: siJavascript,
  typescript: siTypescript,
  c: siCplusplus, // "C++" loses its plus signs in `techKey`
  solidity: siSolidity,
  bash: siGnubash,
  html: siHtml5,
  css: siCss,
  next: siNextdotjs,
  react: siReact,
  reactnativeexpo: siExpo,
  node: siNodedotjs,
  express: siExpress,
  hono: siHono,
  nest: siNestjs, // `techKey` drops the trailing "js" of "NestJS"
  tailwindcss: siTailwindcss,
  drizzleorm: siDrizzle,
  prismaorm: siPrisma,
  zod: siZod,
  tanstacktable: siTanstack,
  shadcnui: siShadcnui,
  shadcn: siShadcnui,
  socketio: siSocketdotio,
  docker: siDocker,
  web3: siWeb3dotjs,
  ethers: siEthers,
  ipfs: siIpfs,
  pinataipfs: siIpfs,
  postgresql: siPostgresql,
  mysql: siMysql,
  sqlite: siSqlite,
  sqlitecloudflared1: siSqlite,
  mongodb: siMongodb,
  neon: siNeon,
  betterauth: siBetterauth,
  cloudflare: siCloudflare,
  cloudflareworkers: siCloudflareworkers,
  cloudflared1: siCloudflare,
  cloudflarer2: siCloudflare,
};

/**
 * Finds the brand logo for a technology label, or `undefined` when there isn't one.
 *
 * @param name - Technology label, in any of the spellings used across the site's content.
 */
export function findTechIcon(name: string): SimpleIcon | undefined {
  return ICONS_BY_KEY[techKey(name)];
}

/**
 * Whether a brand colour would vanish against a light or dark page background.
 * Near-black and near-white brand colours (Next.js, Express, TanStack...) are drawn in the
 * text colour instead, so they stay visible in both themes.
 *
 * @param hex - Six-digit hex colour without the `#`, as `simple-icons` supplies it.
 */
export function needsThemeColor(hex: string): boolean {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.06 || luminance > 0.8;
}
