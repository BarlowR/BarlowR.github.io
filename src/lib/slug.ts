/**
 * URL derivation for the Astro port of the Jekyll site.
 *
 * Every content entry keeps its *source path* (relative to its collection base,
 * without the file extension) as its collection `id` — see `src/content.config.ts`,
 * which overrides the glob loader's `generateId`. All public URLs are derived from
 * that id here so that the navigation and the route files can never disagree.
 *
 *   trips     `2023-05-17-black-mountain-2023-05/Black_Mountain20230517`
 *               -> `/trips/2023-05-17-black-mountain-2023-05/`
 *   projects  `Outdoor_Gear/Concertina_Bag/Concertina_Bag`
 *               -> `/projects/outdoor-gear/concertina-bag/`
 *   posts     `2023/09-12-running-around-in-the-mountains`
 *               -> `/posts/2023/running-around-in-the-mountains/`
 */

/**
 * Lowercase; turn spaces, underscores and ampersands into hyphens; drop every
 * other punctuation character; collapse and trim runs of hyphens.
 *
 *   `MacCready_Speed_to_Fly_Derivation`      -> `maccready-speed-to-fly-derivation`
 *   `Balancing_Speed_to_Fly_&_Risk_Tolerance` -> `balancing-speed-to-fly-risk-tolerance`
 *   `Original_Tarp_&_Bivy`                    -> `original-tarp-bivy`
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\s_&]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Split a collection id into its path segments. */
function segments(id: string): string[] {
  return id.split('/').filter(Boolean);
}

/**
 * Strip the `MM-DD-` (or `YYYY-MM-DD-`) prefix Jekyll-style post filenames carry.
 * `09-12-running-around-in-the-mountains` -> `running-around-in-the-mountains`
 */
export function stripDatePrefix(name: string): string {
  return name.replace(/^(\d{4}-)?\d{2}-\d{2}-/, '');
}

/** `/trips/<trip-directory>/` — the trip directory name is already URL-shaped. */
export function tripPath(id: string): string {
  const [dir] = segments(id);
  if (!dir) throw new Error(`Cannot derive a trip URL from id "${id}"`);
  return slugify(dir);
}

export function tripUrl(id: string): string {
  return `/trips/${tripPath(id)}/`;
}

/**
 * `/projects/<category-directory>/<project-directory>/`
 *
 * Note this uses the *directory* category (`Flying_Better`), not the front-matter
 * `project_category` (`Active Flying`), so the URL is stable even if the editorial
 * grouping in the sidebar is retitled.
 */
export function projectPath(id: string): string {
  const [category, project] = segments(id);
  if (!category || !project) {
    throw new Error(`Cannot derive a project URL from id "${id}"`);
  }
  return `${slugify(category)}/${slugify(project)}`;
}

export function projectUrl(id: string): string {
  return `/projects/${projectPath(id)}/`;
}

/** `/posts/<year>/<slug-of-filename-without-date-prefix>/` */
export function postPath(id: string): string {
  const parts = segments(id);
  const name = parts.pop();
  const year = parts.pop();
  if (!name || !year) throw new Error(`Cannot derive a post URL from id "${id}"`);
  return `${slugify(year)}/${slugify(stripDatePrefix(name))}`;
}

export function postUrl(id: string): string {
  return `/posts/${postPath(id)}/`;
}

/**
 * Jekyll drops any document with `published: false` from the build entirely, so
 * unpublished entries must never reach a route or the navigation.
 */
export function isPublished(entry: { data: { published?: boolean } }): boolean {
  return entry.data.published !== false;
}
