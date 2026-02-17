/**
 * NorthStar Backend API Server
 * Proxies requests to Telivy API + Blog CMS API
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, readFile, writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import matter from 'gray-matter';
import { marked } from 'marked';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const app = express();
const PORT = process.env.PORT || 3001;

const TELIVY_API_KEY = process.env.VITE_TELIVY_API_KEY;
const TELIVY_BASE_URL = 'https://api-v1.telivy.com/api/v1';

if (!TELIVY_API_KEY) {
  console.error('❌ VITE_TELIVY_API_KEY not found in .env.local');
  process.exit(1);
}

// Blog paths
const BLOG_DIR = join(__dirname, 'content', 'blog');
const UPLOADS_DIR = join(__dirname, 'public', 'uploads', 'blog');

// Ensure directories exist
if (!existsSync(BLOG_DIR)) await mkdir(BLOG_DIR, { recursive: true });
if (!existsSync(UPLOADS_DIR)) await mkdir(UPLOADS_DIR, { recursive: true });

// Multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = file.originalname.split('.').pop();
      cb(null, `${uniqueSuffix}.${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '5mb' }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), telivyConfigured: !!TELIVY_API_KEY });
});

// ==================== BLOG API ====================

async function getAllPosts() {
  const files = await readdir(BLOG_DIR);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  const posts = [];
  for (const file of mdFiles) {
    const raw = await readFile(join(BLOG_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    posts.push({ ...data, _file: file, _contentLength: content.length });
  }
  // Sort by publishedAt descending
  posts.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  return posts;
}

async function getPostBySlug(slug) {
  const files = await readdir(BLOG_DIR);
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const raw = await readFile(join(BLOG_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    if (data.slug === slug) {
      const html = marked(content);
      return { ...data, content: html, rawContent: content, _file: file };
    }
  }
  return null;
}

// GET /api/blog/posts
app.get('/api/blog/posts', async (req, res) => {
  try {
    let posts = await getAllPosts();
    const { status, category } = req.query;
    if (status) posts = posts.filter(p => p.status === status);
    if (category) posts = posts.filter(p => p.category === category);
    // Strip internal fields for list
    const clean = posts.map(({ _file, _contentLength, ...rest }) => rest);
    res.json(clean);
  } catch (err) {
    console.error('Error listing posts:', err);
    res.status(500).json({ error: 'Failed to list posts' });
  }
});

// GET /api/blog/posts/:slug
app.get('/api/blog/posts/:slug', async (req, res) => {
  try {
    const post = await getPostBySlug(req.params.slug);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const { _file, ...clean } = post;
    res.json(clean);
  } catch (err) {
    console.error('Error getting post:', err);
    res.status(500).json({ error: 'Failed to get post' });
  }
});

// POST /api/blog/posts
app.post('/api/blog/posts', async (req, res) => {
  try {
    const { title, slug, excerpt, category, tags, metaDescription, ogImage, author, status, content } = req.body;
    if (!title || !slug) return res.status(400).json({ error: 'title and slug are required' });

    const frontmatter = {
      title, slug, excerpt: excerpt || '',
      category: category || 'News & Updates',
      tags: tags || [],
      metaDescription: metaDescription || '',
      ogImage: ogImage || '',
      author: author || 'NorthStar Team',
      status: status || 'draft',
      publishedAt: status === 'published' ? new Date().toISOString() : '',
      updatedAt: new Date().toISOString(),
    };

    const md = matter.stringify(content || '', frontmatter);
    const filename = `${slug}.md`;
    await writeFile(join(BLOG_DIR, filename), md);
    res.status(201).json({ ...frontmatter, message: 'Post created' });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT /api/blog/posts/:slug
app.put('/api/blog/posts/:slug', async (req, res) => {
  try {
    const existing = await getPostBySlug(req.params.slug);
    if (!existing) return res.status(404).json({ error: 'Post not found' });

    const { title, slug, excerpt, category, tags, metaDescription, ogImage, author, status, content } = req.body;

    const frontmatter = {
      title: title ?? existing.title,
      slug: slug ?? existing.slug,
      excerpt: excerpt ?? existing.excerpt,
      category: category ?? existing.category,
      tags: tags ?? existing.tags,
      metaDescription: metaDescription ?? existing.metaDescription,
      ogImage: ogImage ?? existing.ogImage,
      author: author ?? existing.author,
      status: status ?? existing.status,
      publishedAt: existing.publishedAt || (status === 'published' ? new Date().toISOString() : ''),
      updatedAt: new Date().toISOString(),
    };

    const rawContent = content !== undefined ? content : existing.rawContent;
    const md = matter.stringify(rawContent, frontmatter);

    // If slug changed, delete old file and write new
    if (slug && slug !== req.params.slug) {
      await unlink(join(BLOG_DIR, existing._file));
      await writeFile(join(BLOG_DIR, `${slug}.md`), md);
    } else {
      await writeFile(join(BLOG_DIR, existing._file), md);
    }

    res.json({ ...frontmatter, message: 'Post updated' });
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /api/blog/posts/:slug
app.delete('/api/blog/posts/:slug', async (req, res) => {
  try {
    const post = await getPostBySlug(req.params.slug);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    await unlink(join(BLOG_DIR, post._file));
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// POST /api/blog/upload
app.post('/api/blog/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/blog/${req.file.filename}`;
  res.json({ url, filename: req.file.filename, size: req.file.size });
});

// ==================== WEBINAR API ====================

const WEBINAR_DIR = join(__dirname, 'content', 'webinars');
if (!existsSync(WEBINAR_DIR)) await mkdir(WEBINAR_DIR, { recursive: true });

async function getAllWebinars() {
  const files = await readdir(WEBINAR_DIR);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  const webinars = [];
  for (const file of mdFiles) {
    const raw = await readFile(join(WEBINAR_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    webinars.push({ ...data, _file: file, _contentLength: content.length });
  }
  webinars.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return webinars;
}

async function getWebinarBySlug(slug) {
  const files = await readdir(WEBINAR_DIR);
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const raw = await readFile(join(WEBINAR_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    if (data.slug === slug) {
      const html = marked(content);
      return { ...data, content: html, rawContent: content, _file: file };
    }
  }
  return null;
}

// GET /api/webinars
app.get('/api/webinars', async (req, res) => {
  try {
    let webinars = await getAllWebinars();
    const { status, type } = req.query;
    if (status) webinars = webinars.filter(w => w.status === status);
    if (type) webinars = webinars.filter(w => w.type === type);
    const clean = webinars.map(({ _file, _contentLength, ...rest }) => rest);
    res.json(clean);
  } catch (err) {
    console.error('Error listing webinars:', err);
    res.status(500).json({ error: 'Failed to list webinars' });
  }
});

// GET /api/webinars/:slug
app.get('/api/webinars/:slug', async (req, res) => {
  try {
    const webinar = await getWebinarBySlug(req.params.slug);
    if (!webinar) return res.status(404).json({ error: 'Webinar not found' });
    const { _file, ...clean } = webinar;
    res.json(clean);
  } catch (err) {
    console.error('Error getting webinar:', err);
    res.status(500).json({ error: 'Failed to get webinar' });
  }
});

// POST /api/webinars
app.post('/api/webinars', async (req, res) => {
  try {
    const { title, slug, description, type, youtubeUrl, registrationUrl, date, duration, speakers, topics, metaDescription, ogImage, status, content } = req.body;
    if (!title || !slug) return res.status(400).json({ error: 'title and slug are required' });

    const frontmatter = {
      title, slug, description: description || '',
      type: type || 'upcoming',
      youtubeUrl: youtubeUrl || '',
      registrationUrl: registrationUrl || '',
      date: date || '',
      duration: duration || '',
      speakers: speakers || [],
      topics: topics || [],
      metaDescription: metaDescription || '',
      ogImage: ogImage || '',
      status: status || 'draft',
      publishedAt: status === 'published' ? new Date().toISOString() : '',
      updatedAt: new Date().toISOString(),
    };

    const md = matter.stringify(content || '', frontmatter);
    await writeFile(join(WEBINAR_DIR, `${slug}.md`), md);
    res.status(201).json({ ...frontmatter, message: 'Webinar created' });
  } catch (err) {
    console.error('Error creating webinar:', err);
    res.status(500).json({ error: 'Failed to create webinar' });
  }
});

// PUT /api/webinars/:slug
app.put('/api/webinars/:slug', async (req, res) => {
  try {
    const existing = await getWebinarBySlug(req.params.slug);
    if (!existing) return res.status(404).json({ error: 'Webinar not found' });

    const { title, slug, description, type, youtubeUrl, registrationUrl, date, duration, speakers, topics, metaDescription, ogImage, status, content } = req.body;

    const frontmatter = {
      title: title ?? existing.title,
      slug: slug ?? existing.slug,
      description: description ?? existing.description,
      type: type ?? existing.type,
      youtubeUrl: youtubeUrl ?? existing.youtubeUrl,
      registrationUrl: registrationUrl ?? existing.registrationUrl,
      date: date ?? existing.date,
      duration: duration ?? existing.duration,
      speakers: speakers ?? existing.speakers,
      topics: topics ?? existing.topics,
      metaDescription: metaDescription ?? existing.metaDescription,
      ogImage: ogImage ?? existing.ogImage,
      status: status ?? existing.status,
      publishedAt: existing.publishedAt || (status === 'published' ? new Date().toISOString() : ''),
      updatedAt: new Date().toISOString(),
    };

    const rawContent = content !== undefined ? content : existing.rawContent;
    const md = matter.stringify(rawContent, frontmatter);

    if (slug && slug !== req.params.slug) {
      await unlink(join(WEBINAR_DIR, existing._file));
      await writeFile(join(WEBINAR_DIR, `${slug}.md`), md);
    } else {
      await writeFile(join(WEBINAR_DIR, existing._file), md);
    }

    res.json({ ...frontmatter, message: 'Webinar updated' });
  } catch (err) {
    console.error('Error updating webinar:', err);
    res.status(500).json({ error: 'Failed to update webinar' });
  }
});

// DELETE /api/webinars/:slug
app.delete('/api/webinars/:slug', async (req, res) => {
  try {
    const webinar = await getWebinarBySlug(req.params.slug);
    if (!webinar) return res.status(404).json({ error: 'Webinar not found' });
    await unlink(join(WEBINAR_DIR, webinar._file));
    res.json({ message: 'Webinar deleted' });
  } catch (err) {
    console.error('Error deleting webinar:', err);
    res.status(500).json({ error: 'Failed to delete webinar' });
  }
});

// ==================== SCAN LEADS API ====================

const SCAN_LEADS_FILE = join(__dirname, 'data', 'scan-leads.json');
if (!existsSync(join(__dirname, 'data'))) await mkdir(join(__dirname, 'data'), { recursive: true });

app.post('/api/scan-leads', async (req, res) => {
  try {
    const { firstName, lastName, email, company, domain, results, timestamp } = req.body;
    if (!firstName || !lastName || !email || !company || !domain) {
      return res.status(400).json({ error: 'Missing required fields: firstName, lastName, email, company, domain' });
    }

    const lead = { firstName, lastName, email, company, domain, results, timestamp: timestamp || new Date().toISOString() };

    let leads = [];
    if (existsSync(SCAN_LEADS_FILE)) {
      try {
        const raw = await readFile(SCAN_LEADS_FILE, 'utf-8');
        leads = JSON.parse(raw);
      } catch { leads = []; }
    }
    leads.push(lead);
    await writeFile(SCAN_LEADS_FILE, JSON.stringify(leads, null, 2));

    console.log(`📧 New scan lead: ${firstName} ${lastName} (${email}) - ${domain}`);
    res.json({ message: 'Lead captured successfully' });
  } catch (err) {
    console.error('Error saving scan lead:', err);
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

// ==================== TELIVY API ENDPOINTS ====================

async function telivyRequest(endpoint, options = {}) {
  const url = `${TELIVY_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: { 'x-api-key': TELIVY_API_KEY, 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.json();
  if (!response.ok) throw { status: response.status, message: data.message || `Telivy API error: ${response.status}`, data };
  return data;
}

app.post('/api/assessments/create', async (req, res) => {
  try {
    const { organizationName, domain, clientCategory, clientStatus } = req.body;
    if (!organizationName || !domain) return res.status(400).json({ error: 'Missing required fields: organizationName, domain' });
    const data = await telivyRequest('/security/external-scans', {
      method: 'POST',
      body: JSON.stringify({
        organizationName, domain: domain.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, ''),
        clientCategory: clientCategory || 'it_and_security', clientStatus: clientStatus || 'lead',
      }),
    });
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to create assessment', details: error.data });
  }
});

app.get('/api/assessments/:id', async (req, res) => {
  try { res.json(await telivyRequest(`/security/external-scans/${req.params.id}`)); }
  catch (error) { res.status(error.status || 500).json({ error: error.message || 'Failed to fetch assessment' }); }
});

app.get('/api/assessments/:id/findings', async (req, res) => {
  try { res.json(await telivyRequest(`/security/external-scans/${req.params.id}/findings`)); }
  catch (error) { res.status(error.status || 500).json({ error: error.message || 'Failed to fetch findings' }); }
});

// Breach data
app.get('/api/assessments/:id/breach-data', async (req, res) => {
  try { res.json(await telivyRequest(`/security/external-scans/${req.params.id}/breach-data`)); }
  catch (error) { res.status(error.status || 500).json({ error: error.message || 'Failed to fetch breach data' }); }
});

// Finding details by slug
app.get('/api/assessments/:id/findings/:slug', async (req, res) => {
  try { res.json(await telivyRequest(`/security/external-scans/${req.params.id}/findings/${req.params.slug}`)); }
  catch (error) { res.status(error.status || 500).json({ error: error.message || 'Failed to fetch finding details' }); }
});

// Report download (stream binary)
app.get('/api/assessments/:id/report', async (req, res) => {
  try {
    const format = req.query.format || 'pdf';
    const detailed = req.query.detailed === 'true' ? 'true' : 'false';
    const url = `${TELIVY_BASE_URL}/security/external-scans/${req.params.id}/report?format=${format}&detailed=${detailed}`;
    const response = await fetch(url, {
      headers: { 'x-api-key': TELIVY_API_KEY },
    });
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text || 'Failed to fetch report' });
    }
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/pdf');
    const disposition = response.headers.get('content-disposition');
    if (disposition) res.setHeader('Content-Disposition', disposition);
    else res.setHeader('Content-Disposition', `attachment; filename="security-report.${format}"`);
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch report' });
  }
});

app.get('/api/assessments', async (req, res) => {
  try {
    const { search, limit, offset } = req.query;
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (limit) queryParams.append('limit', limit);
    if (offset) queryParams.append('offset', offset);
    const query = queryParams.toString();
    res.json(await telivyRequest(query ? `/security/external-scans?${query}` : '/security/external-scans'));
  } catch (error) { res.status(error.status || 500).json({ error: error.message || 'Failed to list assessments' }); }
});

// ==================== SITE SETTINGS API ====================

const SETTINGS_FILE = join(__dirname, 'data', 'site-settings.json');

const DEFAULT_SETTINGS = {
  banner: {
    enabled: true,
    text: "📅 AI Boardroom: Real AI. Real Results. Feb 11 - Register Free →",
    link: "https://info.northstar-tg.com/ai-boardroom-feb",
    style: "gradient"
  },
  featuredWebinar: {
    enabled: true,
    title: "Welcome to the AI Boardroom: Real AI. Real Use Cases. Real Results.",
    date: "February 11, 2026",
    time: "12:00 PM CT",
    description: "It's your space to see AI in action, live, every month.",
    registrationLink: "https://info.northstar-tg.com/ai-boardroom-feb",
    speaker: { name: "", title: "", bio: "" },
    host: { name: "", title: "" }
  }
};

async function getSettings() {
  try {
    const raw = await readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const settings = req.body;
    await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== AI SEO ASSISTANT ====================
// Optional Azure OpenAI config - falls back to smart mock without these:
// AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
// AZURE_OPENAI_KEY=your-api-key
// AZURE_OPENAI_DEPLOYMENT=your-deployment-name

const SEO_SYSTEM_PROMPT = `You are an SEO and AI Search optimization specialist for NorthStar Technology Group, a managed IT services and cybersecurity company serving healthcare, financial, and industrial organizations.

Your job is to optimize content for BOTH traditional search engines (Google, Bing) AND AI search systems (ChatGPT, Perplexity, Google AI Overviews, Copilot). AI search engines pull from content that is clearly structured, authoritative, and directly answers questions.

Generate SEO metadata for the given content following these guidelines:

## Traditional SEO
- Title: Include primary keyword near the beginning, under 60 characters, compelling for clicks
- Meta Description: 150-160 characters, include primary keyword, clear value proposition, include a call-to-action
- Slug: Short, keyword-rich, lowercase with hyphens, no stop words

## AI Search Optimization
- Excerpt: 2-3 sentences written as a direct, factual answer to the implied question. AI search engines favor content that reads like a definitive answer. Start with the key takeaway, not a teaser.
- Tags: 3-5 relevant tags, include both broad terms (for AI context) and specific long-tail terms
- faq: Generate 2-3 FAQ Q&A pairs derived from the content. Each answer should be 1-2 sentences, factual, and self-contained (AI search engines extract these directly). Format: [{"q": "...", "a": "..."}]
- ai_summary: One crisp sentence (under 30 words) that an AI assistant would use to cite this article. Should sound like a fact, not marketing copy.

## Shared Rules
- Tags from this list when applicable: cybersecurity, compliance, HIPAA, managed IT, AI, cloud, data protection, ransomware, phishing, risk assessment, incident response, business continuity, vCISO, network security, employee training, CMMC, NIST, FTC Safeguards, ITAR, dark web monitoring, email security, endpoint protection
- Category: Choose the single best fit from: Cybersecurity, Compliance, Managed IT, AI & Automation, IT Strategy, News & Updates

Target audience: IT decision makers, business owners, and compliance officers in regulated industries.
Tone: Authoritative, specific, no fluff. Write like an expert briefing a peer, not a marketer writing ad copy.
Never use em dashes (—). Use commas, periods, colons, or spaced hyphens instead.

Respond ONLY with valid JSON: { "title", "meta_description", "excerpt", "slug", "tags", "category", "faq", "ai_summary" }`;

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}

function smartMockSeoAssist(title, content, type) {
  const plainText = stripHtml(content || '');
  const words = plainText.split(/\s+/).filter(Boolean);

  // Extract first heading if present
  const headingMatch = (content || '').match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/i);
  const firstHeading = headingMatch ? stripHtml(headingMatch[1]) : '';

  // Get first 2 sentences for excerpt
  const sentences = plainText.match(/[^.!?]+[.!?]+/g) || [];
  const excerpt = sentences.slice(0, 2).join(' ').trim() || plainText.slice(0, 200);

  // Keyword matching
  const knownTags = [
    'cybersecurity', 'compliance', 'HIPAA', 'managed IT', 'AI', 'cloud',
    'data protection', 'ransomware', 'phishing', 'risk assessment',
    'incident response', 'business continuity', 'vCISO', 'network security', 'employee training'
  ];
  const lowerText = (title + ' ' + plainText).toLowerCase();
  const matchedTags = knownTags.filter(tag => lowerText.includes(tag.toLowerCase()));
  if (matchedTags.length === 0) matchedTags.push('cybersecurity', 'managed IT');

  // Category detection
  const categories = {
    'Cybersecurity': ['cybersecurity', 'ransomware', 'phishing', 'threat', 'attack', 'breach', 'malware', 'vulnerability'],
    'Compliance': ['compliance', 'hipaa', 'regulation', 'audit', 'framework', 'nist', 'cmmc'],
    'Managed IT': ['managed', 'msp', 'helpdesk', 'infrastructure', 'monitoring', 'support'],
    'AI & Automation': ['ai', 'artificial intelligence', 'automation', 'machine learning', 'chatbot'],
    'IT Strategy': ['strategy', 'planning', 'budget', 'roadmap', 'digital transformation'],
    'News & Updates': ['news', 'update', 'announcement', 'release'],
  };
  let bestCategory = 'Cybersecurity';
  let bestScore = 0;
  for (const [cat, keywords] of Object.entries(categories)) {
    const score = keywords.filter(k => lowerText.includes(k)).length;
    if (score > bestScore) { bestScore = score; bestCategory = cat; }
  }

  // Generate suggested title
  const suggestedTitle = title
    ? (title.length > 60 ? title.slice(0, 57) + '...' : title)
    : (firstHeading || plainText.slice(0, 55).trim() + '...');

  // Generate slug
  const slugSource = title || firstHeading || plainText.slice(0, 60);
  const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'and', 'or', 'but', 'not', 'your', 'you', 'how', 'what', 'why', 'this', 'that'];
  const suggestedSlug = slugSource.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter(w => !stopWords.includes(w) && w.length > 0)
    .slice(0, 6)
    .join('-');

  // Meta description (150-160 chars)
  let metaDesc = excerpt.slice(0, 155);
  if (metaDesc.length > 150) metaDesc = metaDesc.slice(0, metaDesc.lastIndexOf(' ')) + '. Learn more.';
  else metaDesc += ' Learn more.';
  if (metaDesc.length > 160) metaDesc = metaDesc.slice(0, 157) + '...';

  // OG image alt
  const ogImageAlt = `${suggestedTitle} - NorthStar Technology Group ${type === 'webinar' ? 'Webinar' : 'Blog'}`;

  return {
    title: suggestedTitle,
    slug: suggestedSlug,
    excerpt: excerpt.slice(0, 300),
    metaDescription: metaDesc,
    tags: matchedTags.slice(0, 5),
    category: bestCategory,
    ogImageAlt: ogImageAlt.slice(0, 125),
  };
}

async function callAzureOpenAI(title, content, type) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const key = process.env.AZURE_OPENAI_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

  const plainText = stripHtml(content || '').slice(0, 4000);
  const userMessage = `Type: ${type}\nTitle: ${title || '(none)'}\n\nContent:\n${plainText}`;

  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': key },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: SEO_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Azure OpenAI error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in AI response');
  return JSON.parse(jsonMatch[0]);
}

app.post('/api/ai/seo-assist', async (req, res) => {
  try {
    const { title, content, type } = req.body;
    if (!content || stripHtml(content).length < 30) {
      return res.status(400).json({ error: 'Content is too short for analysis. Add more content first.' });
    }

    const hasAzure = process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY && process.env.AZURE_OPENAI_DEPLOYMENT;

    let result;
    if (hasAzure) {
      try {
        result = await callAzureOpenAI(title, content, type || 'blog');
      } catch (err) {
        console.error('Azure OpenAI failed, falling back to mock:', err.message);
        result = smartMockSeoAssist(title, content, type || 'blog');
        result._fallback = true;
      }
    } else {
      result = smartMockSeoAssist(title, content, type || 'blog');
      result._mock = true;
    }

    res.json(result);
  } catch (err) {
    console.error('SEO assist error:', err);
    res.status(500).json({ error: 'Failed to generate SEO suggestions' });
  }
});

// ==================== 404 HANDLER ====================

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found', path: req.path,
    availableEndpoints: [
      'GET /health',
      'GET /api/blog/posts', 'GET /api/blog/posts/:slug',
      'POST /api/blog/posts', 'PUT /api/blog/posts/:slug', 'DELETE /api/blog/posts/:slug',
      'POST /api/blog/upload',
      'GET /api/webinars', 'GET /api/webinars/:slug',
      'POST /api/webinars', 'PUT /api/webinars/:slug', 'DELETE /api/webinars/:slug',
      'GET /api/settings', 'PUT /api/settings',
      'POST /api/scan-leads',
      'POST /api/assessments/create', 'GET /api/assessments/:id',
      'GET /api/assessments/:id/findings', 'GET /api/assessments',
      'POST /api/ai/seo-assist',
    ],
  });
});

// ==================== ERROR HANDLER ====================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ==================== START SERVER ====================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 NorthStar Backend API Server`);
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Blog API: /api/blog/posts`);
  console.log(`✅ Telivy API configured: ${TELIVY_API_KEY ? 'Yes' : 'No'}\n`);
});

process.on('SIGTERM', () => { process.exit(0); });
process.on('SIGINT', () => { process.exit(0); });
