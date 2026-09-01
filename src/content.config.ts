import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Keep the *source path* (relative to the collection base, extension stripped) as
 * the entry id instead of Astro's default github-slugger id. The default mangles
 * `Balancing_Speed_to_Fly_&_Risk_Tolerance` into
 * `balancing_speed_to_fly__risk_tolerance`, which is neither the on-disk path nor
 * the URL we want. Keeping the raw path means ids stay unique per file and every
 * URL can be derived from them in `src/lib/slug.ts`.
 */
const idFromSourcePath = ({ entry }: { entry: string }) => entry.replace(/\.[^./]+$/, '');

/**
 * Jekyll excludes `published: false` documents from the build. Tolerate the value
 * being absent (Jekyll's default is published) or a quoted string.
 */
const published = z
  .union([z.boolean(), z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === 'boolean') return value;
    return value.trim().toLowerCase() !== 'false';
  });

/**
 * Trip front matter carries `latitude`/`longitude` that are sometimes numbers,
 * sometimes placeholders (`na`, `x`, `222`) and sometimes an empty value.
 */
const looseCoordinate = z.union([z.number(), z.string(), z.boolean(), z.null()]).optional();

const common = {
  published,
  title: z.string(),
  /** `trip` | `project` | `blog_post` | `gallery` | `books` — left open on purpose. */
  category: z.string().optional(),
  /** Jekyll layout name; the sidebar still keys off `project-report`. */
  layout: z.string().optional(),
  cover_photo: z.string().optional(),
};

const trips = defineCollection({
  loader: glob({
    base: './content/trips',
    pattern: '**/*.md',
    generateId: idFromSourcePath,
  }),
  // `date` is required here (and only here) because the sidebar groups and orders
  // trips by it; a missing date should be a loud build failure, not a silent
  // misplacement in the navigation.
  schema: z.object({
    ...common,
    date: z.coerce.date(),
    latitude: looseCoordinate,
    longitude: looseCoordinate,
  }),
});

const projects = defineCollection({
  loader: glob({
    base: './content/projects',
    pattern: '**/*.md',
    generateId: idFromSourcePath,
  }),
  schema: z.object({
    ...common,
    date: z.coerce.date().optional(),
    /** Editorial grouping in the sidebar, e.g. "Active Flying", "Web Utilities". */
    project_category: z.string().optional(),
    /** Groups several posts under one project heading. */
    project_name: z.string().optional(),
  }),
});

const posts = defineCollection({
  loader: glob({
    base: './content/posts',
    pattern: '**/*.md',
    generateId: idFromSourcePath,
  }),
  schema: z.object({
    ...common,
    date: z.coerce.date().optional(),
  }),
});

const gallery = defineCollection({
  loader: glob({
    base: './content/gallery',
    pattern: '**/*.md',
    generateId: idFromSourcePath,
  }),
  schema: z.object({
    ...common,
    date: z.coerce.date().optional(),
    /** Site-absolute folder whose images fill the page's photo grid (`/assets/gallery/film`). */
    photos: z.string().optional(),
  }),
});

export const collections = { trips, projects, posts, gallery };
