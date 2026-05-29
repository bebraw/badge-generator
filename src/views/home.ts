import { escapeHtml } from "./shared";

const appTitle = "Future Frontend Badge Generator";
const sampleCsv = `name,company,type
Ada Lovelace,Analytical Engines,speaker
Grace Hopper,,organizer
Linus Torvalds,Linux Foundation,attendee`;

export function renderHomePage(routes: Array<{ path: string; purpose: string }>): string {
  void routes;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(appTitle)}</title>
    <link rel="stylesheet" href="/styles.css">
    <script type="module" src="/badge-app.js"></script>
  </head>
  <body class="min-h-screen bg-paper text-ink antialiased">
    <main class="workspace mx-auto grid w-[min(118rem,calc(100vw-2rem))] gap-5 px-0 py-5 lg:grid-cols-[22rem_minmax(34rem,1fr)_24rem]">
      <header class="lg:col-span-3">
        <div class="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 class="max-w-4xl text-4xl font-bold leading-[0.95] sm:text-6xl">${escapeHtml(appTitle)}</h1>
          </div>
          <div class="grid gap-1 text-sm text-muted sm:grid-cols-3 lg:min-w-[33rem]">
            <p><strong class="block text-ink">100 mm</strong> round coaster</p>
            <p><strong class="block text-ink">5 mm</strong> content safe margin</p>
            <p><strong class="block text-ink">A4</strong> role-separated PDFs</p>
          </div>
        </div>
      </header>

      <section class="control-panel" aria-labelledby="data-heading">
        <div class="panel-section">
          <h2 id="data-heading" class="panel-heading">Data</h2>
          <label class="field-label" for="csv-file">CSV file</label>
          <input id="csv-file" class="file-input" type="file" accept=".csv,text/csv">
          <label class="field-label mt-4" for="csv-input">CSV contents</label>
          <textarea id="csv-input" class="csv-input" spellcheck="false">${escapeHtml(sampleCsv)}</textarea>
          <button id="load-csv" class="primary-button" type="button">Update badges</button>
          <div id="csv-status" class="status-message" role="status" aria-live="polite">Sample data loaded.</div>
        </div>

        <div class="panel-section">
          <h2 class="panel-heading">Role PDFs</h2>
          <div class="print-buttons" aria-label="Print separate PDFs by role">
            <button class="secondary-button" type="button" data-print-role="speaker">Print speakers</button>
            <button class="secondary-button" type="button" data-print-role="organizer">Print organizers</button>
            <button class="secondary-button" type="button" data-print-role="attendee">Print attendees</button>
          </div>
        </div>

      </section>

      <section class="preview-stage" aria-labelledby="preview-heading">
        <div class="stage-toolbar">
          <div>
            <p class="panel-heading">Preview</p>
            <h2 id="preview-heading" class="text-2xl font-bold">Badge artwork</h2>
          </div>
          <div class="role-tabs" role="tablist" aria-label="Preview role">
            <button class="role-tab" type="button" data-preview-role="speaker" aria-selected="true">Speaker</button>
            <button class="role-tab" type="button" data-preview-role="organizer" aria-selected="false">Organizer</button>
            <button class="role-tab" type="button" data-preview-role="attendee" aria-selected="false">Attendee</button>
          </div>
        </div>
        <div id="badge-preview" class="badge-preview-shell" aria-live="polite"></div>
      </section>

      <aside class="control-panel" aria-labelledby="people-heading">
        <div class="panel-section">
          <h2 id="people-heading" class="panel-heading">Imported People</h2>
          <dl id="role-counts" class="role-counts"></dl>
        </div>
        <div class="panel-section overflow-hidden">
          <div id="people-list" class="people-list"></div>
        </div>
      </aside>
    </main>

    <section id="print-root" class="print-root" aria-hidden="true"></section>
  </body>
</html>`;
}
