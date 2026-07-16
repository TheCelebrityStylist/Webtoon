import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const root=process.cwd();
const sourceRoots=["app","components","integrations","lib","server","prisma","public"];
const ignored=new Set(["node_modules",".next","test-results","playwright-report"]);
const files=[];
async function walk(path){for(const entry of await readdir(path,{withFileTypes:true})){if(ignored.has(entry.name)||entry.name.includes(" 2."))continue;const full=join(path,entry.name);if(entry.isDirectory())await walk(full);else if(/\.(?:ts|tsx|js|mjs|prisma|md)$/.test(entry.name))files.push(full)}}
for(const dir of sourceRoots){try{if((await stat(join(root,dir))).isDirectory())await walk(join(root,dir))}catch{}}
const content=new Map(await Promise.all(files.map(async file=>[relative(root,file),await readFile(file,"utf8")])));

const failures=[];
const publicCopy=[...content].filter(([path])=>/^(app|components|lib)\//.test(path));
const unfinished=/\b(?:working name|trademark unverified|domain unverified|pricing pending|under commercial review|coming later|fake testimonial|lorem ipsum)\b/i;
for(const[path,text]of publicCopy)if(unfinished.test(text))failures.push(`unfinished public language: ${path}`);

const secretPatterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/AIza[0-9A-Za-z_-]{35}/,/ghp_[0-9A-Za-z]{36}/,/sk-[A-Za-z0-9]{32,}/];
for(const[path,text]of content)for(const pattern of secretPatterns)if(pattern.test(text))failures.push(`possible secret: ${path}`);

for(const[path,text]of content){
  if(/href\s*=\s*["']#["']/.test(text))failures.push(`fake internal link: ${path}`);
  if(/onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}/.test(text))failures.push(`empty click handler: ${path}`);
}

const i18n=content.get("lib/i18n.ts")??"";
const requiredLocales=["en","nl","de","es","pt"];
for(const locale of requiredLocales)if(!new RegExp(`(?:const ${locale}\\s*=|\\b${locale}:\\s*\\{)`).test(i18n))failures.push(`missing locale dictionary: ${locale}`);
const englishKeys=[...((i18n.match(/const en = \{([^}]+)\}/s)?.[1]??"").matchAll(/(\w+):/g))].map(match=>match[1]);
for(const locale of requiredLocales.slice(1)){const body=i18n.match(new RegExp(`\\b${locale}:\\{([^}]+)\\}`,"s"))?.[1]??"";for(const key of englishKeys)if(!new RegExp(`\\b${key}:`).test(body))failures.push(`missing ${locale} translation key: ${key}`)}

const sitemap=content.get("app/sitemap.ts")??"";
for(const token of ["marketingPages","articles","/blog","/sign-in","/sign-up"])if(!sitemap.includes(token))failures.push(`sitemap source missing ${token}`);
const blog=content.get("lib/blog.ts")??"";
for(const field of ["searchIntent","publishedAt","revisedAt","author","category","tags","description"])if(!blog.includes(field))failures.push(`content model missing ${field}`);
if(!blog.includes("Frequently asked questions"))failures.push("pillar content missing FAQ");

if(failures.length){console.error(failures.join("\n"));process.exit(1)}
console.log(`Quality checks passed: ${files.length} files; public language, secrets, locale keys, sitemap source, and content model validated.`);
